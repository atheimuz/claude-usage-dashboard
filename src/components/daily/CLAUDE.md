# Daily Detail Components

일지 상세 페이지(`DailyDetailPage`)에서 사용하는 섹션 컴포넌트들.

## 컴포넌트 Props 레퍼런스

| 컴포넌트 | Props | 조건부 |
|----------|-------|--------|
| `DailyHeader` | `{ report, prevFilename?, nextFilename? }` | 항상 |
| `UsageStyleSection` | `{ usageStyle: UsageStyle }` | 데이터 없으면 null |
| `ClaudeUsageSection` | `{ toolUsage: ToolUsage }` | 데이터 없으면 null |
| `PromptPatterns` | `{ promptStats: PromptStats }` | `total === 0`이면 null |
| `ToolStatsTable` | `{ toolStats: ToolStat[] \| ToolUsageItem[] }` | 항상 |
| `TaskTypeGrid` | `{ mainTasks: string[] }` | 항상 |
| `ErrorSummarySection` | `{ errorSummary: ErrorSummary }` | `total === 0`이면 null |
| `LearningInsights` | `{ feedback: Feedback }` | 항상 |
| `WorkflowPatterns` | `{ mainWorkflow: string }` | 항상 |

## DailyDetailPage 렌더링 순서

```
1. DailyHeader
2. UsageScoreCard          ← shared/ (조건부: scoring 존재 시)
3. UsageStyleSection       ← 조건부
4. ClaudeUsageSection      ← 조건부
5. PromptPatterns          ← 조건부
6. ToolStatsTable + TaskTypeGrid  ← 2열 그리드 (lg:grid-cols-2)
7. ErrorSummarySection     ← 조건부
8. LearningInsights
9. WorkflowPatterns
```

## HomePage 공유 컴포넌트

`ToolStatsTable`과 `TaskTypeGrid`는 HomePage에서도 aggregated 데이터와 함께 사용됨. Props 인터페이스(`ToolStat[]`, `string[]`)를 변경할 때 양쪽 페이지의 호환성을 확인해야 함.

## 세부 구현 참고

- **UsageStyleSection**: 사용 패턴 분석 (턴/세션 수, 평균 길이 등) - 데이터 없으면 null 반환
- **ErrorSummarySection**: 에러 요약 (빈도, 해결 패턴) - total === 0이면 null 반환
- **LearningInsights**: `renderBoldText()` 함수로 `**text**` → `<span className="font-semibold">` 변환
- **TaskTypeGrid**: `getTaskTypeIcon` (lib/icons.ts), `getTaskTypeColor` (lib/constants.ts) 사용
