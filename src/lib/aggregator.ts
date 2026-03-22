import type { MonthlyReport, AggregatedStats, ToolStat, MonthlyTrendPoint, Scoring, FrequentToolItem, FrequentToolTrend, ToolUsageItem } from "@/types"

function accumulateFrequentTools(
  map: Map<string, FrequentToolItem>,
  items: ToolUsageItem[],
  category: 'agent' | 'command' | 'skill',
) {
  for (const item of items) {
    const name = (category === 'agent' ? item.type : item.name) || "Unknown"
    const key = `${category}::${name}`
    const existing = map.get(key)
    if (existing) {
      existing.totalCount += item.count
      if (!existing.description && item.description) {
        existing.description = item.description
      }
    } else {
      map.set(key, { name, category, totalCount: item.count, description: item.description })
    }
  }
}

function collectFrequentTools(reports: MonthlyReport[]): FrequentToolItem[] {
  const map = new Map<string, FrequentToolItem>()
  for (const report of reports) {
    accumulateFrequentTools(map, report.tool_usage.agents, 'agent')
    accumulateFrequentTools(map, report.tool_usage.commands, 'command')
    accumulateFrequentTools(map, report.tool_usage.skills, 'skill')
  }
  return Array.from(map.values())
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 10)
}

function computeTrend(
  recentTools: FrequentToolItem[],
  previousTools: FrequentToolItem[],
): FrequentToolItem[] {
  const previousRankMap = new Map<string, number>()
  previousTools.forEach((item, index) => {
    previousRankMap.set(`${item.category}::${item.name}`, index)
  })

  return recentTools.map((item, currentRank) => {
    const key = `${item.category}::${item.name}`
    const previousRank = previousRankMap.get(key)

    let trend: FrequentToolTrend
    if (previousRank === undefined) {
      trend = 'new'
    } else if (previousRank > currentRank) {
      trend = 'up'
    } else if (previousRank < currentRank) {
      trend = 'down'
    } else {
      trend = 'stable'
    }

    return { ...item, trend }
  })
}

export function aggregateReports(reports: MonthlyReport[]): AggregatedStats {
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

  // FrequentTools 집계용 Map
  const frequentToolsMap = new Map<string, { name: string; category: 'agent' | 'command' | 'skill'; totalCount: number; description?: string }>()

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

    // 월별 트렌드
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

      const scoringCategories = report.scoring.categories
      for (const key of ['intent', 'efficiency', 'fitness', 'workflow'] as const) {
        if (scoringCategories[key]) {
          categoryScores[key].total += scoringCategories[key].score
          categoryScores[key].count += 1
        }
      }
    }

    // FrequentTools 집계
    accumulateFrequentTools(frequentToolsMap, report.tool_usage.agents, 'agent')
    accumulateFrequentTools(frequentToolsMap, report.tool_usage.commands, 'command')
    accumulateFrequentTools(frequentToolsMap, report.tool_usage.skills, 'skill')
  }

  const toolUsageAggregated: ToolStat[] = Array.from(toolMap.entries())
    .map(([toolName, usageCount]) => ({ toolName, usageCount }))
    .sort((a, b) => b.usageCount - a.usageCount)

  const mainTasks = Array.from(taskSet)

  const monthlyTrend: MonthlyTrendPoint[] = Array.from(trendMap.entries())
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

  // FrequentTools: 전체 기간 (기존 방식)
  const frequentTools: FrequentToolItem[] = Array.from(frequentToolsMap.values())
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 10)

  // FrequentTools: 최근 1개월 + 트렌드
  const allDates = Array.from(dates).sort()
  const latestMonth = allDates[allDates.length - 1]
  const previousMonths = allDates.slice(0, -1)

  const recentReports = reports.filter(r => r.date === latestMonth)
  const previousReports = reports.filter(r => previousMonths.includes(r.date))

  const recentRaw = collectFrequentTools(recentReports)
  const previousRaw = collectFrequentTools(previousReports)
  const recentFrequentTools = computeTrend(recentRaw, previousRaw)

  return {
    totalDays: dates.size,
    totalSessions,
    totalToolCalls,
    toolUsageAggregated,
    mainTasks,
    monthlyTrend,
    averageEvaluationScore,
    latestScoring,
    scoringCategoryAverages,
    frequentTools,
    recentFrequentTools,
  }
}
