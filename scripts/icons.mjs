// assets/flow/*.svg 에서 PNG·ICO를 만든다. 결과는 커밋한다(`pnpm icons`, `pnpm check`가 최신 여부를 본다).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import pngToIco from "png-to-ico";

const INK = "#1b1d24";

/** 마크 본체(32×32): 언덕 둘 + 제품 단서. icon.svg의 안쪽을 그대로 쓴다. */
function inner(svg) {
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
}

/** 사각형 전체를 채우는 변형(마스크는 OS가 씌운다). scale<1이면 가장자리를 비워 안전 영역을 만든다. */
function padded(svg, scale) {
  const body = inner(svg).replace(/<rect[^>]*\/>/, "");
  const offset = (32 - 32 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${INK}"/><g transform="translate(${offset} ${offset}) scale(${scale})" clip-path="url(#c)"><clipPath id="c"><rect width="32" height="32" rx="2"/></clipPath>${body}</g></svg>`;
}

function png(svg, size) {
  return new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();
}

/** 모든 산출물을 {경로: Buffer}로 돌려준다(시험이 같은 함수를 써서 최신 여부를 본다). */
export async function generate(dir = "assets/flow") {
  const icon = readFileSync(`${dir}/icon.svg`, "utf8");
  // favicon은 라이트(밝은 탭) 기준 색, 바탕 포함 모서리 둥근 마크
  const out = {};
  out[`${dir}/favicon-32.png`] = png(icon, 32);
  out[`${dir}/favicon.ico`] = await pngToIco([png(icon, 16), png(icon, 32)]);
  // 홈 화면 아이콘: 전체 면 채움, iOS는 모서리를 직접 깎는다
  out[`${dir}/apple-touch-icon.png`] = png(padded(icon, 1), 180);
  // maskable: 중앙 80% 원 안에 들어오도록 마크를 72%로 줄이고 바탕을 채운다
  out[`${dir}/icon-192.png`] = png(padded(icon, 0.72), 192);
  out[`${dir}/icon-512.png`] = png(padded(icon, 0.72), 512);
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync("assets/flow", { recursive: true });
  for (const [path, data] of Object.entries(await generate())) writeFileSync(path, data);
}
