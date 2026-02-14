import { useMemo, useState } from "react"
import { Calendar, AlertCircle, FileText, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useAllReports } from "@/hooks/useReports"
import { CalendarView } from "@/components/weekly-list/CalendarView"
import { ListView } from "@/components/weekly-list/ListView"

export function WeeklyListPage() {
  const { data: reports, isLoading, isError } = useAllReports()
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  const filteredReports = useMemo(() => {
    if (!selectedMonth) return reports
    return reports.filter((r) => r.date.startsWith(selectedMonth))
  }, [reports, selectedMonth])

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
        <p className="text-sm text-muted-foreground">public/data/ 디렉토리에 주간 데이터 파일을 추가해 주세요.</p>
      </div>
    )
  }

  const selectedLabel = useMemo(() => {
    if (!selectedMonth) return null
    const [year, month] = selectedMonth.split("-")
    return `${year}년 ${month}월`
  }, [selectedMonth])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Logs</h1>
          <p className="text-muted-foreground">주간별 클로드 코드 사용 일지</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1" aria-label="달력에서 월 선택하기">
              <Calendar className="h-4 w-4" />
              달력 보기
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto">
            <CalendarView
              reports={reports}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div aria-live="polite">
        {selectedLabel && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedLabel}</Badge>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedMonth(null)} aria-label="월 필터 해제">
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      <ListView reports={filteredReports} />
    </div>
  )
}
