# Lib - 유틸리티 및 집계

## 파일별 Export 목록

### utils.ts — 범용 유틸리티

| 함수 | 설명 |
|------|------|
| `cn(...inputs)` | Tailwind 클래스 병합 (clsx + twMerge) |
| `parseFilename(filename)` | `"work/2026-02-08"` → `{ date, identifier, filename }` |
| `getDayOfWeek(dateStr)` | `"2026-02-08"` → `"토"` |
| `formatDate(dateStr)` | `"2026-02-08"` → `"2026년 2월 8일 (토)"` |
| `formatDateShort(dateStr)` | `"2026-02-08"` → `"02-08"` |
| `formatNumber(num)` | `1234` → `"1,234"` (ko-KR 로케일) |
| `formatPercent(value, total)` | 퍼센트 문자열 반환 |
| `groupByDate(reports)` | `DailyReport[]` → `Map<date, DailyReport[]>` |
| `sortFilesByDate(files)` | 파일명 배열을 날짜 역순 정렬 |
| `getNextPrevFilename(current, files)` | `{ prev?, next? }` 반환 |
| `getDaysInMonth(year, month)` | 달력 뷰용 |
| `getFirstDayOfMonth(year, month)` | 달력 뷰용 |
| `isToday(dateStr)` | 오늘 날짜 여부 |

### aggregator.ts — 다중 일지 집계

`aggregateReports(reports: DailyReport[]): AggregatedStats`

집계 항목: totalDays, totalSessions, totalToolCalls, totalProjects, toolUsageAggregated, taskTypeAggregated (percentage 포함), techStackFrequency (파일 단위 카운트), dailyTrend, averageEvaluationScore, latestEvaluation, evaluationCategoryAverages

**확장 패턴**: Map 기반 누적 → `Array.from(map.entries()).map(...)` → `.sort(...)`

### constants.ts — 작업 유형 색상

- `TASK_TYPE_COLORS`: 한글 작업 유형명 → HEX 색상 (15종)
- `getTaskTypeColor(type)`: 미등록 타입은 `#9ca3af` 반환

### icons.ts — 작업 유형 아이콘

- `TASK_TYPE_ICONS`: 한글 작업 유형명 → LucideIcon (15종)
- `getTaskTypeIcon(type)`: 미등록 타입은 `Code` 아이콘 반환

## 작업 유형 추가 시

`constants.ts`의 `TASK_TYPE_COLORS`와 `icons.ts`의 `TASK_TYPE_ICONS`에 **동일한 키(한글)**로 양쪽 동시 추가해야 함.

현재 등록된 15종: 코딩, 디버깅, 리팩토링, 수정, 테스트, 설계/기획, 설정, 탐색/분석, 학습, 스타일링, 문서화, 배포/CI, 보안, 성능 최적화, 데이터/DB
