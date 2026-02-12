import { useMemo } from "react"
import { formatDate, groupByDate } from "@/lib/utils"
import { ReportCard } from "@/components/shared/ReportCard"
import type { DailyReport } from "@/types"

interface Props {
  reports: DailyReport[]
}

export function ListView({ reports }: Props) {
  const { grouped, sortedDates } = useMemo(() => {
    const g = groupByDate(reports)
    const dates = Array.from(g.keys()).sort((a, b) => b.localeCompare(a))
    return { grouped: g, sortedDates: dates }
  }, [reports])

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const dayReports = grouped.get(date)!
        return (
          <div key={date}>
            <h3 className="mb-2 text-lg font-semibold">{formatDate(date)}</h3>
            <div className="space-y-2">
              {dayReports.map((report) => (
                <ReportCard key={report.filename} report={report} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
