# Claude Usage Dashboard

Claude Code 사용 패턴을 분석하고, 활용 방식을 개선하여 컨텍스트 비용을 효율적으로 관리하기 위한 웹 대시보드. JSON 데이터 파일(WeeklyReport)을 fetch하여 종합 통계, 주간 상세 일지, 일지 목록을 제공한다.

## 주요 기능

- **종합 대시보드** — 활용도 점수 추이, 게이지, 카테고리 레이더, 도구 사용량, 최근 활동
- **주간 일지 목록** — 달력 뷰 / 리스트 뷰 전환
- **주간 일지 상세** — 사용 스타일, 도구 통계, 워크플로우, 점수 평가, 설정 변경 이력
- **다크 모드** — 시스템 설정 연동 및 수동 전환

## 기술 스택

| 영역 | 기술 |
|------|------|
| UI | React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| 빌드 | Vite 6 |
| 데이터 | TanStack Query v5 |
| 라우팅 | React Router v7 |
| 차트 | Recharts |
| 테스트 | Playwright (E2E) |

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 프리뷰
npm run preview

# 린트
npm run lint

# session-analyzer 보고서 동기화
npm run sync-reports
```

## 새 일지 추가

1. `/session-analyzer` 스킬 실행 → `~/.claude/summaries/weekly/`에 주간 보고서 생성
2. `npm run sync-reports` 실행 → 주간 파일을 그대로 복사 + `index.json` 자동 업데이트
3. `npm run sync-reports -- work`로 location 지정 가능 (기본값: `side`)

## 프로젝트 구조

```
src/
├── pages/              # 페이지 컴포넌트 (Home, WeeklyList, WeeklyDetail)
├── components/
│   ├── ui/             # shadcn/ui 컴포넌트
│   ├── layout/         # Header, Layout
│   ├── dashboard/      # 홈 대시보드 전용
│   ├── weekly/         # 주간 일지 상세 페이지 전용
│   └── weekly-list/    # 주간 일지 목록 페이지 전용
├── hooks/              # useReports, useTheme
├── lib/                # aggregator, utils
└── types/              # TypeScript 인터페이스

public/data/            # 주간 일지 데이터 (JSON)
scripts/                # sync-reports 스크립트
tests/                  # E2E 테스트 (Playwright)
```

## 라우팅

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | HomePage | 종합 대시보드 |
| `/weekly` | WeeklyListPage | 주간 일지 목록 (달력/리스트 뷰) |
| `/weekly/:location/:name` | WeeklyDetailPage | 주간 일지 상세 |

## 데이터 흐름

```
[동기화]
~/.claude/summaries/weekly/*.json → npm run sync-reports → public/data/{location}/*.json

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

## E2E 테스트

```bash
# 전체 실행
npx playwright test

# 특정 파일 실행
npx playwright test tests/claude-usage-dashboard/home.spec.ts

# UI 모드 (디버깅)
npx playwright test --ui
```
