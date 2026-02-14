import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { WeeklyReport } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FILENAME_REGEX_WEEKLY_PATH = /^([^/]+)\/(\d{4}-\d{2}-W\d+)$/
const FILENAME_REGEX_PATH = /^([^/]+)\/(\d{4}-\d{2}-\d{2})$/
const FILENAME_REGEX_FLAT = /^(\d{4}-\d{2}-\d{2})-(.+)$/

export function parseFilename(filename: string): { date: string; identifier: string; filename: string } {
  const clean = filename.replace(/\.(md|json)$/, "")
  const weeklyMatch = clean.match(FILENAME_REGEX_WEEKLY_PATH)
  if (weeklyMatch) return { date: weeklyMatch[2], identifier: weeklyMatch[1], filename: clean }
  const pathMatch = clean.match(FILENAME_REGEX_PATH)
  if (pathMatch) return { date: pathMatch[2], identifier: pathMatch[1], filename: clean }
  const flatMatch = clean.match(FILENAME_REGEX_FLAT)
  if (flatMatch) return { date: flatMatch[1], identifier: flatMatch[2], filename: clean }
  return { date: "", identifier: "", filename: clean }
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"]

export function getDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return DAY_NAMES[d.getDay()]
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`
}

export function formatDateShort(dateStr: string): string {
  const parts = dateStr.split("-")
  return `${parts[1]}-${parts[2]}`
}

// "2026-01-W3" → "2026년 01월 3주차"
export function formatWeekLabel(weekKey: string): string {
  const match = weekKey.match(/^(\d{4})-(\d{2})-W(\d+)$/)
  if (!match) return weekKey
  const year = match[1]
  const month = match[2]
  const week = match[3]
  return `${year}년 ${month}월 ${week}주차`
}

// date_range start/end → "01/15 ~ 01/21"
export function formatWeekRange(start: string, end: string): string {
  const s = start.split("T")[0]
  const e = end.split("T")[0]
  const sp = s.split("-")
  const ep = e.split("-")
  return `${sp[1]}/${sp[2]} ~ ${ep[1]}/${ep[2]}`
}

// date_range의 start/end로부터 해당 주에 포함되는 모든 날짜 "YYYY-MM-DD" 배열 생성
export function getWeekDates(startDate: string, endDate: string): string[] {
  const start = new Date(startDate.split("T")[0] + "T00:00:00")
  const end = new Date(endDate.split("T")[0] + "T00:00:00")
  const dates: string[] = []
  const current = new Date(start)
  while (current <= end) {
    const y = current.getFullYear()
    const m = String(current.getMonth() + 1).padStart(2, "0")
    const d = String(current.getDate()).padStart(2, "0")
    dates.push(`${y}-${m}-${d}`)
    current.setDate(current.getDate() + 1)
  }
  return dates
}

const numberFormat = new Intl.NumberFormat("ko-KR")

export function formatNumber(num: number): string {
  return numberFormat.format(num)
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%"
  return `${((value / total) * 100).toFixed(1)}%`
}

export function groupByDate(reports: WeeklyReport[]): Map<string, WeeklyReport[]> {
  const map = new Map<string, WeeklyReport[]>()
  for (const report of reports) {
    const existing = map.get(report.date)
    if (existing) {
      existing.push(report)
    } else {
      map.set(report.date, [report])
    }
  }
  return map
}

function extractKeyFromPath(file: string): string {
  const clean = file.replace(/\.(md|json)$/, "")
  if (clean.includes("/")) {
    return clean.split("/")[1] || ""
  }
  const match = clean.match(/^(\d{4}-\d{2}-(W\d+|\d{2}))/)
  return match ? match[1] : ""
}

// 주간 키 정렬용: "2026-01-W3" → "2026-01-W03" 로 패딩하여 문자열 비교 가능하게
function normalizeKeyForSort(key: string): string {
  const weekMatch = key.match(/^(\d{4}-\d{2})-W(\d+)$/)
  if (weekMatch) {
    return `${weekMatch[1]}-W${weekMatch[2].padStart(2, "0")}`
  }
  return key
}

export function sortFilesByDate(files: string[]): string[] {
  return [...files].sort((a, b) => {
    const keyA = normalizeKeyForSort(extractKeyFromPath(a))
    const keyB = normalizeKeyForSort(extractKeyFromPath(b))
    if (keyB !== keyA) return keyB.localeCompare(keyA)
    return a.localeCompare(b)
  })
}

export function getNextPrevFilename(
  currentFilename: string,
  files: string[],
): { prev?: string; next?: string } {
  const sorted = sortFilesByDate(files)
  const currentWithExt = currentFilename.endsWith(".json")
    ? currentFilename
    : `${currentFilename}.json`
  const idx = sorted.indexOf(currentWithExt)
  return {
    prev: idx < sorted.length - 1 ? sorted[idx + 1].replace(/\.(md|json)$/, "") : undefined,
    next: idx > 0 ? sorted[idx - 1].replace(/\.(md|json)$/, "") : undefined,
  }
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split("T")[0]
}
