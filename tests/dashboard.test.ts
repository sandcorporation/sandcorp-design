// Dashboard elements (issue 21): status tokens, layout tokens, sc-* dashboard classes in dist.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const tokensCss = readFileSync(join(ROOT, "src", "tokens.css"), "utf8");
const dist = readFileSync(join(ROOT, "dist", "sandcorp.css"), "utf8");

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

function tokens(scheme: "light" | "dark"): Record<string, string> {
  const [light = "", dark = ""] = tokensCss.split("@media screen and (prefers-color-scheme: dark)");
  const values: Record<string, string> = {};
  for (const [, name, value] of (scheme === "light" ? light : dark).matchAll(
    /--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g,
  )) {
    if (name && value) values[name] = value;
  }
  return values;
}

const STATUS = ["success", "warning", "danger"] as const;

describe.each(["light", "dark"] as const)("status tokens (%s)", (scheme) => {
  const own = tokens(scheme);
  const t = { ...tokens("light"), ...own };
  const get = (name: string) => t[name] ?? "";

  it.each([
    "color-success",
    "color-success-tint",
    "color-warning",
    "color-warning-tint",
    "color-danger-tint",
  ])("%s is defined for this scheme", (name) => {
    expect(own[name], name).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it.each(STATUS)("%s text is >= 4.5:1 on its tint and on every surface", (kind) => {
    for (const bg of [`color-${kind}-tint`, "color-canvas", "color-paper", "color-tint"]) {
      expect(contrast(get(`color-${kind}`), get(bg)), `${kind} on ${bg}`).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });

  it.each(STATUS)("body text stays readable on the %s tint", (kind) => {
    for (const fg of ["color-text", "color-ink"]) {
      expect(contrast(get(fg), get(`color-${kind}-tint`)), fg).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("danger button (canvas on danger) is >= 4.5:1", () => {
    expect(contrast(get("color-canvas"), get("color-danger"))).toBeGreaterThanOrEqual(4.5);
  });

  it("toggle off (muted track) is >= 3:1 against the canvas and its knob", () => {
    expect(contrast(get("color-muted"), get("color-canvas"))).toBeGreaterThanOrEqual(3);
  });
});

describe("dashboard layout tokens", () => {
  it.each(["sidenav-width", "topbar-height"])("--%s is a px length", (name) => {
    expect(tokensCss).toMatch(new RegExp(`--${name}:\\s*\\d+px;`));
  });

  it("the scrim is a token (raw colors live only in tokens.css)", () => {
    expect(tokensCss).toMatch(/--color-scrim:\s*rgba\(/);
  });
});

describe("dashboard classes in dist", () => {
  const classes = [
    "sc-app",
    "sc-app-main",
    "sc-app-page",
    "sc-sidenav",
    "sc-sidenav-org",
    "sc-sidenav-heading",
    "sc-sidenav-item",
    "sc-sidenav-count",
    "sc-topbar",
    "sc-topbar-crumbs",
    "sc-topbar-account",
    "sc-page-head",
    "sc-page-head-title",
    "sc-tabs",
    "sc-table",
    "sc-table-scroll",
    "sc-num",
    "sc-table-row-link",
    "sc-table-detail",
    "sc-toolbar",
    "sc-toolbar-search",
    "sc-chip",
    "sc-stat",
    "sc-stat-value",
    "sc-meter",
    "sc-meter-fill",
    "sc-meter-mark",
    "sc-badge",
    "sc-badge--info",
    "sc-badge--success",
    "sc-badge--warning",
    "sc-badge--danger",
    "sc-badge--neutral",
    "sc-drawer",
    "sc-dialog",
    "sc-savebar",
    "sc-select",
    "sc-toggle",
    "sc-slider",
    "sc-token-input",
    "sc-token",
    "sc-token--invalid",
  ];

  it.each(classes)(".%s is built", (name) => {
    expect(dist).toMatch(new RegExp(`\\.${name}(?![\\w-])`));
  });

  it("current nav item and current tab are keyed on aria-current", () => {
    expect(dist).toMatch(/\.sc-sidenav-item\[aria-current/);
    expect(dist).toMatch(/\.sc-tabs a\[aria-current/);
  });

  it("chips, toggles and drawers use their ARIA/native state", () => {
    expect(dist).toMatch(/\.sc-chip\[aria-pressed=(?:"true"|true)\]/);
    expect(dist).toMatch(/\.sc-toggle:checked/);
    expect(dist).toMatch(/\.sc-toggle\[aria-checked=(?:"true"|true)\]/);
    expect(dist).toMatch(/\.sc-drawer::backdrop/);
  });

  it("closed <dialog> drawers stay hidden (display only when [open])", () => {
    const shown = [...dist.matchAll(/([^{}]*)\{[^}]*display:\s*flex[^}]*\}/g)].map(
      (m) => m[1] ?? "",
    );
    for (const sel of shown) {
      for (const part of sel.split(",")) {
        if (/\.sc-(drawer|dialog)$/.test(part.trim()))
          throw new Error(`${part} shows a closed dialog`);
      }
    }
  });

  it("sidenav collapses to icons under 1180px and becomes a top bar under 720px", () => {
    expect(dist).toMatch(/@media ?\(max-width:\s*1180px\)\{[^@]*\.sc-sidenav\{[^}]*width:/);
    expect(dist).toMatch(
      /@media ?\(max-width:\s*720px\)\{[^@]*\.sc-app\{[^}]*flex-direction:\s*column/,
    );
  });
});
