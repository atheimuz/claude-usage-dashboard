import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DailyReport } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FILENAME_REGEX_PATH = /^([^/]+)\/(\d{4}-\d{2}-\d{2})$/
const FILENAME_REGEX_FLAT = /^(\d{4}-\d{2}-\d{2})-(.+)$/

export function parseFilename(filename: string): { date: string; identifier: string; filename: string } {
  const clean = filename.replace(/\.md$/, "")
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

const numberFormat = new Intl.NumberFormat("ko-KR")

export function formatNumber(num: number): string {
  return numberFormat.format(num)
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%"
  return `${((value / total) * 100).toFixed(1)}%`
}

export function groupByDate(reports: DailyReport[]): Map<string, DailyReport[]> {
  const map = new Map<string, DailyReport[]>()
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

function extractDateFromPath(file: string): string {
  const clean = file.replace(/\.md$/, "")
  if (clean.includes("/")) {
    return clean.split("/")[1] || ""
  }
  const match = clean.match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ""
}

export function sortFilesByDate(files: string[]): string[] {
  return [...files].sort((a, b) => {
    const dateA = extractDateFromPath(a)
    const dateB = extractDateFromPath(b)
    if (dateB !== dateA) return dateB.localeCompare(dateA)
    return a.localeCompare(b)
  })
}

export function getNextPrevFilename(
  currentFilename: string,
  files: string[],
): { prev?: string; next?: string } {
  const sorted = sortFilesByDate(files)
  const currentWithExt = currentFilename.endsWith(".md")
    ? currentFilename
    : `${currentFilename}.md`
  const idx = sorted.indexOf(currentWithExt)
  return {
    prev: idx < sorted.length - 1 ? sorted[idx + 1].replace(/\.md$/, "") : undefined,
    next: idx > 0 ? sorted[idx - 1].replace(/\.md$/, "") : undefined,
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
