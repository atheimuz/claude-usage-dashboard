# Pages

## 페이지 매핑

| 페이지 | 라우트 | Hook | 핵심 컴포넌트 |
|--------|--------|------|--------------|
| `HomePage` | `/` | `useAllReports` + `aggregateReports` | UsageScoreCard, ToolStatsTable, TaskTypeGrid, TechStackCloud, RecentActivity |
| `DailyListPage` | `/daily` | `useAllReports` | CalendarView (collapsible), ListView |
| `DailyDetailPage` | `/daily/:location/:name` | `useDailyReport` + `useFileList` | DailyHeader + 10개 섹션 컴포넌트 (daily/CLAUDE.md 참조) |

## 공통 3단계 상태 처리 패턴

```
isLoading → Skeleton 컴포넌트
isError   → Alert(variant="destructive") + "다시 시도" Button
빈 데이터 → FileText 아이콘 + 안내 메시지
```

## App.tsx lazy import 패턴

모든 페이지는 named export를 사용하며, App.tsx에서 lazy + default export 변환:

```tsx
const HomePage = lazy(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage })))
```

`<Suspense fallback={<PageFallback />}>`로 감싸며, Layout 컴포넌트가 `<Outlet />`으로 페이지 렌더링.

## DailyDetailPage URL 파라미터 검증

```ts
const LOCATION_PATTERN = /^[a-z0-9_-]+$/i   // location: "work", "side" 등
const NAME_PATTERN = /^\d{4}-\d{2}-\d{2}$/   // name: "2026-02-08"
```

검증 실패 시 `enabled: false`로 데이터를 fetch하지 않음.

## 새 페이지 추가 체크리스트

1. `src/pages/<Name>Page.tsx` 생성 (named export)
2. `App.tsx`에 lazy import + `<Route>` 추가
3. `Header.tsx`의 `NAV_ITEMS` 배열에 네비게이션 항목 추가
4. 필요 시 `tests/page-objects/`에 Page Object 생성
