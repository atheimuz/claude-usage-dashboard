import { Link, useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatNumber } from "@/lib/utils"
import type { DailyReport } from "@/types"

interface Props {
  report: DailyReport
  prevFilename?: string
  nextFilename?: string
}

export function DailyHeader({ report, prevFilename, nextFilename }: Props) {
  const navigate = useNavigate()

  return (
    <div className="space-y-2">
      <Link
        to="/daily"
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
            onClick={() => prevFilename && navigate(`/daily/${prevFilename}`)}
            aria-label="이전 일지"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{formatDate(report.date)}</h1>
              <Badge variant="secondary">{report.identifier}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {report.summary.sessions}개 세션 · 평균 {formatNumber(report.summary.avg_messages)} 메시지 · 평균 {formatNumber(report.summary.avg_tool_calls)} 도구 호출
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            disabled={!nextFilename}
            onClick={() => nextFilename && navigate(`/daily/${nextFilename}`)}
            aria-label="다음 일지"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
