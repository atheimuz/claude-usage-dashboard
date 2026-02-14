/**
 * 목업 데이터: FrequentTools 기능
 *
 * 실제 API 존재 여부와 관계없이 항상 목업 데이터를 사용
 * - WeeklyReport의 tool_usage.agents, commands, skills 데이터
 * - FrequentToolItem 집계 결과
 */

import type { WeeklyReport, FrequentToolItem } from "@/types";

// FrequentTools용 WeeklyReport 목업 데이터 (agents, commands, skills 포함)
export const MOCK_REPORTS_WITH_TOOLS: Partial<WeeklyReport>[] = [
    {
        identifier: "work/2026-02-08",
        filename: "2026-02-08",
        date: "2026-02-08",
        date_range: { start: "2026-02-08", end: "2026-02-08" },
        summary: {
            sessions: 50,
            avg_messages: 15,
            avg_tool_calls: 30,
            main_tasks: ["Coding"]
        },
        tool_usage: {
            skills: [
                { name: "/session-analyzer", count: 12, description: "세션 로그를 분석하여 활동 요약 생성" },
                { name: "/test-runner", count: 8, description: "테스트 실행 및 결과 분석" }
            ],
            agents: [
                { type: "Planner", count: 25, description: "구현 계획 및 전략 수립" },
                { type: "Coder", count: 18, description: "코드 작성 및 구현" }
            ],
            commands: [
                { name: "/session-analyzer", count: 5 }, // 동일 이름, 다른 카테고리
                { name: "/fix", count: 10, description: "버그 수정 및 코드 개선" },
                { name: "/commit", count: 15, description: "변경사항 커밋 메시지 생성" }
            ],
            top_tools: [
                { name: "Read", count: 100 },
                { name: "Write", count: 80 }
            ]
        },
        usage_style: {
            prompt_stats: {
                avg_length: 120,
                avg_words: 20,
                distribution: { command: 0.3, descriptive: 0.5, plan_based: 0.2 }
            },
            session_scale: {
                small: { count: 10, avg_turns: 3 },
                medium: { count: 8, avg_turns: 7 }
            },
            correction_ratio: { initial: 0.8, followup: 0.2, ratio: 4 }
        },
        scoring: {
            total: 85,
            grade: "A",
            categories: {
                intent: { score: 20, max: 25 },
                efficiency: { score: 22, max: 25 },
                fitness: { score: 23, max: 25 },
                workflow: { score: 20, max: 25 }
            }
        },
        feedback: {
            strengths: ["명확한 요구사항"],
            improvements: ["컨텍스트 보강"],
            context_tips: ["파일 구조 공유"]
        },
        error_summary: {
            rate: 0.1,
            total: 5,
            main_types: ["syntax error"],
            recovery: { immediate_fix: 4, alternative: 1 }
        },
        main_workflow: "탐색 → 수정 → 검증"
    },
    {
        identifier: "side/2026-02-09",
        filename: "2026-02-09",
        date: "2026-02-09",
        date_range: { start: "2026-02-09", end: "2026-02-09" },
        summary: {
            sessions: 30,
            avg_messages: 12,
            avg_tool_calls: 25,
            main_tasks: ["Testing"]
        },
        tool_usage: {
            skills: [
                { name: "/session-analyzer", count: 7, description: "세션 로그를 분석하여 활동 요약 생성" },
                { name: "/doc-generator", count: 6, description: "문서 자동 생성" }
            ],
            agents: [
                { type: "Planner", count: 15, description: "구현 계획 및 전략 수립" },
                { type: "Debugger", count: 10, description: "디버깅 및 오류 분석" }
            ],
            commands: [
                { name: "/fix", count: 8, description: "버그 수정 및 코드 개선" },
                { name: "/test", count: 12, description: "테스트 실행" }
            ],
            top_tools: [
                { name: "Edit", count: 70 },
                { name: "Bash", count: 60 }
            ]
        },
        usage_style: {
            prompt_stats: {
                avg_length: 100,
                avg_words: 18,
                distribution: { command: 0.4, descriptive: 0.4, plan_based: 0.2 }
            },
            session_scale: {
                small: { count: 15, avg_turns: 4 }
            },
            correction_ratio: { initial: 0.75, followup: 0.25, ratio: 3 }
        },
        scoring: {
            total: 78,
            grade: "B",
            categories: {
                intent: { score: 18, max: 25 },
                efficiency: { score: 20, max: 25 },
                fitness: { score: 21, max: 25 },
                workflow: { score: 19, max: 25 }
            }
        },
        feedback: {
            strengths: ["단계적 접근"],
            improvements: ["에러 처리"],
            context_tips: ["테스트 환경 명시"]
        },
        error_summary: {
            rate: 0.15,
            total: 4,
            main_types: ["runtime error"],
            recovery: { immediate_fix: 3, alternative: 1 }
        },
        main_workflow: "분석 → 구현 → 테스트"
    },
    {
        identifier: "work/2026-02-10",
        filename: "2026-02-10",
        date: "2026-02-10",
        date_range: { start: "2026-02-10", end: "2026-02-10" },
        summary: {
            sessions: 40,
            avg_messages: 14,
            avg_tool_calls: 28,
            main_tasks: ["Refactoring"]
        },
        tool_usage: {
            skills: [
                { name: "/test-runner", count: 9, description: "테스트 실행 및 결과 분석" },
                { name: "/doc-generator", count: 5, description: "문서 자동 생성" }
            ],
            agents: [
                { type: "Coder", count: 20, description: "코드 작성 및 구현" },
                { type: "Reviewer", count: 12, description: "코드 리뷰 및 품질 검토" }
            ],
            commands: [
                { name: "/commit", count: 18, description: "변경사항 커밋 메시지 생성" },
                { name: "/test", count: 7, description: "테스트 실행" }
            ],
            top_tools: [
                { name: "Read", count: 90 },
                { name: "Grep", count: 75 }
            ]
        },
        usage_style: {
            prompt_stats: {
                avg_length: 110,
                avg_words: 19,
                distribution: { command: 0.35, descriptive: 0.45, plan_based: 0.2 }
            },
            session_scale: {
                medium: { count: 12, avg_turns: 6 }
            },
            correction_ratio: { initial: 0.82, followup: 0.18, ratio: 4.5 }
        },
        scoring: {
            total: 82,
            grade: "A",
            categories: {
                intent: { score: 19, max: 25 },
                efficiency: { score: 21, max: 25 },
                fitness: { score: 22, max: 25 },
                workflow: { score: 20, max: 25 }
            }
        },
        feedback: {
            strengths: ["체계적 리팩토링"],
            improvements: ["테스트 커버리지"],
            context_tips: ["변경 범위 명시"]
        },
        error_summary: {
            rate: 0.08,
            total: 3,
            main_types: ["type error"],
            recovery: { immediate_fix: 3, alternative: 0 }
        },
        main_workflow: "검색 → 분석 → 최적화"
    }
];

// 집계 결과 (상위 10개, 사용 횟수순 정렬)
// agent::Planner: 25+15 = 40
// agent::Coder: 18+20 = 38
// command::/commit: 15+18 = 33
// skill::/session-analyzer: 12+7 = 19
// command::/test: 12+7 = 19
// command::/fix: 10+8 = 18
// skill::/test-runner: 8+9 = 17
// agent::Debugger: 10
// agent::Reviewer: 12
// skill::/doc-generator: 6+5 = 11
// command::/session-analyzer: 5 (동일 이름, 다른 카테고리)
export const MOCK_FREQUENT_TOOLS: FrequentToolItem[] = [
    { name: "Planner", category: "agent", totalCount: 40, description: "구현 계획 및 전략 수립" },
    { name: "Coder", category: "agent", totalCount: 38, description: "코드 작성 및 구현" },
    { name: "/commit", category: "command", totalCount: 33, description: "변경사항 커밋 메시지 생성" },
    { name: "/session-analyzer", category: "skill", totalCount: 19, description: "세션 로그를 분석하여 활동 요약 생성" },
    { name: "/test", category: "command", totalCount: 19, description: "테스트 실행" },
    { name: "/fix", category: "command", totalCount: 18, description: "버그 수정 및 코드 개선" },
    { name: "/test-runner", category: "skill", totalCount: 17, description: "테스트 실행 및 결과 분석" },
    { name: "Reviewer", category: "agent", totalCount: 12, description: "코드 리뷰 및 품질 검토" },
    { name: "/doc-generator", category: "skill", totalCount: 11, description: "문서 자동 생성" },
    { name: "Debugger", category: "agent", totalCount: 10, description: "디버깅 및 오류 분석" }
];

// 빈 도구 데이터 (FrequentTools 미렌더링 테스트용)
export const MOCK_REPORTS_EMPTY_TOOLS: Partial<WeeklyReport>[] = [
    {
        identifier: "work/2026-02-11",
        filename: "2026-02-11",
        date: "2026-02-11",
        date_range: { start: "2026-02-11", end: "2026-02-11" },
        summary: {
            sessions: 10,
            avg_messages: 5,
            avg_tool_calls: 8,
            main_tasks: ["Planning"]
        },
        tool_usage: {
            skills: [],
            agents: [],
            commands: [],
            top_tools: [
                { name: "Read", count: 20 }
            ]
        },
        usage_style: {
            prompt_stats: {
                avg_length: 80,
                avg_words: 15,
                distribution: { command: 0.3, descriptive: 0.5, plan_based: 0.2 }
            },
            session_scale: {
                small: { count: 5, avg_turns: 2 }
            },
            correction_ratio: { initial: 0.9, followup: 0.1, ratio: 9 }
        },
        scoring: {
            total: 70,
            grade: "B",
            categories: {
                intent: { score: 17, max: 25 },
                efficiency: { score: 18, max: 25 },
                fitness: { score: 18, max: 25 },
                workflow: { score: 17, max: 25 }
            }
        },
        feedback: {
            strengths: ["간결한 요청"],
            improvements: ["구체성"],
            context_tips: ["목표 명시"]
        },
        error_summary: {
            rate: 0.05,
            total: 1,
            main_types: ["minor error"],
            recovery: { immediate_fix: 1, alternative: 0 }
        },
        main_workflow: "설계 → 검증"
    }
];

// API 응답 래퍼 헬퍼
export const wrapResponse = <T>(data: T): string => {
    return JSON.stringify(data);
};
