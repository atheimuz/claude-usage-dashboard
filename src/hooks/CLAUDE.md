# Hooks

## Hook 목록

### useReports.ts — TanStack Query 기반 데이터 fetching

| Hook | queryKey | 반환 타입 | 비고 |
|------|----------|-----------|------|
| `useFileList()` | `["fileList"]` | `string[]` (파일 경로 목록) | `/data/index.json` fetch |
| `useDailyReport(filename)` | `["report", filename]` | `DailyReport` | `enabled: !!filename` |
| `useAllReports()` | `["fileList"]` + 각 `["report", ...]` | `{ data: DailyReport[], isLoading, isError }` | useFileList + useQueries 병렬 |

모든 쿼리: `staleTime: Infinity, gcTime: Infinity` (정적 데이터, 한 번 로드 후 재요청 없음)

### useTheme.ts — 다크모드 관리

| 반환값 | 타입 | 설명 |
|--------|------|------|
| `theme` | `"light" \| "dark" \| "system"` | 현재 테마 |
| `isDark` | `boolean` | 현재 다크 모드 여부 |
| `setTheme(t)` | `(t: Theme) => void` | 테마 설정 |
| `toggleTheme()` | `() => void` | light/dark 토글 |

localStorage 키: `"theme"`, document.documentElement에 `dark` 클래스 토글

## 데이터 흐름

```
/data/index.json
    ↓ useFileList()
["work/2026-02-08.json", "side/2026-02-08.json", ...]
    ↓ useAllReports() → useQueries로 각 파일 병렬 fetch
DailyReport[]
    ↓ aggregateReports() (lib/aggregator.ts)
AggregatedStats → HomePage 렌더링

/data/{location}/{name}.json
    ↓ useDailyReport("work/2026-02-08")
DailyReport → DailyDetailPage 렌더링
```

## 새 hook 추가 시

- 파일명: `use<Name>.ts`
- TanStack Query 사용 시 queryKey에 고유 식별자 포함
- 현재 모든 데이터는 static → `staleTime/gcTime: Infinity`
