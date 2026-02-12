import { useState } from "react"
import { Calendar, AlertCircle, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAllReports } from "@/hooks/useReports"
import { CalendarView } from "@/components/daily-list/CalendarView"
import { ListView } from "@/components/daily-list/ListView"

export function DailyListPage() {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const { data: reports, isLoading, isError } = useAllReports()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>오류</AlertTitle>
        <AlertDescription>데이터를 불러올 수 없습니다.</AlertDescription>
        <Button size="sm" className="mt-2" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </Alert>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
        <p className="text-lg font-semibold">기록된 사용 일지가 없습니다.</p>
        <p className="text-sm text-muted-foreground">public/data/ 디렉토리에 마크다운 파일을 추가해 주세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Logs</h1>
          <p className="text-muted-foreground">날짜별 클로드 코드 사용 일지</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCalendarOpen((v) => !v)}
          className="gap-1"
          aria-expanded={calendarOpen}
          aria-controls="calendar-panel"
        >
          <Calendar className="h-4 w-4" />
          달력 보기
          {calendarOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {calendarOpen && (
        <Card id="calendar-panel">
          <CardContent className="p-4">
            <CalendarView reports={reports} />
          </CardContent>
        </Card>
      )}

      <ListView reports={reports} />
    </div>
  )
}
