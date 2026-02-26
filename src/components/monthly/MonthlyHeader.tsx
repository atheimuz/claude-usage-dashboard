import { Link, useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatWeekLabel, formatWeekRange, formatNumber } from "@/lib/utils"
import type { WeeklyReport } from "@/types"

interface Props {
  report: WeeklyReport
  prevFilename?: string
  nextFilename?: string
}

export function WeeklyHeader({ report, prevFilename, nextFilename }: Props) {
  const navigate = useNavigate()

  return (
    <div className="space-y-2">
      <Link
        to="/weekly"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        목록
      </Link>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            disabled={!prevFilename}
            onClick={() => prevFilename && navigate(`/weekly/${prevFilename}`)}
            aria-label="이전 주"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{formatWeekLabel(report.date)}</h1>
              <Badge variant="secondary">{report.identifier}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatWeekRange(report.date_range.start, report.date_range.end)} · {report.summary.sessions}개 세션 · 평균 {formatNumber(report.summary.avg_messages)} 메시지 · 평균 {formatNumber(report.summary.avg_tool_calls)} 도구 호출
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            disabled={!nextFilename}
            onClick={() => nextFilename && navigate(`/weekly/${nextFilename}`)}
            aria-label="다음 주"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
