import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { bundle } from "../scripts/build.mjs";

const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

/** Every src file's text, keyed by path. Ported from Foresight tokens.test.ts (#72). */
const sources: Record<string, string> = Object.fromEntries(
  walk(SRC)
    .filter((file) => /\.(css|tsx?)$/.test(file))
    .map((file) => [file, readFileSync(file, "utf8")]),
);

const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\(/;

describe("design tokens", () => {
  it("raw color values live only in tokens.css", () => {
    const offenders = Object.entries(sources)
      .filter(([file]) => !file.endsWith("tokens.css"))
      .filter(([, text]) => RAW_COLOR.test(text))
      .map(([file]) => file);
    expect(Object.keys(sources).length).toBeGreaterThanOrEqual(3);
    expect(offenders).toEqual([]);
  });
});

// WCAG relative luminance and contrast ratio.
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

/** Token values of one scheme: the light block is the first `:root`, dark the one in the media query. */
function tokens(scheme: "light" | "dark"): Record<string, string> {
  const css = sources[join(SRC, "tokens.css")] ?? "";
  const [light = "", dark = ""] = css.split("@media screen and (prefers-color-scheme: dark)");
  const block = scheme === "light" ? light : dark;
  const values: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    if (name && value) values[name] = value;
  }
  return values;
}

describe.each(["light", "dark"] as const)("contrast (%s)", (scheme) => {
  const light = tokens("light");
  const t = { ...light, ...tokens(scheme) };
  const get = (name: string) => t[name] ?? "";
  const surfaces = ["color-canvas", "color-paper", "color-tint"];

  it.each([
    "color-text",
    "color-ink",
    "color-muted",
    "color-accent",
    "color-cat-ai",
    "color-cat-it",
  ])("%s is >= 4.5:1 on every surface", (fg) => {
    for (const bg of surfaces) {
      expect(contrast(get(fg), get(bg)), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("accent is >= 4.5:1 on the accent tint", () => {
    for (const bg of ["color-accent-tint"]) {
      expect(contrast(get("color-accent"), get(bg)), bg).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("primary button (canvas on ink) is >= 4.5:1", () => {
    expect(contrast(get("color-canvas"), get("color-ink"))).toBeGreaterThanOrEqual(4.5);
  });

  it("text on the accent fill is >= 4.5:1", () => {
    expect(contrast(get("color-on-accent"), get("color-accent"))).toBeGreaterThanOrEqual(4.5);
  });

  it("text stays readable on the accent tint", () => {
    expect(contrast(get("color-text"), get("color-accent-tint"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(get("color-muted"), get("color-accent-tint"))).toBeGreaterThanOrEqual(4.5);
  });
});

describe.each(["light", "dark"] as const)("social buttons (%s)", (scheme) => {
  const t = { ...tokens("light"), ...tokens(scheme) };
  const get = (name: string) => t[name] ?? "";

  it("Google label is >= 4.5:1 on its fill", () => {
    expect(contrast(get("color-google-text"), get("color-google-bg"))).toBeGreaterThanOrEqual(4.5);
  });

  it("Kakao label (black 85%) is >= 4.5:1 on yellow", () => {
    // black at 85% over the fill: each channel * 0.15
    const bg = get("color-kakao-bg");
    const blended =
      "#" +
      [1, 3, 5]
        .map((i) =>
          Math.round(parseInt(bg.slice(i, i + 2), 16) * 0.15)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("");
    expect(contrast(blended, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("line-strong follows ink (Foresight #88)", () => {
  it.each(["light", "dark"] as const)("%s", (scheme) => {
    const t = { ...tokens("light"), ...tokens(scheme) };
    expect(t["color-line-strong"]).toBe(t["color-ink"]);
  });
});

describe("class prefix", () => {
  // Every class selector in src (outside tokens) must start with sc-.
  it("src has no unprefixed class selectors", () => {
    const offenders: string[] = [];
    for (const [file, text] of Object.entries(sources)) {
      if (!file.endsWith(".css")) continue;
      const code = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/"[^"]*"/g, '""');
      for (const [, name] of code.matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)) {
        if (name && !name.startsWith("sc-")) offenders.push(`${file}: .${name}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("dist has no unprefixed class selectors", () => {
    const css = readFileSync(join(ROOT, "dist", "sandcorp.css"), "utf8");
    const code = css.replace(/"[^"]*"/g, '""');
    const offenders = [...code.matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)]
      .map((m) => m[1])
      .filter((name) => name && !name.startsWith("sc-"));
    expect(offenders).toEqual([]);
  });
});

describe("dist", () => {
  const dist = readFileSync(join(ROOT, "dist", "sandcorp.css"), "utf8");

  it("is up to date with src (run pnpm build and commit dist)", async () => {
    expect(dist).toBe(await bundle());
  });

  it("is self-contained: no @import and no external url()", () => {
    expect(dist).not.toMatch(/@import/);
    expect(dist).not.toMatch(/url\(\s*["']?(?:https?:)?\/\//);
  });

  it("carries the tokens", () => {
    expect(dist).toMatch(/--color-accent:\s*#1e3a8a/);
  });
});

describe.each(["light", "dark"] as const)("prose (%s)", (scheme) => {
  const t = { ...tokens("light"), ...tokens(scheme) };
  const get = (name: string) => t[name] ?? "";

  it("prose text is >= 4.5:1 on canvas and on the code/table tint", () => {
    for (const fg of ["color-text", "color-ink", "color-muted", "color-accent"]) {
      expect(contrast(get(fg), get("color-canvas")), `${fg} on canvas`).toBeGreaterThanOrEqual(4.5);
    }
    for (const fg of ["color-text", "color-ink", "color-muted"]) {
      expect(contrast(get(fg), get("color-tint")), `${fg} on tint`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("prose image rule (portfolio issue 149)", () => {
  // Original ratio, never cropped, never stretched: no fixed ratio, no cover, no width: 100%.
  const css = (sources[join(SRC, "components.css")] ?? "").replace(/\/\*[\s\S]*?\*\//g, "");
  const imageRules = [...css.matchAll(/([^{}]*\.sc-prose[^{}]*)\{([^}]*)\}/g)].filter(([, sel]) =>
    /img|figure|cover|gallery/.test(sel ?? ""),
  );

  it("finds the image rules", () => {
    expect(imageRules.length).toBeGreaterThan(0);
  });

  it(".sc-prose image rules have no aspect-ratio, object-fit: cover or width: 100%", () => {
    for (const [, sel, body] of imageRules) {
      expect(body, sel).not.toMatch(/aspect-ratio/);
      expect(body, sel).not.toMatch(/object-fit:\s*cover/);
      expect(body, sel).not.toMatch(/(^|[;\s])width:\s*100%/);
    }
  });
});

describe("font fallback faces (issue 15)", () => {
  const dist = readFileSync(join(ROOT, "dist", "sandcorp.css"), "utf8");
  const families = [
    "Pretendard Fallback",
    "Pretendard Fallback Apple",
    "Pretendard Fallback Win",
    "JetBrains Mono Fallback",
  ];

  it.each(families)("dist defines @font-face %s with local() sources only", (family) => {
    const faces = [...dist.matchAll(/@font-face\s*\{([^}]*)\}/g)]
      .map((m) => m[1] ?? "")
      .filter((body) => body.startsWith(`font-family:${family};`));
    expect(faces.length).toBeGreaterThan(0);
    for (const body of faces) {
      expect(body).toMatch(/size-adjust/);
      expect(body).toMatch(/local\(/);
      expect(body).not.toMatch(/url\(/);
    }
  });

  it("--font-sans and --font-mono carry the fallback families", () => {
    for (const name of ["font-sans", "font-mono"]) {
      const stack = new RegExp(`--${name}:([^;]*);`).exec(dist)?.[1] ?? "";
      for (const family of families.slice(0, 3)) expect(stack, name).toContain(family);
    }
    expect(/--font-mono:([^;]*);/.exec(dist)?.[1]).toContain("JetBrains Mono Fallback");
  });
});

describe("prose long words and tables (issue 15)", () => {
  const css = (sources[join(SRC, "components.css")] ?? "").replace(/\/\*[\s\S]*?\*\//g, "");

  it(".sc-prose wraps with break-word, never anywhere (anywhere narrows table columns)", () => {
    const body = /\.sc-prose\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(body).toMatch(/overflow-wrap:\s*break-word/);
    expect(css).not.toMatch(/overflow-wrap:\s*anywhere/);
  });

  it("tables scroll in .sc-prose-table-scroll and stay real tables", () => {
    expect(/\.sc-prose-table-scroll\s*\{([^}]*)\}/.exec(css)?.[1]).toMatch(/overflow-x:\s*auto/);
    expect(/\.sc-prose table\s*\{([^}]*)\}/.exec(css)?.[1]).not.toMatch(/display:\s*block/);
  });
});
