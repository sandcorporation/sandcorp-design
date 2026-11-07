# Changelog

소비자는 태그(`vX.Y.Z`)를 고정해 복사한다. 버전 규칙은 README 「버전 규칙」. v0.7.0 이전 기록은 git 태그와 커밋 메시지에 있다.

## v0.8.0 — 대시보드 요소 (#21)

기존 토큰·클래스는 바꾸거나 지우지 않았다(minor).

### 더한 토큰

- 상태 색: `--color-success`, `--color-success-tint`, `--color-warning`, `--color-warning-tint`, `--color-danger-tint` (라이트·다크, 글자↔tint·글자↔면 4.5:1 이상을 시험으로 고정).
- `--color-scrim`: 서랍·확인 상자 `::backdrop`.
- 치수: `--sidenav-width` 232px, `--topbar-height` 56px.

### 더한 클래스 (`src/dashboard.css`)

- 앱 골격: `.sc-app`·`.sc-app-main`·`.sc-app-page`, `.sc-sidenav`(조직 전환, 묶음 제목, 항목 `aria-current`, 1180px 아래 아이콘만, 720px 아래 위 막대), `.sc-topbar`(이동 경로 + 계정 메뉴 단추).
- 페이지 머리: `.sc-page-head`, 링크 탭 `.sc-tabs`.
- 데이터: `.sc-table`(+ `.sc-table-scroll`, `.sc-num`, `.sc-table-row-link`, `.sc-table-row--open` + `.sc-table-detail`), `.sc-toolbar`, `.sc-chip`, `.sc-stat`, `.sc-meter`(+ 기준선 `.sc-meter-mark`).
- 상태: `.sc-badge` + `--info`·`--success`·`--warning`·`--danger`·`--neutral`, 글자 색 `.sc-tone-*`.
- 겹침: `dialog.sc-drawer`, `dialog.sc-dialog`, `.sc-savebar`.
- 입력: `.sc-select`, `.sc-toggle`, `.sc-slider`(+ `--split`), `.sc-token-input`·`.sc-token`(+ `--invalid`).
- 보조: `.sc-panel`, `.sc-split`(+ 고정 점검 패널 `.sc-split-rail`), `.sc-btn--danger`, `.sc-icon-btn`.

### 견본

- `examples/dashboard.html`: 시험 목록 · 응시자 표 + 초대 서랍 · 문제 편집(펼친 줄 + 점검 패널) · 설정(저장 막대).
