# sandcorp-design

Sandcorp 공통 디자인: CSS 토큰과 클래스 컴포넌트. 흰색·검정·네이비, 카드 없는 hairline 레이아웃, 다크 모드는 토큰 값 반전.
React 컴포넌트는 넣지 않는다. Flow의 산업용 테마도 넣지 않는다.

## 담는 것

| 파일                 | 내용                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `src/tokens.css`     | 색·글꼴 스택·크기·간격 토큰. 원시 색은 여기에만 있다.                 |
| `src/base.css`       | 리셋, 본문, 링크, 포커스 링                                           |
| `src/components.css` | 클래스 컴포넌트(`.sc-prose` 본문 포함, 아래 목록)                     |
| `src/dashboard.css`  | 대시보드 요소(앱 골격·표·탭·배지·서랍·저장 막대 등, v0.8.0)           |
| `src/index.css`      | 진입점(tokens + base + components + dashboard)                        |
| `src/fallback.css`   | 대체 글꼴 metric `@font-face`(local() 전용, 번들에 들어감, v0.6.0)    |
| `src/fonts.css`      | Pretendard·JetBrains Mono 자체 호스팅 import (Vite용, 번들에 안 넣음) |
| `dist/sandcorp.css`  | 위를 하나로 묶고 압축한 것. **커밋한다**(빌드 없이 쓰려는 것)         |

## 쓰는 법

### Vite 앱

```sh
pnpm add github:sandcorporation/sandcorp-design#v0.3.1
```

```ts
import "sandcorp-design/css"; // dist/sandcorp.css
import "sandcorp-design/fonts.css"; // 글꼴(외부 요청 없음)
```

토큰만 필요하면 `sandcorp-design/tokens.css`. 색은 항상 `var(--color-*)`로 쓰고 앱 CSS에 원시 색을 쓰지 않는다.

### Django 앱 (sandcorp-auth 등)

빌드된 CSS를 태그 고정으로 받아 자기 static에 복사한다. `scripts/sync-design.sh` 예시:

```sh
#!/usr/bin/env bash
# 사용: scripts/sync-design.sh v0.3.1
set -euo pipefail
TAG="${1:?태그 필요 (예: v0.3.1)}"
DEST="backend/static/design"   # 앱의 static 경로로 바꾼다
mkdir -p "$DEST"
curl -fsSL "https://raw.githubusercontent.com/sandcorporation/sandcorp-design/${TAG}/dist/sandcorp.css" \
  -o "${DEST}/sandcorp.css"
echo "${TAG}" > "${DEST}/VERSION"
```

템플릿에서는 `<link rel="stylesheet" href="{% static 'design/sandcorp.css' %}">`. 복사한 파일은 커밋하고, 올릴 때는 태그만 바꿔 다시 돌린다.

## 클래스 컴포넌트 (v0.3.1)

모든 클래스는 `sc-` 접두사가 붙는다(소비 앱 클래스와 충돌 방지, v0.2.0의 접두사 없는 이름은 폐기). 모두 JS 없이 동작한다(견본: `examples/index.html`). 색은 토큰만 쓴다.

| 클래스                                                                                                 | 용도                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.sc-label`                                                                                            | 모노 대문자 라벨                                                                                                                                                                                                                   |
| `.sc-section` / `.sc-section-head` / `.sc-section-title`                                               | 섹션 문법(위 여백, 굵은 hairline 머리)                                                                                                                                                                                             |
| `.sc-masthead` > `.sc-masthead-row` (`.sc-brand`, `.sc-masthead-meta`) + `.sc-nav` (`a[aria-current]`) | 머리띠와 내비(v0.7.0). 로고 줄은 `--masthead-height`(56px) 고정·세로 가운데, 메뉴 링크 위아래 12px·간격 `--space-6`(portfolio와 같다). 767px 이하에서는 `.sc-masthead-meta`를 숨긴다(portfolio의 `masthead-desc` 숨김과 같은 방식) |
| `.sc-btn` (+ `--accent` `--secondary` `--sm` `--block`, `disabled`)                                    | 버튼. 기본은 ink 바탕                                                                                                                                                                                                              |
| `.sc-field` > `.sc-field-label` + `.sc-input` + `.sc-field-hint`/`.sc-field-error`                     | 입력. 오류는 `aria-invalid="true"` 또는 `.sc-field--error`                                                                                                                                                                         |
| `.sc-list` > `li` (`.sc-list-title`, `.sc-list-meta`)                                                  | hairline 목록                                                                                                                                                                                                                      |
| `.sc-alert` (+ `--error`), `.sc-alert-title`                                                           | 알림. 안내는 `role="status"`, 오류는 `role="alert"`                                                                                                                                                                                |
| `.sc-btn-social.sc-btn-google`, `.sc-btn-social.sc-btn-kakao`                                          | 소셜 로그인 버튼                                                                                                                                                                                                                   |
| `.sc-visually-hidden`                                                                                  | 화면 밖 텍스트                                                                                                                                                                                                                     |
| `.sc-prose` (+ `.sc-prose-gallery`, `.sc-prose-callout`(`data-kind="warning"`), `.sc-prose-cover`)     | 본문 타이포그래피(v0.5.0). 이미지는 원본 비율·잘림 없음. 표는 `.sc-prose-table-scroll`로 감싼다, 콜아웃 제목은 `.sc-prose-callout-kind` + `<strong>`(v0.6.0). 감싸개 없는 표(html 블록)는 표가 스스로 가로 스크롤한다(v0.6.1)      |

### 소셜 로그인 버튼

- Google: [Sign in with Google 브랜딩 지침](https://developers.google.com/identity/branding-guidelines) 값(라이트 `#FFFFFF`/선 `#747775`/글자 `#1F1F1F`, 다크 `#131314`/`#8E918F`/`#E3E3E3`, 1px 안쪽 선, 14/20 medium)을 `--color-google-*` 토큰으로 두고 색 구성표에 따라 라이트·다크 변형이 바뀐다. 문구는 「Google로 계속하기」. G 로고는 공식 번들 그대로(색 변형 없음).
- Kakao: [카카오 로그인 디자인 가이드](https://developers.kakao.com/docs/ko/kakaologin/design-guide) 값(배경 `#FEE500`, 심볼 `#000000` 85% 투명도, 글자 검정 85%, 모서리 12px)을 `--color-kakao-*` 토큰으로 둔다. 문구는 「카카오 로그인」(축약 「로그인」).
- 로고 SVG 출처(공식 파일, 2026-10-24 받음): Google G는 [Sign in with Google 브랜딩 번들](https://developers.google.com/static/identity/images/signin-assets.zip)(Android + Web/Light/Square, 글자 없음)에서 배경을 빼고 G만 인라인한 것이다(그라디언트 G, 4색 단색 경로 아님). Kakao 심볼은 [카카오 개발자 도구 > 리소스 다운로드](https://developers.kakao.com/tool/resource/login)의 `Kakao Login.zip` SVG(`kakao_login_kr_medium.svg`)에서 말풍선 경로만 잘라 viewBox를 맞춘 것이다. 각 사의 상표 사용 지침을 지키는 조건이며 비율·색은 바꾸지 않는다.
- `.sc-btn-social`은 폭 100%다. 앱이 감싸서 폭을 정한다.

### 글꼴

- `dist/sandcorp.css`는 글꼴 파일을 담지 않는다. Pretendard 동적 서브셋은 woff2가 수백 개라 `dist/fonts/`로 커밋하기에 너무 크다(결정).
- 대체 face(`Pretendard Fallback`·`… Apple`·`… Win`·`JetBrains Mono Fallback`)는 `local()`만 쓰므로 dist에 들어 있고 `--font-sans`·`--font-mono`가 품는다. 글꼴이 늦게 와도 줄 폭이 거의 안 변한다(v0.6.0).
- Vite 앱: `sandcorp-design/fonts.css`가 npm `pretendard`·`@fontsource-variable/jetbrains-mono`를 import해 번들한다.
- Django 앱: 글꼴을 따로 싣지 않으면 `--font-sans` 스택이 시스템 한글 글꼴(Apple SD Gothic Neo, Malgun Gothic)로 떨어진다. 꼭 필요하면 앱이 `pretendard`(npm)의 `dist/web/variable/woff2-dynamic-subset/`와 JetBrains Mono 파일을 자기 static에 두고 `@font-face`를 쓴다. 필요가 생기면 이 저장소에 `dist/fonts/` 서브셋을 더하는 티켓을 만든다.

## 대시보드 요소 (v0.8.0)

관리 화면(promptlab 대시보드, flow·metrics 관리)용. 견본은 `examples/dashboard.html`(시험 목록 · 응시자 표 + 서랍 · 문제 편집 · 설정 저장 막대, `#exams`·`#results`·`#problem`·`#settings`, `?open=invite`·`?open=confirm`). 시안의 임시 이름(`.side`·`.n`·`.tile`·`.num` 등)은 쓰지 않고 아래 `sc-*`만 쓴다(모든 클래스는 `sc-` 접두사라 `.num`은 `.sc-num`).

**토큰**: 상태 색 `--color-success`·`--color-success-tint`·`--color-warning`·`--color-warning-tint`·`--color-danger-tint`(기존 `--color-danger`와 짝, 라이트·다크 모두 글자↔tint 4.5:1 이상), 배경 막 `--color-scrim`, 치수 `--sidenav-width`(232px)·`--topbar-height`(56px).

| 클래스                                                                                                                         | 용도                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.sc-app` > `.sc-sidenav` + `.sc-app-main` > `.sc-topbar` + `.sc-app-page`                                                     | 앱 골격. 본문 14px. 1180px 아래 메뉴는 아이콘만(이름은 화면 밖으로 숨겨 읽기 프로그램엔 남는다, 링크에 `title`을 달 것), 720px 아래 위 가로 막대                     |
| `.sc-sidenav-org` (`.sc-sidenav-mark`, `.sc-sidenav-org-text` > `small`)                                                       | 조직 전환 단추(`<button aria-haspopup="menu">`). 메뉴 자체는 소비자 몫                                                                                               |
| `.sc-sidenav-heading`, `.sc-sidenav-item` (`svg` + `.sc-sidenav-label` + `.sc-sidenav-count`)                                  | 묶음 제목(mono 대문자), 항목. 현재 항목은 `aria-current="page"` → accent tint + 왼쪽 2px 선(휴대폰은 아래 선)                                                        |
| `.sc-topbar` > `nav` > `ol.sc-topbar-crumbs` + `.sc-topbar-account` (`.sc-topbar-avatar`, `.sc-topbar-account-text` > `small`) | 이동 경로(마지막은 `aria-current="page"`, 길면 말줄임)와 계정 메뉴 단추(`aria-haspopup="menu"`·`aria-expanded`). 로그아웃은 그 메뉴 안에 둔다                        |
| `.sc-page-head` (`.sc-page-head-title`, `.sc-page-head-sub`, `.sc-page-head-actions`)                                          | 페이지 머리: 제목(+ 배지), 보조 줄, 주 버튼. 아래 `--color-line-strong` 선                                                                                           |
| `nav.sc-tabs` > `a[aria-current="page"]` (+ `.sc-tabs-count`)                                                                  | 링크 탭(페이지 이동). 좁으면 가로로 민다                                                                                                                             |
| `.sc-panel` (`.sc-panel-section`, `.sc-panel-title`), `.sc-split` > … + `.sc-split-rail`                                       | 가는 선 상자, 편집 칸 + 오른쪽 380px 고정(sticky) 점검 패널. 1280px 아래 한 줄로 쌓인다                                                                              |
| `.sc-table-scroll` > `table.sc-table`                                                                                          | 표. 머리 mono 대문자 11px + 굵은 선, 숫자 칸 `.sc-num`(오른쪽·tabular-nums), 한국어는 낱말 단위로 줄바꿈하고 좁으면 감싸개가 가로 스크롤                             |
| `tr.sc-table-row-link`, `.sc-table-sub`                                                                                        | 누르는 줄(hover paper). 첫 칸에 진짜 `<a>`를 두고(키보드) 줄 클릭은 JS로 그 링크를 누른다. `.sc-table-sub`는 칸 안 보조 줄                                           |
| `tr.sc-table-row--open` + `tr.sc-table-detail` > `td[colspan]` > `.sc-table-detail-panel`                                      | 줄 펼침(편집 행). 여는 단추에 `aria-expanded`·`aria-controls`. `tr[aria-selected="true"]`도 accent tint                                                              |
| `.sc-toolbar` (`.sc-toolbar-chips`, `label.sc-toolbar-search` > `svg` + `input`)                                               | 거름 칩 + 찾기 칸. 찾기 칸에 `.sc-visually-hidden` 이름을 둔다                                                                                                       |
| `button.sc-chip[aria-pressed]` (+ `.sc-chip-count`)                                                                            | 거름 칩. 켜짐(`aria-pressed="true"`)은 ink 바탕                                                                                                                      |
| `dl.sc-stat` > `.sc-stat-item` > `dt.sc-stat-label` + `dd.sc-stat-value` (+ `dd.sc-stat-note`)                                 | 요약 타일 줄. 가는 선으로 나뉘고 폭에 따라 줄을 바꾼다                                                                                                               |
| `.sc-meter` (+ `--lg`, `--success` `--warning` `--danger`) > `.sc-meter-fill` + `.sc-meter-mark`                               | 진행 막대. 값은 `style="--sc-value: 67%"`, 기준선·문턱 표시는 `.sc-meter-mark`의 `--sc-at`. `role="meter"`(또는 `progressbar`)와 `aria-valuenow`·`aria-label`을 단다 |
| `.sc-badge` + `--info` `--success` `--warning` `--danger` `--neutral`                                                          | 상태 배지. `.sc-tone-success`·`-warning`·`-danger`는 글자 색만(증감·통과/실패)                                                                                       |
| `dialog.sc-drawer` > `.sc-drawer-head` (`.sc-drawer-title`, `.sc-icon-btn`) + `.sc-drawer-body` + `.sc-drawer-foot`            | 오른쪽 서랍(440px, 휴대폰은 전체 폭). 배경 막은 `::backdrop`                                                                                                         |
| `dialog.sc-dialog` > `.sc-dialog-body` (`.sc-dialog-title`) + `.sc-dialog-foot`                                                | 확인 상자. 지우기·보관처럼 되돌리기 어려운 동작은 `.sc-btn--danger`                                                                                                  |
| `.sc-savebar` (`.sc-savebar-text`, `.sc-savebar-actions`)                                                                      | 「저장하지 않은 변경 n개」 아래 고정 막대. `.sc-app-page`의 마지막 자식으로 두면 페이지 폭을 채운다. 변경이 없으면 `hidden`. 글에 `role="status"`                    |
| `select.sc-select`                                                                                                             | 조밀한 선택(36px). 화살표는 그림 없이 `currentColor`                                                                                                                 |
| `input[type=checkbox][role=switch].sc-toggle` (또는 `button[role=switch][aria-checked]`)                                       | 스위치. 꺼짐은 muted 바탕(3:1 이상)                                                                                                                                  |
| `input[type=range].sc-slider` (+ `--split`)                                                                                    | 슬라이더. 채움은 `--sc-value`(JS가 `input`마다 갱신). `--split`은 비율(A : B)로 나머지를 `--color-cat-it`로 칠한다                                                   |
| `.sc-token-input` > `.sc-token` (+ `--invalid`, `.sc-token-remove`) + `input.sc-token-input-field`                             | 이메일 여러 개. 잘못된 토큰은 `--invalid`(danger). 지우기 단추에 `aria-label`. 나누기(Enter·쉼표)·검증은 소비자 JS                                                   |
| `.sc-btn--danger`, `.sc-icon-btn`                                                                                              | 위험 동작 버튼, 아이콘만 있는 단추(닫기 ✕, `aria-label` 필수)                                                                                                        |

### 키보드와 겹침 (소비자 몫)

CSS만 싣는다. 동작은 앱이 이렇게 붙인다(견본 `examples/dashboard.html` 끝의 스크립트가 예).

- **서랍·확인 상자**: 네이티브 `<dialog>`를 `showModal()`로 연다. 그러면 브라우저가 포커스를 상자 안 첫 요소(또는 `autofocus`)로 옮기고, 밖으로 나가지 않게 가두고, **Esc로 닫고**, 닫으면 연 단추로 포커스를 돌려준다. 닫기 단추는 `<form method="dialog">` 안에 두면 JS가 필요 없다. 배경 막을 눌러 닫으려면 `dialog`의 `click`에서 `e.target === dialog`일 때 `close()`. 확인 상자는 안전한 쪽(취소)에 `autofocus`.
- **탭**: `.sc-tabs`는 링크 탭이라 Tab 키로 차례로 간다(화살표 이동이 필요 없다). 한 페이지 안에서 패널을 바꾸는 탭이 필요하면 `role="tablist"`/`tab`/`tabpanel`과 좌우 화살표·`aria-selected`를 앱이 붙인다(스타일은 `aria-current`와 같게 맞출 것).
- **줄 펼침**: 여는 단추에 `aria-expanded`, `aria-controls="<펼친 tr id>"`. 펼친 뒤 첫 입력으로 포커스를 옮기고, Esc로 접으면 단추로 돌려준다.
- **칩·스위치**: 칩은 `<button aria-pressed>`, 스위치는 `role="switch"` 체크박스 — 스페이스로 바뀐다.
- **저장 막대**: 떠날 때 `beforeunload`로 막는 것은 앱이 정한다.

## 로고·아이콘 (v0.4.0)

`assets/`의 SVG·PNG·ICO. 원본 모양은 portfolio의 마크(정사각형 안의 모래언덕 둘, 32×32, rx 2)를 그대로 옮겼다.

| 파일                                                | 용도                                                           |
| --------------------------------------------------- | -------------------------------------------------------------- |
| `assets/mark.svg`, `mark-dark.svg`                  | 마크만. `-dark`는 어두운 배경용(바탕을 `--color-brand-sand`로) |
| `assets/logo.svg`, `logo-dark.svg`                  | 마크 + 「Sandcorp」(글꼴 Pretendard, 없으면 system-ui)         |
| `assets/flow/icon.svg`                              | Flow 제품 아이콘(마크 + 흐름 선과 노드 둘)                     |
| `assets/flow/favicon.svg`                           | Flow favicon. 다크 모드에서 바탕·단서 색이 뒤바뀐다            |
| `assets/flow/favicon.ico` (16·32), `favicon-32.png` | 구형 브라우저·탭                                               |
| `assets/flow/apple-touch-icon.png` (180)            | iOS 홈 화면(전면 채움, iOS가 모서리를 깎는다)                  |
| `assets/flow/icon-192.png`, `icon-512.png`          | PWA, maskable(마크를 72%로 줄여 안전 영역 확보)                |
| `assets/flow/site.webmanifest`                      | 예시. 앱이 name·색을 고쳐 쓴다                                 |

사용: Vite는 `import mark from "sandcorp-design/assets/mark.svg"`. Django는 `scripts/sync-design.sh`처럼 `assets/`를 앱 static으로 복사한다. 태그로 고정한다.

**색 예외**: CSS 원시 색은 `src/tokens.css`에만이라는 규칙은 그대로지만, SVG 자산은 단독 파일로 쓰이므로 리터럴 색을 품는다. 같은 값이 `--color-brand-ink`·`-sand`·`-dune-far`·`-dune-near` 토큰에 있고, 시험이 둘이 어긋나지 않는지 본다. 브랜드 색은 글자 색이 아니라 그림이라 4.5:1 대비 시험 대상이 아니다(글자에는 `--color-ink` 등을 쓴다).

**제품 아이콘 규칙**(news·portfolio·metrics 등도 같게): `assets/<제품>/icon.svg` = 마크에 제품 단서 **하나**만 얹는다. 단서는 하늘 영역(위쪽 1/3)에 `--color-brand-sand` 색으로 두고, 두꺼운 선(2)과 큰 점(반지름 2.8)으로 16px에서도 읽히게 한다. `favicon.svg`는 같은 그림에 다크 모드 `@media`를 더한다. PNG·ICO는 `pnpm icons`(`scripts/icons.mjs`)가 `icon.svg`에서 만들고 커밋한다. Flow의 단서는 「꺾이는 흐름 선과 시작·끝 노드」: 곡선 단서는 16px에서 아령처럼 뭉쳐 보여 꺾이는 선으로 바꿨다.

## 버전 규칙

semver 태그(`vX.Y.Z`). 토큰 이름을 바꾸거나 지우면 **major**, 토큰·클래스를 더하면 minor, 값만 고치면 patch(색 값은 대비 시험을 통과해야 한다). 소비자는 항상 태그로 고정한다.
강조색 교체는 `--color-accent`·`--color-accent-tint`·`--color-focus`의 라이트·다크 여섯 값만 바꾼다.

## 개발

`CLAUDE.md` 참고. `pnpm check` = 빌드 → 아이콘 생성 → dist·assets 변경 없음 확인 → 시험 → 포맷 검사.
`examples/index.html`·`examples/dashboard.html`은 `dist/sandcorp.css`만 붙인 견본이다.
