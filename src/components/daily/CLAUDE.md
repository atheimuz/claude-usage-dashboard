# Daily Detail Components

일지 상세 페이지(`DailyDetailPage`)에서 사용하는 섹션 컴포넌트들.

## 컴포넌트 Props 레퍼런스

| 컴포넌트 | Props | 조건부 |
|----------|-------|--------|
| `DailyHeader` | `{ report: DailyReport, prevFilename?: string, nextFilename?: string }` | 항상 |
| `TechStackSection` | `{ techStack: TechStack }` | 항상 |
| `ClaudeUsageSection` | `{ claudeUsage: ClaudeUsage }` | 항상 |
| `PromptPatterns` | `{ patterns: PromptPatterns }` | 항상 |
| `ToolStatsTable` | `{ toolStats: ToolStat[] }` | 항상 |
| `TaskTypeGrid` | `{ taskTypes: TaskType[] }` | 항상 |
| `ProjectDistributionSection` | `{ distributions: ProjectDistribution[] }` | `length > 0` |
| `LearningInsights` | `{ insights: string[] }` | 항상 |
| `WorkflowPatterns` | `{ patterns: WorkflowPattern[] }` | 항상 |
| `SessionTimeline` | `{ sessions: SessionDetail[] }` | `length > 0` |
| `SessionAccordion` | `{ sessions: SessionDetail[] }` | 미사용 (레거시) |

## DailyDetailPage 렌더링 순서

```
DailyHeader
TechStackSection
ClaudeUsageSection
UsageScoreCard          ← shared/ (조건부: usageEvaluation 존재 시)
PromptPatterns
ToolStatsTable + TaskTypeGrid  ← 2열 그리드 (lg:grid-cols-2)
ProjectDistributionSection     ← 조건부
LearningInsights
WorkflowPatterns
SessionTimeline                ← 조건부
```

## HomePage 공유 컴포넌트

`ToolStatsTable`과 `TaskTypeGrid`는 HomePage에서도 aggregated 데이터와 함께 사용됨. Props 인터페이스(`ToolStat[]`, `TaskType[]`)를 변경할 때 양쪽 페이지의 호환성을 확인해야 함.

## 세부 구현 참고

- **TechStackSection**: 그룹별 Badge 색상 하드코딩 — languages: blue, frameworks: purple, tools: slate (light/dark 양쪽 정의)
- **LearningInsights**: `renderBoldText()` 함수로 `**text**` → `<span className="font-semibold">` 변환
- **SessionAccordion**: `SessionTimeline`으로 대체됨. DailyDetailPage에서 더 이상 import하지 않으나 파일은 유지됨
- **TaskTypeGrid**: `getTaskTypeIcon` (lib/icons.ts), `getTaskTypeColor` (lib/constants.ts) 사용
