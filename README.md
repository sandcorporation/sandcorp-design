# sandcorp-design

Sandcorp 공통 디자인: CSS 토큰과 클래스 컴포넌트. 흰색·검정·네이비, 카드 없는 hairline 레이아웃, 다크 모드는 토큰 값 반전.
React 컴포넌트는 넣지 않는다. Flow의 산업용 테마도 넣지 않는다.

## 담는 것

| 파일                | 내용                                                                  |
| ------------------- | --------------------------------------------------------------------- |
| `src/tokens.css`    | 색·글꼴 스택·크기·간격 토큰. 원시 색은 여기에만 있다.                 |
| `src/base.css`      | 리셋, 본문, 링크, 포커스 링                                           |
| `src/index.css`     | 진입점(tokens + base)                                                 |
| `src/fonts.css`     | Pretendard·JetBrains Mono 자체 호스팅 import (Vite용, 번들에 안 넣음) |
| `dist/sandcorp.css` | 위를 하나로 묶고 압축한 것. **커밋한다**(빌드 없이 쓰려는 것)         |

## 쓰는 법

### Vite 앱

```sh
pnpm add github:sandcorporation/sandcorp-design#v0.1.0
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
# 사용: scripts/sync-design.sh v0.1.0
set -euo pipefail
TAG="${1:?태그 필요 (예: v0.1.0)}"
DEST="backend/static/design"   # 앱의 static 경로로 바꾼다
mkdir -p "$DEST"
curl -fsSL "https://raw.githubusercontent.com/sandcorporation/sandcorp-design/${TAG}/dist/sandcorp.css" \
  -o "${DEST}/sandcorp.css"
echo "${TAG}" > "${DEST}/VERSION"
```

템플릿에서는 `<link rel="stylesheet" href="{% static 'design/sandcorp.css' %}">`. 복사한 파일은 커밋하고, 올릴 때는 태그만 바꿔 다시 돌린다.

### 글꼴

- `dist/sandcorp.css`는 글꼴 파일을 담지 않는다. Pretendard 동적 서브셋은 woff2가 수백 개라 `dist/fonts/`로 커밋하기에 너무 크다(결정).
- Vite 앱: `sandcorp-design/fonts.css`가 npm `pretendard`·`@fontsource-variable/jetbrains-mono`를 import해 번들한다.
- Django 앱: 글꼴을 따로 싣지 않으면 `--font-sans` 스택이 시스템 한글 글꼴(Apple SD Gothic Neo, Malgun Gothic)로 떨어진다. 꼭 필요하면 앱이 `pretendard`(npm)의 `dist/web/variable/woff2-dynamic-subset/`와 JetBrains Mono 파일을 자기 static에 두고 `@font-face`를 쓴다. 필요가 생기면 이 저장소에 `dist/fonts/` 서브셋을 더하는 티켓을 만든다.

## 버전 규칙

semver 태그(`vX.Y.Z`). 토큰 이름을 바꾸거나 지우면 **major**, 토큰·클래스를 더하면 minor, 값만 고치면 patch(색 값은 대비 시험을 통과해야 한다). 소비자는 항상 태그로 고정한다.
강조색 교체는 `--color-accent`·`--color-accent-tint`·`--color-focus`의 라이트·다크 여섯 값만 바꾼다.

## 개발

`CLAUDE.md` 참고. `pnpm check` = 빌드 → dist 변경 없음 확인 → 시험 → 포맷 검사.
`examples/index.html`은 `dist/sandcorp.css`만 붙인 견본이다.
