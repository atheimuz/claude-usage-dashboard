import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReportCard } from "@/components/shared/ReportCard"
import type { WeeklyReport } from "@/types"

interface Props {
  reports: WeeklyReport[]
}

export function RecentActivity({ reports }: Props) {
  const recent = useMemo(() => {
    const sorted = [...reports].sort((a, b) => {
      const dc = b.date.localeCompare(a.date)
      if (dc !== 0) return dc
      return a.filename.localeCompare(b.filename)
    })
    return sorted.slice(0, 7)
  }, [reports])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">최근 활동</CardTitle>
        <Button variant="link" size="sm" asChild>
          <Link to="/weekly">전체 보기</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {recent.map((r) => (
          <ReportCard key={r.filename} report={r} showDate />
        ))}
      </CardContent>
    </Card>
  )
}
