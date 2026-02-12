import type { DailyReport, AggregatedStats, ToolStat, TaskType, DailyTrendPoint, UsageEvaluation, EvaluationCategory } from "@/types"

export function aggregateReports(reports: DailyReport[]): AggregatedStats {
  const dates = new Set<string>()
  const projects = new Set<string>()
  let totalSessions = 0
  let totalToolCalls = 0
  const toolMap = new Map<string, { usageCount: number; primaryUse: string }>()
  const taskMap = new Map<string, { count: number; description: string }>()
  const techFreq: Record<string, Set<string>> = {}
  const trendMap = new Map<string, { reportCount: number; sessions: number; toolCalls: number }>()

  // Evaluation aggregation
  const evaluationScores: number[] = []
  let latestEvaluation: UsageEvaluation | undefined
  let latestDate = ""
  const categoryScoreMap = new Map<string, { totalScore: number; totalMax: number; count: number }>()

  for (const report of reports) {
    dates.add(report.date)
    totalSessions += report.overview.totalSessions
    totalToolCalls += report.overview.totalToolCalls

    for (const ps of report.projectSessions) {
      projects.add(ps.projectName)
    }

    for (const ts of report.toolStats) {
      const existing = toolMap.get(ts.toolName)
      if (existing) {
        existing.usageCount += ts.usageCount
      } else {
        toolMap.set(ts.toolName, { usageCount: ts.usageCount, primaryUse: ts.primaryUse })
      }
    }

    for (const tt of report.taskTypes) {
      const existing = taskMap.get(tt.type)
      if (existing) {
        existing.count += tt.count
      } else {
        taskMap.set(tt.type, { count: tt.count, description: tt.description })
      }
    }

    const allTech = [
      ...report.techStack.languages.map(item => item.name),
      ...report.techStack.frameworks.map(item => item.name),
      ...report.techStack.tools.map(item => item.name),
    ]
    for (const tech of allTech) {
      if (!techFreq[tech]) techFreq[tech] = new Set()
      techFreq[tech].add(report.filename)
    }

    const trend = trendMap.get(report.date)
    if (trend) {
      trend.reportCount += 1
      trend.sessions += report.overview.totalSessions
      trend.toolCalls += report.overview.totalToolCalls
    } else {
      trendMap.set(report.date, {
        reportCount: 1,
        sessions: report.overview.totalSessions,
        toolCalls: report.overview.totalToolCalls,
      })
    }

    // Aggregate evaluation data
    if (report.usageEvaluation && report.usageEvaluation.overallScore > 0) {
      evaluationScores.push(report.usageEvaluation.overallScore)

      if (report.date > latestDate) {
        latestDate = report.date
        latestEvaluation = report.usageEvaluation
      }

      for (const cat of report.usageEvaluation.categories) {
        const existing = categoryScoreMap.get(cat.name)
        if (existing) {
          existing.totalScore += cat.score
          existing.totalMax += cat.maxScore
          existing.count += 1
        } else {
          categoryScoreMap.set(cat.name, { totalScore: cat.score, totalMax: cat.maxScore, count: 1 })
        }
      }
    }
  }

  const toolUsageAggregated: ToolStat[] = Array.from(toolMap.entries())
    .map(([toolName, data]) => ({ toolName, ...data }))
    .sort((a, b) => b.usageCount - a.usageCount)

  const taskTypeRaw = Array.from(taskMap.entries())
    .map(([type, data]) => ({ type, ...data }))
    .sort((a, b) => b.count - a.count)
  const taskTotal = taskTypeRaw.reduce((sum, t) => sum + t.count, 0)
  const taskTypeAggregated: TaskType[] = taskTypeRaw.map((t) => ({
    ...t,
    percentage: taskTotal > 0 ? Math.round((t.count / taskTotal) * 100) : 0,
  }))

  const techStackFrequency: Record<string, number> = {}
  for (const [tech, fileSet] of Object.entries(techFreq)) {
    techStackFrequency[tech] = fileSet.size
  }

  const dailyTrend: DailyTrendPoint[] = Array.from(trendMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Compute evaluation averages
  const averageEvaluationScore = evaluationScores.length > 0
    ? Math.round(evaluationScores.reduce((a, b) => a + b, 0) / evaluationScores.length)
    : undefined

  const evaluationCategoryAverages: EvaluationCategory[] | undefined = categoryScoreMap.size > 0
    ? Array.from(categoryScoreMap.entries()).map(([name, data]) => ({
        name,
        score: Math.round(data.totalScore / data.count),
        maxScore: Math.round(data.totalMax / data.count),
      }))
    : undefined

  return {
    totalDays: dates.size,
    totalSessions,
    totalToolCalls,
    totalProjects: projects.size,
    toolUsageAggregated,
    taskTypeAggregated,
    techStackFrequency,
    dailyTrend,
    averageEvaluationScore,
    latestEvaluation,
    evaluationCategoryAverages,
  }
}
