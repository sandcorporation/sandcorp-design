# sandcorp-design

Sandcorp 앱들이 공유하는 CSS 토큰과 클래스 컴포넌트. 배포는 git 태그(`vX.Y.Z`)이고 **`dist/`는 커밋한다**(git 의존·Django 복사가 빌드 없이 되게). 사용법과 버전 규칙은 `README.md`.

## 명령 (저장소 루트, pnpm)

- `pnpm build`: `src/index.css`를 묶고 압축해 `dist/sandcorp.css`를 쓴다. `src/`를 바꾸면 반드시 돌리고 dist를 같이 커밋한다(시험이 최신 여부를 본다).
- `pnpm test`: vitest(`tests/`). 원시 색은 `src/tokens.css`에만, 대비 4.5:1(라이트·다크), dist 최신·자기완결.
- `pnpm lint`: prettier `--check`. 고치기 `pnpm format`.
- `pnpm check`: 빌드, `git diff --exit-code dist`, 시험, 린트. PR 전에 통과해야 한다.

## 규칙

- 원시 색(`#hex`, `rgb()` 등)은 `src/tokens.css`에만. 나머지는 `var(--color-*)`. 새 색은 토큰으로 더하고 대비 시험에 올린다.
- 토큰 이름을 바꾸거나 지우면 major. 값은 소비자 저장소(Foresight, portfolio)와 같게 유지한다.
- 글꼴 파일은 dist에 싣지 않는다(`src/fonts.css`는 Vite용, 번들 제외). 결정 근거는 README.
- pnpm 11이라 빌드 스크립트 허용은 `pnpm-workspace.yaml`의 `allowBuilds`.

## 작업 흐름

- 이슈마다 워크트리 `~/workspace/sandcorp-design-wt/<브랜치>`에서 작업하고 `origin/main`으로 PR을 연다. main 직접 push 금지.
- PR CI는 없다. 로컬 `pnpm check` 통과 후 작업자가 squash 병합한다.
- 병합 뒤 릴리스는 `git tag vX.Y.Z && git push origin vX.Y.Z`(package.json `version`도 맞춘다).
- 화면 견본(`examples/index.html`) 증거는 Playwright로 라이트·다크 스크린샷을 찍어 PR에 남기되 이미지 파일은 커밋하지 않는다.
- 배포·서버 설정은 이 저장소 밖(조율자)이다.
