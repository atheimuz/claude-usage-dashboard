# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Usage Dashboard - Claude Code 사용 일지를 웹 대시보드로 시각화하는 SPA. JSON 데이터 파일(`WeeklyReport` 형식)을 fetch하여 종합 통계, 주간 상세 일지, 일지 목록을 제공한다.

## Commands

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# ESLint 실행
npm run lint

# session-analyzer 보고서 동기화 (새 일지 추가 시)
npm run sync-reports

# 빌드 프리뷰
npm run preview

# E2E 테스트 전체 실행
npx playwright test

# 특정 E2E 테스트 파일 실행
npx playwright test tests/claude-usage-dashboard/home.spec.ts

# E2E 테스트 UI 모드 (디버깅)
npx playwright test --ui
```

## Tech Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS v4** (with `@tailwindcss/vite` plugin)
- **shadcn/ui** (new-york style, lucide-react icons)
- **TanStack Query v5** for data fetching/caching
- **React Router v7** for routing
- **Recharts** for charts
- **Playwright** for E2E testing

## Architecture

### Data Flow

```
[동기화] ~/.claude/summaries/weekly/*.json → npm run sync-reports → public/data/{location}/*.json

[런타임]
public/data/index.json (파일 목록)
         ↓
public/data/{location}/*.json (WeeklyReport[] 배열, 주간 단위)
         ↓
hooks/useReports.ts (fetch → JSON 직접 소비, TanStack Query 캐싱)
         ↓
lib/aggregator.ts (여러 일지를 집계 → AggregatedStats)
         ↓
페이지 컴포넌트
```

### Routing

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | HomePage | 종합 대시보드 (통계 카드, 차트, 최근 활동) |
| `/weekly` | WeeklyListPage | 주간 일지 목록 (달력/리스트 뷰) |
| `/weekly/:location/:name` | WeeklyDetailPage | 주간 일지 상세 |

### Key Directories

```
src/
├── components/
│   ├── ui/          # shadcn UI 컴포넌트
│   ├── layout/      # Header, Layout
│   ├── dashboard/   # 홈 대시보드 전용 컴포넌트
│   ├── weekly/      # 주간 일지 상세 페이지 컴포넌트
│   └── weekly-list/ # 주간 일지 목록 페이지 컴포넌트
├── hooks/           # useReports (데이터 fetching), useTheme
├── lib/             # aggregator, utils
├── types/           # TypeScript 인터페이스
└── pages/           # 페이지 컴포넌트
```

### Path Alias

`@/` → `./src/` (tsconfig.json, vite.config.ts에 설정됨)

## Data Format

JSON 파일 위치: `public/data/{location}/YYYY-MM-WN.json` (WeeklyReport[] 배열, 주간 단위)
소스: `~/.claude/summaries/weekly/*.json` (session-analyzer가 생성하는 주간 배열)

파일 목록 관리: `public/data/index.json`
```json
{ "files": [{ "name": "2026-02-W2.json", "location": "side" }] }
```

### 새 일지 추가

1. `/session-analyzer` 스킬 실행 → `~/.claude/summaries/weekly/` 에 주간 보고서 생성
2. `npm run sync-reports` 실행 → 주간 파일을 그대로 복사 + index.json 자동 업데이트
3. `npm run sync-reports -- work` 로 location 지정 가능 (기본값: `side`)

## Conventions

- **아이콘**: lucide-react 사용 (마크다운의 이모지는 파싱용으로만 사용, UI에 표시하지 않음)
- **스타일링**: Tailwind CSS + shadcn/ui 컴포넌트
- **CSS 변수 색상**: Tailwind CSS v4에서 CSS 변수는 완전한 oklch 값을 포함함 (예: `--chart-1: oklch(0.54 0.19 264)`)
  - SVG에서는 Tailwind 클래스 사용: `className="stroke-success"`, `className="fill-chart-1"`
  - Recharts/인라인 스타일에서는 wrapper 없이 직접 사용: `var(--chart-1)` (NOT `hsl(var(...))` 또는 `oklch(var(...))`)
- **데이터 캐싱**: staleTime/gcTime을 Infinity로 설정 (정적 데이터)
- **E2E 테스트**: Page Object 패턴, 목업 데이터로 API 인터셉트
- **테스트명**: 한글로 작성, "~해야 한다" 형식
- **문서 동기화**: 폴더 구조, 라우트, 타입명, hook명 등 구조적 변경 시 관련 CLAUDE.md 파일도 함께 업데이트
- **리네이밍 검증**: 타입/변수/폴더명을 일괄 변경한 후 `grep -r "이전이름" src/ tests/`로 잔여 참조를 확인. mock 파일, 문서, 주석도 검증 범위에 포함

## Refactoring Checklist

대규모 리네이밍(타입, 폴더, 변수명 등 개념 단위 변경) 시 체크리스트:

1. `src/types/` — 타입/인터페이스명 변경
2. `src/hooks/` — hook 함수명 + 내부 타입 참조
3. `src/lib/` — 유틸리티 함수의 타입 참조 + 변수명
4. `src/components/` — import 경로 + 타입 참조 + 폴더명
5. `src/pages/` — import 경로 + hook 호출명 + 폴더명
6. `src/App.tsx` — lazy import + Route 경로
7. `tests/page-objects/` — 클래스명, 메서드명, 셀렉터, 라우트
8. `tests/claude-usage-dashboard/` — import, 변수명, 라우트, 텍스트
9. `tests/mocks/` — 타입 참조, 변수명
10. `**/CLAUDE.md` — 모든 문서의 구식 참조 업데이트
11. 검증: `grep -r "이전이름" src/ tests/` 실행하여 잔여 참조 0건 확인

## E2E Testing

테스트 디렉토리 구조:
```
tests/
├── claude-usage-dashboard/  # 기능별 테스트 스펙
├── page-objects/            # Page Object 클래스
└── mocks/                   # 목업 데이터
```

모든 테스트는 `page.route()`로 API를 인터셉트하고 목업 데이터를 사용한다.
