import { useMemo } from "react"
import { formatWeekLabel, formatWeekRange, groupByDate } from "@/lib/utils"
import { ReportCard } from "@/components/shared/ReportCard"
import type { WeeklyReport } from "@/types"

interface Props {
  reports: WeeklyReport[]
}

export function ListView({ reports }: Props) {
  const { grouped, sortedKeys } = useMemo(() => {
    const groupedReports = groupByDate(reports)
    const keys = Array.from(groupedReports.keys()).sort((a, b) => b.localeCompare(a))
    return { grouped: groupedReports, sortedKeys: keys }
  }, [reports])

  return (
    <div className="space-y-6">
      {sortedKeys.map((weekKey) => {
        const weekReports = grouped.get(weekKey)!
        const firstReport = weekReports[0]
        const range = formatWeekRange(firstReport.date_range.start, firstReport.date_range.end)
        return (
          <div key={weekKey}>
            <h3 className="mb-2 text-lg font-semibold">
              {formatWeekLabel(weekKey)}{" "}
              <span className="text-sm font-normal text-muted-foreground">({range})</span>
            </h3>
            <div className="space-y-2">
              {weekReports.map((report) => (
                <ReportCard key={report.filename} report={report} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
