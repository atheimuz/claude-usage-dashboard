import { useQuery, useQueries } from "@tanstack/react-query"
import type { DailyReport, FileEntry } from "@/types"

async function fetchFileList(): Promise<string[]> {
  const res = await fetch("/data/index.json")
  if (!res.ok) throw new Error("파일 목록을 불러올 수 없습니다.")
  const data = await res.json()
  const entries = data.files as FileEntry[]
  return entries.map((f) => `${f.location}/${f.name}`)
}

async function fetchReport(file: string): Promise<DailyReport> {
  const res = await fetch(`/data/${file}`)
  if (!res.ok) throw new Error(`파일을 찾을 수 없습니다: ${file}`)
  return res.json()
}

export function useFileList() {
  return useQuery({
    queryKey: ["fileList"],
    queryFn: fetchFileList,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useDailyReport(filename: string) {
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
    .filter((d): d is DailyReport => d !== undefined)

  const isLoading = filesLoading || queries.some((q) => q.isLoading)
  const isError = filesError || queries.some((q) => q.isError)

  return { data, isLoading, isError }
}
