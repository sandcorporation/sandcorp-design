import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { generate } from "../scripts/icons.mjs";

const ROOT = join(__dirname, "..");
const read = (p: string) => readFileSync(join(ROOT, p));

const SVGS = [
  "assets/mark.svg",
  "assets/mark-dark.svg",
  "assets/logo.svg",
  "assets/logo-dark.svg",
  "assets/flow/icon.svg",
  "assets/flow/favicon.svg",
];

describe("brand assets", () => {
  it.each(SVGS)("%s is a well-formed SVG with a viewBox", (path) => {
    expect(existsSync(join(ROOT, path))).toBe(true);
    const text = read(path).toString("utf8");
    expect(text).toMatch(
      /^<svg [^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*viewBox="0 0 \d+ 32"/,
    );
    expect(text.trim().endsWith("</svg>")).toBe(true);
    // 여는 태그와 닫는 태그(자기 닫힘 제외) 수가 같다
    const open = (text.match(/<(?!\/|\?|!)[a-zA-Z][^>]*[^/]>/g) ?? []).length;
    const close = (text.match(/<\/[a-zA-Z]+>/g) ?? []).length;
    expect(open).toBe(close);
  });

  it("SVG literals match the brand tokens", () => {
    const css = read("src/tokens.css").toString("utf8");
    const token = (n: string) =>
      css.match(new RegExp(`--color-brand-${n}:\\s*(#[0-9a-f]{6})`))?.[1];
    const mark = read("assets/mark.svg").toString("utf8");
    expect(mark).toContain(`fill="${token("ink")}"`);
    expect(mark).toContain(`fill="${token("dune-far")}"`);
    expect(mark).toContain(`fill="${token("dune-near")}"`);
    expect(read("assets/mark-dark.svg").toString("utf8")).toContain(`fill="${token("sand")}"`);
  });

  it("PNG sizes", () => {
    const sizes: Record<string, number> = {
      "favicon-32.png": 32,
      "apple-touch-icon.png": 180,
      "icon-192.png": 192,
      "icon-512.png": 512,
    };
    for (const [file, size] of Object.entries(sizes)) {
      const buf = read(`assets/flow/${file}`);
      expect(buf.subarray(1, 4).toString()).toBe("PNG");
      expect([buf.readUInt32BE(16), buf.readUInt32BE(20)], file).toEqual([size, size]);
    }
  });

  it("favicon.ico holds 16 and 32", () => {
    const buf = read("assets/flow/favicon.ico");
    expect(buf.readUInt16LE(2)).toBe(1); // ICO
    const count = buf.readUInt16LE(4);
    const dims = Array.from({ length: count }, (_, i) => buf[6 + i * 16] || 256).sort(
      (a, b) => a - b,
    );
    expect(dims).toEqual([16, 32]);
  });

  it("manifest lists the 192 and 512 icons that exist", () => {
    const m = JSON.parse(read("assets/flow/site.webmanifest").toString("utf8"));
    const srcs = m.icons.map((i: { src: string }) => i.src).sort();
    expect(srcs).toEqual(["icon-192.png", "icon-512.png"]);
    for (const s of srcs) expect(existsSync(join(ROOT, "assets/flow", s))).toBe(true);
  });

  it("committed PNG/ICO are up to date with the SVG source", async () => {
    for (const [path, data] of Object.entries(await generate())) {
      expect(Buffer.compare(read(path), data), path).toBe(0);
    }
  });
});
