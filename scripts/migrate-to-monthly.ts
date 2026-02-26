/**
 * 주간 JSON 파일을 월간 JSON 파일로 병합하는 마이그레이션 스크립트
 *
 * 사용법: npx tsx scripts/migrate-to-monthly.ts
 *
 * 동작:
 * 1. public/data/{location}/YYYY-MM-WN.json 파일들을 읽음
 * 2. 같은 location+월에 속하는 파일들을 병합
 * 3. public/data/{location}/YYYY-MM.json 으로 저장
 * 4. 기존 주간 파일 삭제
 * 5. index.json 업데이트
 */

import * as fs from "node:fs"
import * as path from "node:path"

interface RawReport {
    date_range: { start: string; end: string }
    summary: { sessions: number; avg_messages: number; avg_tool_calls: number; main_tasks: string[] }
    usage_style: {
        prompt_stats: { avg_length: number; avg_words: number; distribution: { command: number; descriptive: number; plan_based: number } }
        session_scale: Record<string, { count: number; avg_turns: number }>
        correction_ratio: { initial: number; followup: number; ratio: number }
    }
    tool_usage: {
        skills: { name?: string; type?: string; count: number; description?: string }[]
        custom_commands?: { name?: string; type?: string; count: number; description?: string }[]
        agents: { name?: string; type?: string; count: number; description?: string }[]
        commands: { name?: string; type?: string; count: number; description?: string }[]
        top_tools: { name?: string; type?: string; count: number; description?: string }[]
    }
    scoring: { total: number; grade: string; categories: Record<string, { score: number; max: number }> }
    feedback: { strengths: string[]; improvements: string[]; context_tips: string[] }
    error_summary: { rate: number; total: number; main_types: string[]; recovery: { immediate_fix: number; alternative: number } }
    main_workflow: string
    config_changes?: { category: string; name: string; action: string; changes: number; details: string[] }[]
}

const DATA_DIR = path.resolve(import.meta.dirname, "../public/data")

function weightedAvg(reports: RawReport[], getValue: (r: RawReport) => number, getWeight: (r: RawReport) => number): number {
    const totalWeight = reports.reduce((s, r) => s + getWeight(r), 0)
    if (totalWeight === 0) return 0
    const weighted = reports.reduce((s, r) => s + getValue(r) * getWeight(r), 0)
    return Math.round((weighted / totalWeight) * 10) / 10
}

function mergeToolItems(items: { name?: string; type?: string; count: number; description?: string }[], key: "name" | "type") {
    const map = new Map<string, { name?: string; type?: string; count: number; description?: string }>()
    for (const item of items) {
        const k = item[key] || "Unknown"
        const existing = map.get(k)
        if (existing) {
            existing.count += item.count
            if (!existing.description && item.description) existing.description = item.description
        } else {
            map.set(k, { ...item })
        }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

function calculateGrade(total: number): string {
    if (total >= 95) return "S"
    if (total >= 80) return "A"
    if (total >= 65) return "B"
    if (total >= 50) return "C"
    if (total >= 35) return "D"
    return "F"
}

function mergeReports(reports: RawReport[]): RawReport {
    if (reports.length === 1) return reports[0]

    const totalSessions = reports.reduce((s, r) => s + r.summary.sessions, 0)
    const getSession = (r: RawReport) => r.summary.sessions

    // session_scale 병합
    const scaleMap = new Map<string, { count: number; totalTurns: number }>()
    for (const r of reports) {
        for (const [key, val] of Object.entries(r.usage_style.session_scale)) {
            const existing = scaleMap.get(key)
            if (existing) {
                existing.totalTurns += val.avg_turns * val.count
                existing.count += val.count
            } else {
                scaleMap.set(key, { count: val.count, totalTurns: val.avg_turns * val.count })
            }
        }
    }
    const sessionScale: Record<string, { count: number; avg_turns: number }> = {}
    for (const [key, val] of scaleMap) {
        sessionScale[key] = { count: val.count, avg_turns: Math.round((val.totalTurns / val.count) * 10) / 10 }
    }

    // scoring categories 평균
    const catKeys = ["intent", "efficiency", "fitness", "workflow"]
    const categories: Record<string, { score: number; max: number }> = {}
    for (const key of catKeys) {
        const scores = reports.map(r => r.scoring.categories[key]?.score ?? 0)
        const maxes = reports.map(r => r.scoring.categories[key]?.max ?? 0)
        categories[key] = {
            score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            max: Math.max(...maxes),
        }
    }

    const avgTotal = Math.round(reports.reduce((s, r) => s + r.scoring.total, 0) / reports.length)

    // correction_ratio
    const totalInitial = reports.reduce((s, r) => s + r.usage_style.correction_ratio.initial, 0)
    const totalFollowup = reports.reduce((s, r) => s + r.usage_style.correction_ratio.followup, 0)

    // main_workflow: 세션 수 최대인 주간에서 선택
    const largestReport = reports.reduce((max, r) => r.summary.sessions > max.summary.sessions ? r : max, reports[0])

    return {
        date_range: {
            start: reports.map(r => r.date_range.start).sort()[0],
            end: reports.map(r => r.date_range.end).sort().reverse()[0],
        },
        summary: {
            sessions: totalSessions,
            avg_messages: weightedAvg(reports, r => r.summary.avg_messages, getSession),
            avg_tool_calls: weightedAvg(reports, r => r.summary.avg_tool_calls, getSession),
            main_tasks: [...new Set(reports.flatMap(r => r.summary.main_tasks))],
        },
        usage_style: {
            prompt_stats: {
                avg_length: weightedAvg(reports, r => r.usage_style.prompt_stats.avg_length, getSession),
                avg_words: Math.round(weightedAvg(reports, r => r.usage_style.prompt_stats.avg_words, getSession)),
                distribution: {
                    command: reports.reduce((s, r) => s + r.usage_style.prompt_stats.distribution.command, 0),
                    descriptive: reports.reduce((s, r) => s + r.usage_style.prompt_stats.distribution.descriptive, 0),
                    plan_based: reports.reduce((s, r) => s + r.usage_style.prompt_stats.distribution.plan_based, 0),
                },
            },
            session_scale: sessionScale,
            correction_ratio: {
                initial: totalInitial,
                followup: totalFollowup,
                ratio: totalInitial > 0 ? Math.round((totalFollowup / totalInitial) * 100) / 100 : 0,
            },
        },
        tool_usage: {
            skills: mergeToolItems(reports.flatMap(r => r.tool_usage.skills), "name"),
            agents: mergeToolItems(reports.flatMap(r => r.tool_usage.agents), "type"),
            commands: mergeToolItems(reports.flatMap(r => r.tool_usage.commands), "name"),
            top_tools: mergeToolItems(reports.flatMap(r => r.tool_usage.top_tools), "name"),
        },
        scoring: {
            total: avgTotal,
            grade: calculateGrade(avgTotal),
            categories,
        },
        feedback: {
            strengths: [...new Set(reports.flatMap(r => r.feedback.strengths))],
            improvements: [...new Set(reports.flatMap(r => r.feedback.improvements))],
            context_tips: [...new Set(reports.flatMap(r => r.feedback.context_tips))],
        },
        error_summary: {
            rate: weightedAvg(reports, r => r.error_summary.rate, getSession),
            total: reports.reduce((s, r) => s + r.error_summary.total, 0),
            main_types: [...new Set(reports.flatMap(r => r.error_summary.main_types))],
            recovery: {
                immediate_fix: reports.reduce((s, r) => s + r.error_summary.recovery.immediate_fix, 0),
                alternative: reports.reduce((s, r) => s + r.error_summary.recovery.alternative, 0),
            },
        },
        main_workflow: largestReport.main_workflow,
        config_changes: reports.flatMap(r => r.config_changes ?? []),
    }
}

function main() {
    // index.json 읽기
    const indexPath = path.join(DATA_DIR, "index.json")
    const index = JSON.parse(fs.readFileSync(indexPath, "utf-8")) as { files: { name: string; location: string }[] }

    // 주간 파일만 필터 (YYYY-MM-WN.json 패턴)
    const weeklyPattern = /^\d{4}-\d{2}-W\d+\.json$/
    const weeklyFiles = index.files.filter(f => weeklyPattern.test(f.name))

    if (weeklyFiles.length === 0) {
        console.log("주간 파일이 없습니다. 마이그레이션 불필요.")
        return
    }

    // location+월 기준으로 그룹핑
    const groups = new Map<string, { location: string; month: string; files: string[] }>()
    for (const entry of weeklyFiles) {
        const month = entry.name.slice(0, 7) // "2026-02"
        const key = `${entry.location}/${month}`
        const existing = groups.get(key)
        if (existing) {
            existing.files.push(entry.name)
        } else {
            groups.set(key, { location: entry.location, month, files: [entry.name] })
        }
    }

    const newIndexFiles: { name: string; location: string }[] = []
    const deletedFiles: string[] = []

    for (const [, group] of groups) {
        // 주간 파일들 읽기
        const reports: RawReport[] = []
        for (const filename of group.files) {
            const filePath = path.join(DATA_DIR, group.location, filename)
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as RawReport
            reports.push(data)
        }

        // 병합
        const merged = mergeReports(reports)

        // 월간 파일 저장
        const monthlyFilename = `${group.month}.json`
        const monthlyPath = path.join(DATA_DIR, group.location, monthlyFilename)
        fs.writeFileSync(monthlyPath, JSON.stringify(merged, null, 4), "utf-8")
        console.log(`생성: ${group.location}/${monthlyFilename} (${group.files.length}개 주간 파일 병합)`)

        newIndexFiles.push({ name: monthlyFilename, location: group.location })

        // 주간 파일 삭제
        for (const filename of group.files) {
            const filePath = path.join(DATA_DIR, group.location, filename)
            fs.unlinkSync(filePath)
            deletedFiles.push(`${group.location}/${filename}`)
        }
    }

    // 비주간 파일은 유지
    const nonWeeklyFiles = index.files.filter(f => !weeklyPattern.test(f.name))

    // index.json 업데이트
    const newIndex = { files: [...newIndexFiles, ...nonWeeklyFiles] }
    fs.writeFileSync(indexPath, JSON.stringify(newIndex, null, 4), "utf-8")

    console.log(`\n완료:`)
    console.log(`  생성: ${newIndexFiles.length}개 월간 파일`)
    console.log(`  삭제: ${deletedFiles.length}개 주간 파일`)
    console.log(`  index.json 업데이트 완료`)
}

main()
