# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Usage Dashboard - Claude Code 사용 일지를 웹 대시보드로 시각화하는 SPA. JSON 데이터 파일(`DailyReport` 형식)을 fetch하여 종합 통계, 일별 상세 일지, 일지 목록을 제공한다.

## Commands

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# ESLint 실행
npm run lint

# MD → JSON 변환 (새 일지 추가 시)
npm run md-to-json

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
- **unified + remark-parse** for markdown parsing (devDependency, 변환 스크립트 전용)
- **Playwright** for E2E testing

## Architecture

### Data Flow

```
[사전 변환] public/data/*.md → npm run md-to-json → public/data/*.json

[런타임]
public/data/index.json (파일 목록, .json 참조)
         ↓
public/data/*.json (DailyReport JSON)
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
| `/daily` | DailyListPage | 일지 목록 (달력/리스트 뷰) |
| `/daily/:filename` | DailyDetailPage | 일지 상세 (filename은 확장자 제외) |

### Key Directories

```
src/
├── components/
│   ├── ui/          # shadcn UI 컴포넌트
│   ├── layout/      # Header, Layout
│   ├── dashboard/   # 홈 대시보드 전용 컴포넌트
│   ├── daily/       # 일지 상세 페이지 컴포넌트
│   └── daily-list/  # 일지 목록 페이지 컴포넌트
├── hooks/           # useReports (데이터 fetching), useTheme
├── lib/             # aggregator, utils
├── types/           # TypeScript 인터페이스
└── pages/           # 페이지 컴포넌트
```

### Path Alias

`@/` → `./src/` (tsconfig.json, vite.config.ts에 설정됨)

## Data Format

JSON 파일 위치: `public/data/{location}/YYYY-MM-DD.json` (DailyReport 형식)
원본 MD 파일: `public/data/{location}/YYYY-MM-DD.md` (사람이 읽기 쉬운 원본, 변환 소스)

파일 목록 관리: `public/data/index.json`
```json
{ "files": [{ "name": "2026-02-08.json", "location": "work" }] }
```

### 새 일지 추가

1. `public/data/{location}/YYYY-MM-DD.md` 작성
2. `index.json`에 `{ "name": "YYYY-MM-DD.md", "location": "work" }` 추가
3. `npm run md-to-json` 실행 → JSON 생성 + index.json 자동 업데이트

## Conventions

- **아이콘**: lucide-react 사용 (마크다운의 이모지는 파싱용으로만 사용, UI에 표시하지 않음)
- **스타일링**: Tailwind CSS + shadcn/ui 컴포넌트
- **데이터 캐싱**: staleTime/gcTime을 Infinity로 설정 (정적 데이터)
- **E2E 테스트**: Page Object 패턴, 목업 데이터로 API 인터셉트
- **테스트명**: 한글로 작성, "~해야 한다" 형식

## E2E Testing

테스트 디렉토리 구조:
```
tests/
├── claude-usage-dashboard/  # 기능별 테스트 스펙
├── page-objects/            # Page Object 클래스
└── mocks/                   # 목업 데이터
```

모든 테스트는 `page.route()`로 API를 인터셉트하고 목업 데이터를 사용한다.
