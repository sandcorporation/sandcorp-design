// src/index.css를 하나로 묶고 압축해 dist/sandcorp.css를 쓴다. dist는 커밋한다.
import { mkdirSync, writeFileSync } from "node:fs";
import { build } from "esbuild";

export async function bundle() {
  const result = await build({
    entryPoints: ["src/index.css"],
    bundle: true,
    minify: true,
    write: false,
    logLevel: "silent",
    target: ["chrome100", "safari15", "firefox100"],
  });
  return result.outputFiles[0].text;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync("dist", { recursive: true });
  writeFileSync("dist/sandcorp.css", await bundle());
}
