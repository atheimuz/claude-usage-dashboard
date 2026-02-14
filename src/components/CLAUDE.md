# Components

## 디렉토리 배치 규칙

| 디렉토리 | 용도 | 파일 |
|----------|------|------|
| `ui/` | shadcn/ui 자동 생성 컴포넌트 (직접 수정하지 않음) | accordion, alert, badge, button, card, input, popover, separator, skeleton, table, tabs, toggle, toggle-group, tooltip |
| `layout/` | 전체 레이아웃 | `Header.tsx` (sticky 헤더, NAV_ITEMS 배열로 네비게이션 관리), `Layout.tsx` (Outlet 기반, max-w-7xl), `ScrollToTop.tsx` (페이지 이동 시 스크롤 리셋) |
| `dashboard/` | 홈 대시보드 전용 | `RecentActivity.tsx` (최근 7개 일지), `SummaryCard.tsx` (집계 통계 요약 카드) |
| `weekly/` | 주간 일지 상세 페이지 전용 | 10개 섹션 컴포넌트 + `WeeklyHeader.tsx` |
| `weekly-list/` | 주간 일지 목록 페이지 전용 | `CalendarView.tsx` (월 선택기), `ListView.tsx` (groupByDate 후 날짜역순) |
| `shared/` | 여러 페이지에서 공유 | `ReportCard.tsx`, `StatusBadge.tsx`, `UsageScoreCard.tsx` |

## 컴포넌트 작성 컨벤션

- **Props**: `interface Props` (또는 `interface <Name>Props`)로 정의, named export 사용
- **빈 데이터 처리**: 배열 길이 0이면 `return null` (예: `TaskTypeBar`)
- **조건부 렌더링**: `{field && field.length > 0 && (...)}` 패턴
- **Card 구조**: `Card > CardHeader > CardTitle(아이콘 + 제목) > CardContent`
- **아이콘**: lucide-react에서 import, `className="h-5 w-5"` (제목) 또는 `"h-4 w-4"` (본문)

## shared/ 의존성 맵

```
ReportCard (report: WeeklyReport)
  └─ 일지 목록, 최근 활동에서 사용

StatusBadge ({ status: 'success' | 'warning' | 'error' | 'info' })
  └─ 상태 표시 배지 (variant 기반 스타일링)

UsageScoreCard (score, maxScore, categories, grade?, taskComplexity?, ...)
  ├─ HomePage: size="lg", label="평균 활용도 점수", 집계 데이터
  └─ WeeklyDetailPage: size="sm", featured, title="활용도 평가", 단일 리포트
```

## shadcn/ui 컴포넌트 추가

```bash
npx shadcn@latest add <component-name>
```

설정: `components.json` (style: new-york, baseColor: neutral, cssVariables: true)
