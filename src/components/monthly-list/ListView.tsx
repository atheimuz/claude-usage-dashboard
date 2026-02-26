import { useMemo } from "react"
import { formatMonthLabel, groupByDate } from "@/lib/utils"
import { ReportCard } from "@/components/shared/ReportCard"
import type { MonthlyReport } from "@/types"

interface Props {
  reports: MonthlyReport[]
}

export function ListView({ reports }: Props) {
  const { grouped, sortedKeys } = useMemo(() => {
    const groupedReports = groupByDate(reports)
    const keys = Array.from(groupedReports.keys()).sort((a, b) => b.localeCompare(a))
    return { grouped: groupedReports, sortedKeys: keys }
  }, [reports])

  return (
    <div className="space-y-6">
      {sortedKeys.map((monthKey) => {
        const monthReports = grouped.get(monthKey)!
        return (
          <div key={monthKey}>
            <h3 className="mb-2 text-lg font-semibold">
              {formatMonthLabel(monthKey)}
            </h3>
            <div className="space-y-2">
              {monthReports.map((report) => (
                <ReportCard key={report.filename} report={report} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
