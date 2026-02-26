/**
 * 목업 데이터: Claude Usage Dashboard
 *
 * 실제 API 존재 여부와 관계없이 항상 목업 데이터를 사용
 * - /data/index.json: 파일 목록
 * - /data/{location}/{YYYY-MM}.json: 월간 리포트
 */

// 파일 목록 (index.json)
export const MOCK_INDEX_JSON = {
    files: [
        { name: "2026-02.json", location: "work" },
        { name: "2026-02.json", location: "side" },
        { name: "2026-01.json", location: "work" }
    ]
};

// 월간 리포트 JSON 데이터
export const MOCK_MONTHLY_REPORTS: Record<string, object> = {
    "work/2026-02": {
        date_range: {
            start: "2026-02-02T00:00:00",
            end: "2026-02-15T23:59:59"
        },
        summary: {
            sessions: 102,
            avg_messages: 58.3,
            avg_tool_calls: 15.7,
            main_tasks: ["Coding", "Refactoring", "Planning"]
        },
        usage_style: {
            prompt_stats: {
                avg_length: 520.5,
                avg_words: 82,
                distribution: { command: 20, descriptive: 450, plan_based: 130 }
            },
            session_scale: {
                small: { count: 70, avg_turns: 3.2 },
                medium: { count: 25, avg_turns: 8.5 },
                large: { count: 7, avg_turns: 18.1 }
            },
            correction_ratio: { initial: 102, followup: 63, ratio: 0.62 }
        },
        tool_usage: {
            skills: [
                { name: "/granular-commit", count: 30, description: "Git 변경사항을 세밀한 커밋으로 분리" }
            ],
            agents: [
                { type: "Explore", count: 15, description: "코드베이스 탐색" }
            ],
            commands: [],
            top_tools: [
                { name: "Read", count: 394, description: "코드 탐색 및 기존 구조 분석" },
                { name: "Edit", count: 245, description: "파일 수정" },
                { name: "Write", count: 123, description: "새 파일 생성" },
                { name: "Bash", count: 89, description: "Git 커밋, npm 명령" },
                { name: "Grep", count: 67, description: "코드베이스 검색" }
            ]
        },
        scoring: {
            total: 82,
            grade: "A",
            categories: {
                intent: { score: 22, max: 25 },
                efficiency: { score: 20, max: 25 },
                fitness: { score: 21, max: 25 },
                workflow: { score: 19, max: 25 }
            }
        },
        feedback: {
            strengths: ["명확한 컨텍스트 제공이 결과물 품질을 크게 향상시킴", "단계별 검증을 통해 오류를 조기에 발견"],
            improvements: ["더 구체적인 요구사항 전달 필요"],
            context_tips: ["프로젝트 구조를 먼저 공유하면 효율 향상"]
        },
        error_summary: {
            rate: 0.08,
            total: 8,
            main_types: ["타입 에러", "빌드 에러"],
            recovery: { immediate_fix: 6, alternative: 2 }
        },
        main_workflow: "탐색 → 수정 → 검증: Read → Edit → Bash",
        config_changes: [
            { category: "skill", name: "/granular-commit", action: "update", changes: 2, details: ["프롬프트 개선"] }
        ]
    },

    "side/2026-02": {
        date_range: {
            start: "2026-02-01T00:00:00",
            end: "2026-02-14T23:59:59"
        },
        summary: {
            sessions: 25,
            avg_messages: 42.1,
            avg_tool_calls: 14.0,
            main_tasks: ["Coding", "Refactoring"]
        },
        usage_style: {
            prompt_stats: {
                avg_length: 380.2,
                avg_words: 60,
                distribution: { command: 8, descriptive: 150, plan_based: 42 }
            },
            session_scale: {
                small: { count: 20, avg_turns: 2.8 },
                medium: { count: 5, avg_turns: 7.2 }
            },
            correction_ratio: { initial: 25, followup: 12, ratio: 0.48 }
        },
        tool_usage: {
            skills: [],
            agents: [],
            commands: [],
            top_tools: [
                { name: "Read", count: 120, description: "코드 분석" },
                { name: "Edit", count: 95, description: "파일 수정" },
                { name: "Write", count: 78, description: "새 파일 생성" },
                { name: "Bash", count: 57, description: "Git 명령" }
            ]
        },
        scoring: {
            total: 75,
            grade: "B",
            categories: {
                intent: { score: 20, max: 25 },
                efficiency: { score: 18, max: 25 },
                fitness: { score: 19, max: 25 },
                workflow: { score: 18, max: 25 }
            }
        },
        feedback: {
            strengths: ["작은 단위로 나눠서 작업하면 디버깅이 쉬움"],
            improvements: ["테스트 커버리지 확대 필요"],
            context_tips: ["기존 코드 패턴을 먼저 분석"]
        },
        error_summary: {
            rate: 0.04,
            total: 1,
            main_types: ["린트 에러"],
            recovery: { immediate_fix: 1, alternative: 0 }
        },
        main_workflow: "설계 → 구현 → 확인: Read → Write → Bash"
    },

    "work/2026-01": {
        date_range: {
            start: "2026-01-20T00:00:00",
            end: "2026-01-31T23:59:59"
        },
        summary: {
            sessions: 68,
            avg_messages: 55.0,
            avg_tool_calls: 13.1,
            main_tasks: ["Coding", "Content Creation", "Debugging"]
        },
        usage_style: {
            prompt_stats: {
                avg_length: 480.0,
                avg_words: 75,
                distribution: { command: 15, descriptive: 320, plan_based: 85 }
            },
            session_scale: {
                small: { count: 50, avg_turns: 3.0 },
                medium: { count: 15, avg_turns: 9.1 },
                large: { count: 3, avg_turns: 20.5 }
            },
            correction_ratio: { initial: 68, followup: 40, ratio: 0.59 }
        },
        tool_usage: {
            skills: [],
            agents: [
                { type: "Plan", count: 8, description: "구현 계획 수립" }
            ],
            commands: [],
            top_tools: [
                { name: "Read", count: 280, description: "코드 분석" },
                { name: "Edit", count: 195, description: "파일 수정" },
                { name: "Write", count: 167, description: "새 파일 생성" },
                { name: "Bash", count: 134, description: "Git, npm 명령" },
                { name: "Grep", count: 114, description: "코드 검색" }
            ]
        },
        scoring: {
            total: 78,
            grade: "B",
            categories: {
                intent: { score: 21, max: 25 },
                efficiency: { score: 19, max: 25 },
                fitness: { score: 20, max: 25 },
                workflow: { score: 18, max: 25 }
            }
        },
        feedback: {
            strengths: ["컴포넌트 재사용성을 고려한 설계가 중요", "점진적 최적화가 안전한 접근법"],
            improvements: ["에러 핸들링 패턴 통일 필요"],
            context_tips: ["프로젝트 컨벤션 문서를 활용"]
        },
        error_summary: {
            rate: 0.06,
            total: 4,
            main_types: ["타입 에러", "런타임 에러"],
            recovery: { immediate_fix: 3, alternative: 1 }
        },
        main_workflow: "분석 → 구현 → 테스트: Read → Write → Bash"
    }
};

// 빈 index.json (빈 상태 테스트용)
export const MOCK_EMPTY_INDEX_JSON = {
    files: []
};

// 집계된 통계 데이터 (홈 대시보드용)
export const MOCK_AGGREGATED_STATS = {
    totalDays: 3, // 2026-02 (work, side), 2026-01 (work)
    totalSessions: 195, // 102 + 25 + 68
    totalToolCalls: 2258, // sum of all top_tools counts
    toolUsageAggregated: [
        { toolName: "Read", usageCount: 794, primaryUse: "코드 탐색 및 분석" },
        { toolName: "Edit", usageCount: 535, primaryUse: "파일 수정" },
        { toolName: "Write", usageCount: 368, primaryUse: "새 파일 생성" },
        { toolName: "Bash", usageCount: 280, primaryUse: "Git, npm, 테스트 실행" },
        { toolName: "Grep", usageCount: 181, primaryUse: "코드베이스 검색" }
    ],
    taskTypeAggregated: [
        { type: "Coding", count: 150, description: "컴포넌트 개발, 페이지 생성, 기능 구현" },
        { type: "Refactoring", count: 25, description: "코드 구조 개선, 타입 정리" },
        { type: "Planning", count: 10, description: "아키텍처 설계, 명세서 작성" },
        { type: "Content Creation", count: 8, description: "문서 작성" },
        { type: "Debugging", count: 2, description: "버그 수정" }
    ],
    monthlyTrend: [
        {
            date: "2026-02",
            reportCount: 2,
            sessions: 127, // 102 + 25
            toolCalls: 1268
        },
        {
            date: "2026-01",
            reportCount: 1,
            sessions: 68,
            toolCalls: 890
        }
    ]
};

// API 응답 래퍼
export interface ApiResponse<T> {
    status: number;
    data: T;
}

// 제네릭 응답 래퍼 헬퍼
export const wrapResponse = <T>(data: T): string => {
    return JSON.stringify(data);
};
