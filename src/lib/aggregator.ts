import type { DailyReport, AggregatedStats, ToolStat, DailyTrendPoint, Scoring } from "@/types"

export function aggregateReports(reports: DailyReport[]): AggregatedStats {
  const dates = new Set<string>()
  let totalSessions = 0
  let totalToolCalls = 0
  const toolMap = new Map<string, number>()
  const taskSet = new Set<string>()
  const trendMap = new Map<string, { reportCount: number; sessions: number; toolCalls: number; scores: number[] }>()

  // Scoring aggregation
  const scoringScores: number[] = []
  let latestScoring: Scoring | undefined
  let latestDate = ""
  const categoryScores = {
    intent: { total: 0, count: 0 },
    efficiency: { total: 0, count: 0 },
    fitness: { total: 0, count: 0 },
    workflow: { total: 0, count: 0 },
  }

  for (const report of reports) {
    dates.add(report.date)
    totalSessions += report.summary.sessions

    // tool_usage.top_tools에서 도구 사용 횟수 집계
    const reportToolCalls = report.tool_usage.top_tools.reduce((sum, t) => sum + t.count, 0)
    totalToolCalls += reportToolCalls

    for (const tool of report.tool_usage.top_tools) {
      const name = tool.name || "Unknown"
      const existing = toolMap.get(name) || 0
      toolMap.set(name, existing + tool.count)
    }

    // main_tasks 수집
    for (const task of report.summary.main_tasks) {
      taskSet.add(task)
    }

    // 일별 트렌드
    const trend = trendMap.get(report.date)
    if (trend) {
      trend.reportCount += 1
      trend.sessions += report.summary.sessions
      trend.toolCalls += reportToolCalls
      if (report.scoring?.total > 0) trend.scores.push(report.scoring.total)
    } else {
      const scores: number[] = []
      if (report.scoring?.total > 0) scores.push(report.scoring.total)
      trendMap.set(report.date, {
        reportCount: 1,
        sessions: report.summary.sessions,
        toolCalls: reportToolCalls,
        scores,
      })
    }

    // Scoring 집계
    if (report.scoring && report.scoring.total > 0) {
      scoringScores.push(report.scoring.total)

      if (report.date > latestDate) {
        latestDate = report.date
        latestScoring = report.scoring
      }

      const cats = report.scoring.categories
      if (cats.intent) {
        categoryScores.intent.total += cats.intent.score
        categoryScores.intent.count += 1
      }
      if (cats.efficiency) {
        categoryScores.efficiency.total += cats.efficiency.score
        categoryScores.efficiency.count += 1
      }
      if (cats.fitness) {
        categoryScores.fitness.total += cats.fitness.score
        categoryScores.fitness.count += 1
      }
      if (cats.workflow) {
        categoryScores.workflow.total += cats.workflow.score
        categoryScores.workflow.count += 1
      }
    }
  }

  const toolUsageAggregated: ToolStat[] = Array.from(toolMap.entries())
    .map(([toolName, usageCount]) => ({ toolName, usageCount }))
    .sort((a, b) => b.usageCount - a.usageCount)

  const mainTasks = Array.from(taskSet)

  const dailyTrend: DailyTrendPoint[] = Array.from(trendMap.entries())
    .map(([date, data]) => ({
      date,
      reportCount: data.reportCount,
      sessions: data.sessions,
      toolCalls: data.toolCalls,
      score: data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : undefined,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Scoring 평균 계산
  const averageEvaluationScore = scoringScores.length > 0
    ? Math.round(scoringScores.reduce((a, b) => a + b, 0) / scoringScores.length)
    : undefined

  const scoringCategoryAverages = categoryScores.intent.count > 0
    ? {
        intent: Math.round(categoryScores.intent.total / categoryScores.intent.count),
        efficiency: Math.round(categoryScores.efficiency.total / categoryScores.efficiency.count),
        fitness: Math.round(categoryScores.fitness.total / categoryScores.fitness.count),
        workflow: Math.round(categoryScores.workflow.total / categoryScores.workflow.count),
      }
    : undefined

  return {
    totalDays: dates.size,
    totalSessions,
    totalToolCalls,
    toolUsageAggregated,
    mainTasks,
    dailyTrend,
    averageEvaluationScore,
    latestScoring,
    scoringCategoryAverages,
  }
}
