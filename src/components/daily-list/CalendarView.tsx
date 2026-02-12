import { useMemo, useState, type KeyboardEvent } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn, getDaysInMonth, getFirstDayOfMonth, isToday, groupByDate } from "@/lib/utils"
import type { DailyReport } from "@/types"

interface Props {
  reports: DailyReport[]
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"]

export function CalendarView({ reports }: Props) {
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const grouped = useMemo(() => groupByDate(reports), [reports])

  const cells = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const result: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    return result
  }, [year, month])

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11) }
    else setMonth(month - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0) }
    else setMonth(month + 1)
  }

  const handleCellKeyDown = (e: KeyboardEvent, dayReports: DailyReport[]) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (dayReports.length === 1) {
        navigate(`/daily/${dayReports[0].filename}`)
      }
    }
  }

  return (
    <div role="grid" aria-label={`${year}년 ${month + 1}월 달력`}>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevMonth} aria-label="이전 달">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-lg font-semibold" aria-live="polite">
          {year}년 {month + 1}월
        </span>
        <Button variant="outline" size="icon" onClick={nextMonth} aria-label="다음 달">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1" role="row">
        {DAY_LABELS.map((d) => (
          <div key={d} role="columnheader" className="p-2 text-center text-sm font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} role="gridcell" />
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const dayReports = grouped.get(dateStr)
          const hasData = !!dayReports && dayReports.length > 0
          const today = isToday(dateStr)

          const cellContent = (
            <div
              role={hasData ? "button" : undefined}
              tabIndex={hasData ? 0 : undefined}
              aria-label={hasData ? `${month + 1}월 ${day}일 - ${dayReports!.length}건의 일지` : undefined}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg p-2 text-sm transition-colors",
                hasData && "cursor-pointer bg-primary/10 hover:bg-primary/20",
                today && "ring-2 ring-primary",
                !hasData && "text-muted-foreground",
              )}
              onClick={() => {
                if (!dayReports) return
                if (dayReports.length === 1) {
                  navigate(`/daily/${dayReports[0].filename}`)
                }
              }}
              onKeyDown={hasData ? (e) => handleCellKeyDown(e, dayReports!) : undefined}
            >
              <span>{day}</span>
              {hasData && dayReports && (
                <span className="text-xs text-muted-foreground">
                  {dayReports.length > 1 ? `${dayReports.length}건` : "●"}
                </span>
              )}
            </div>
          )

          if (hasData && dayReports && dayReports.length > 1) {
            return (
              <Popover key={dateStr}>
                <PopoverTrigger asChild>{cellContent}</PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="space-y-1">
                    {dayReports.map((r) => (
                      <Button
                        key={r.filename}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => navigate(`/daily/${r.filename}`)}
                      >
                        <Badge variant="secondary" className="mr-2">{r.identifier}</Badge>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )
          }

          return <div key={dateStr} role="gridcell">{cellContent}</div>
        })}
      </div>
    </div>
  )
}
