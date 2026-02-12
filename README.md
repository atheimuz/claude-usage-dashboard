# Claude Usage Dashboard

Claude Code 사용 일지를 시각화하는 웹 대시보드. 마크다운으로 작성한 일지를 JSON으로 변환하고, 종합 통계/차트/일별 상세 정보를 제공한다.

## 주요 기능

- **종합 대시보드** - 전체 통계 카드, 도구 사용량 차트, 기술 스택 클라우드, 최근 활동
- **일지 목록** - 달력 뷰 / 리스트 뷰 전환
- **일지 상세** - 세션별 상세 정보, 작업 유형 분포, 프롬프트 패턴, 학습 인사이트
- **다크 모드** - 시스템 설정 연동 및 수동 전환

## 기술 스택

| 영역 | 기술 |
|------|------|
| UI | React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| 빌드 | Vite 6 |
| 데이터 | TanStack Query v5 |
| 라우팅 | React Router v7 |
| 차트 | Recharts |
| 테스트 | Playwright (E2E) |
| 데이터 변환 | unified + remark-parse (MD → JSON) |

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
```

## 새 일지 추가

1. `public/data/{location}/YYYY-MM-DD.md` 파일 작성 (location: `work` 또는 `side`)
2. `public/data/index.json`에 항목 추가:
   ```json
   { "name": "YYYY-MM-DD.md", "location": "work" }
   ```
3. 변환 스크립트 실행:
   ```bash
   npm run md-to-json
   ```

## 프로젝트 구조

```
src/
├── pages/              # 페이지 컴포넌트 (Home, DailyList, DailyDetail)
├── components/
│   ├── ui/             # shadcn/ui 컴포넌트
│   ├── layout/         # Header, Layout
│   ├── dashboard/      # 홈 대시보드 전용
│   ├── daily/          # 일지 상세 페이지 전용
│   ├── daily-list/     # 일지 목록 페이지 전용
│   └── shared/         # 공통 컴포넌트
├── hooks/              # useReports, useTheme
├── lib/                # aggregator, utils, constants
└── types/              # TypeScript 인터페이스

public/data/            # 일지 데이터 (MD 원본 + JSON)
scripts/                # MD → JSON 변환 스크립트
tests/                  # E2E 테스트 (Playwright)
```

## 라우팅

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | HomePage | 종합 대시보드 |
| `/daily` | DailyListPage | 일지 목록 (달력/리스트 뷰) |
| `/daily/:location/:name` | DailyDetailPage | 일지 상세 |

## 데이터 흐름

```
[빌드 타임]
public/data/*.md → npm run md-to-json → public/data/*.json

[런타임]
index.json (파일 목록)
    → useFileList() (TanStack Query)
    → useAllReports() (병렬 fetch)
    → aggregateReports() (통계 집계)
    → 페이지 렌더링
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
