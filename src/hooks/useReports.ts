import { useQuery, useQueries } from "@tanstack/react-query"
import type { WeeklyReport, FileEntry } from "@/types"
import { parseFilename } from "@/lib/utils"

async function fetchFileList(): Promise<string[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/index.json`)
  if (!res.ok) throw new Error("파일 목록을 불러올 수 없습니다.")
  const data = await res.json()
  const entries = data.files as FileEntry[]
  return entries.map((f) => `${f.location}/${f.name}`)
}

function extractDateFromRange(dateRangeStart: string): string {
  // "2026-02-12T00:00:00" → "2026-02-12"
  return dateRangeStart.split("T")[0]
}

async function fetchReport(file: string): Promise<WeeklyReport> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${file}`)
  if (!res.ok) throw new Error(`파일을 찾을 수 없습니다: ${file}`)
  const data = await res.json()

  // 파일 경로에서 메타 정보 추출
  const { date: fileDate, identifier, filename } = parseFilename(file)
  const date = fileDate || extractDateFromRange(data.date_range.start)

  return {
    ...data,
    identifier,
    filename,
    date,
  }
}

export function useFileList() {
  return useQuery({
    queryKey: ["fileList"],
    queryFn: fetchFileList,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useWeeklyReport(filename: string) {
  return useQuery({
    queryKey: ["report", filename],
    queryFn: () => fetchReport(`${filename}.json`),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!filename,
  })
}

export function useAllReports() {
  const { data: files, isLoading: filesLoading, isError: filesError } = useFileList()

  const queries = useQueries({
    queries: (files ?? []).map((file) => ({
      queryKey: ["report", file.replace(/\.json$/, "")],
      queryFn: () => fetchReport(file),
      staleTime: Infinity,
      gcTime: Infinity,
    })),
  })

  const data = queries
    .map((q) => q.data)
    .filter((d): d is WeeklyReport => d !== undefined)

  const isLoading = filesLoading || queries.some((q) => q.isLoading)
  const isError = filesError || queries.some((q) => q.isError)

  return { data, isLoading, isError }
}
