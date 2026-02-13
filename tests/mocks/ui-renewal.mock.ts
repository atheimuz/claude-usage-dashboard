/**
 * 목업 데이터: UI Renewal
 *
 * UI Renewal 기획의 7가지 변경사항 테스트를 위한 목업 데이터
 * - scoring 필드가 있는 리포트 (활용도 평가, Radar Chart 테스트용)
 * - commands에 description 필드가 있는 리포트
 * - 같은 날짜에 여러 리포트 (평균 계산 테스트)
 */

import type { DailyReport, Scoring, Feedback, ScoringCategories } from "@/types";

// 활용도 평가 카테고리 (scoring.categories)
export const MOCK_SCORING_CATEGORIES_HIGH: ScoringCategories = {
    intent: { score: 23, max: 25 },
    efficiency: { score: 27, max: 30 },
    fitness: { score: 22, max: 25 },
    workflow: { score: 18, max: 20 }
};

export const MOCK_SCORING_CATEGORIES_MID: ScoringCategories = {
    intent: { score: 18, max: 25 },
    efficiency: { score: 21, max: 30 },
    fitness: { score: 17, max: 25 },
    workflow: { score: 14, max: 20 }
};

export const MOCK_SCORING_CATEGORIES_LOW: ScoringCategories = {
    intent: { score: 13, max: 25 },
    efficiency: { score: 15, max: 30 },
    fitness: { score: 12, max: 25 },
    workflow: { score: 10, max: 20 }
};

// 활용도 평가 (scoring)
export const MOCK_SCORING_HIGH: Scoring = {
    total: 90,
    grade: 'A',
    categories: MOCK_SCORING_CATEGORIES_HIGH
};

export const MOCK_SCORING_MID: Scoring = {
    total: 70,
    grade: 'B',
    categories: MOCK_SCORING_CATEGORIES_MID
};

export const MOCK_SCORING_LOW: Scoring = {
    total: 50,
    grade: 'C',
    categories: MOCK_SCORING_CATEGORIES_LOW
};

export const MOCK_SCORING_SIDE: Scoring = {
    total: 85,
    grade: 'A',
    categories: {
        intent: { score: 22, max: 25 },
        efficiency: { score: 26, max: 30 },
        fitness: { score: 21, max: 25 },
        workflow: { score: 17, max: 20 }
    }
};

// 피드백 (feedback)
export const MOCK_FEEDBACK_DETAILED: Feedback = {
    strengths: [
        "명확한 요구사항 전달로 정확한 결과물 생성",
        "효율적인 도구 활용으로 작업 시간 단축",
        "적절한 워크플로우 패턴 선택"
    ],
    improvements: [
        "초기 컨텍스트 제공을 더 상세히 할 수 있음",
        "에러 발생 시 즉각적인 피드백 제공 필요"
    ],
    context_tips: [
        "파일 구조를 먼저 공유하면 더 정확한 제안 가능",
        "관련 문서 링크를 함께 제공하면 이해도 향상"
    ]
};

export const MOCK_FEEDBACK_SIMPLE: Feedback = {
    strengths: [
        "효과적인 프롬프트 패턴 사용"
    ],
    improvements: [
        "더 구체적인 요구사항 전달 필요"
    ],
    context_tips: [
        "예시 코드를 함께 제공하면 도움됨"
    ]
};

// 커맨드 목업 (description 필드 포함)
export const MOCK_COMMANDS_WITH_DESCRIPTION = [
    { name: "/clear", count: 12, description: "대화 히스토리 초기화" },
    { name: "/planning", count: 8, description: "Plan Mode로 전환하여 아키텍처 설계" },
    { name: "/code", count: 6, description: "Code Mode로 전환하여 직접 구현" },
    { name: "/review", count: 4 }, // description 없음
    { name: "/commit", count: 3, description: "변경사항을 Git 커밋으로 저장" }
];

export const MOCK_COMMANDS_WITHOUT_DESCRIPTION = [
    { name: "/clear", count: 5 },
    { name: "/planning", count: 3 },
    { name: "/code", count: 2 }
];

// DailyReport 목업 (scoring 포함)
export const MOCK_DAILY_REPORT_WITH_SCORING: Partial<DailyReport> = {
    identifier: "work_2026-02-08",
    filename: "2026-02-08.json",
    date: "2026-02-08",
    date_range: {
        start: "2026-02-08",
        end: "2026-02-08"
    },
    summary: {
        sessions: 45,
        avg_messages: 12,
        avg_tool_calls: 25,
        main_tasks: ["Coding", "Refactoring", "Planning"]
    },
    usage_style: {
        prompt_stats: {
            avg_length: 180,
            avg_words: 35,
            distribution: {
                command: 30,
                descriptive: 50,
                plan_based: 20
            }
        },
        session_scale: {
            small: { count: 15, avg_turns: 5 },
            medium: { count: 20, avg_turns: 12 },
            large: { count: 10, avg_turns: 25 }
        },
        correction_ratio: {
            initial: 35,
            followup: 10,
            ratio: 0.29
        }
    },
    tool_usage: {
        skills: [],
        agents: [],
        commands: MOCK_COMMANDS_WITH_DESCRIPTION,
        top_tools: [
            { name: "Read", count: 120, description: "파일 읽기" },
            { name: "Edit", count: 95, description: "파일 수정" },
            { name: "Write", count: 78, description: "새 파일 생성" },
            { name: "Bash", count: 45, description: "쉘 명령 실행" },
            { name: "Grep", count: 32, description: "코드 검색" }
        ]
    },
    scoring: MOCK_SCORING_HIGH,
    feedback: MOCK_FEEDBACK_DETAILED,
    error_summary: {
        rate: 0.15,
        total: 8,
        main_types: ["타입 에러", "경로 오류"],
        recovery: {
            immediate_fix: 6,
            alternative: 2
        }
    },
    main_workflow: "탐색 → 설계 → 구현 → 검증"
};

export const MOCK_DAILY_REPORT_SIDE: Partial<DailyReport> = {
    identifier: "side_2026-02-08",
    filename: "2026-02-08.json",
    date: "2026-02-08",
    date_range: {
        start: "2026-02-08",
        end: "2026-02-08"
    },
    summary: {
        sessions: 20,
        avg_messages: 10,
        avg_tool_calls: 18,
        main_tasks: ["Coding", "Design"]
    },
    usage_style: {
        prompt_stats: {
            avg_length: 150,
            avg_words: 28,
            distribution: {
                command: 40,
                descriptive: 45,
                plan_based: 15
            }
        },
        session_scale: {
            small: { count: 8, avg_turns: 4 },
            medium: { count: 10, avg_turns: 10 },
            large: { count: 2, avg_turns: 20 }
        },
        correction_ratio: {
            initial: 15,
            followup: 5,
            ratio: 0.33
        }
    },
    tool_usage: {
        skills: [],
        agents: [],
        commands: MOCK_COMMANDS_WITHOUT_DESCRIPTION,
        top_tools: [
            { name: "Read", count: 80 },
            { name: "Edit", count: 60 },
            { name: "Write", count: 45 }
        ]
    },
    scoring: MOCK_SCORING_SIDE,
    feedback: MOCK_FEEDBACK_SIMPLE,
    error_summary: {
        rate: 0.10,
        total: 3,
        main_types: ["스타일 경고"],
        recovery: {
            immediate_fix: 3,
            alternative: 0
        }
    },
    main_workflow: "설계 → 구현 → 확인"
};

export const MOCK_DAILY_REPORT_MID_SCORE: Partial<DailyReport> = {
    identifier: "work_2026-02-09",
    filename: "2026-02-09.json",
    date: "2026-02-09",
    date_range: {
        start: "2026-02-09",
        end: "2026-02-09"
    },
    summary: {
        sessions: 32,
        avg_messages: 11,
        avg_tool_calls: 22,
        main_tasks: ["Coding", "Debugging"]
    },
    usage_style: {
        prompt_stats: {
            avg_length: 160,
            avg_words: 30,
            distribution: {
                command: 35,
                descriptive: 45,
                plan_based: 20
            }
        },
        session_scale: {
            small: { count: 12, avg_turns: 5 },
            medium: { count: 15, avg_turns: 11 },
            large: { count: 5, avg_turns: 22 }
        },
        correction_ratio: {
            initial: 25,
            followup: 8,
            ratio: 0.32
        }
    },
    tool_usage: {
        skills: [],
        agents: [],
        commands: MOCK_COMMANDS_WITHOUT_DESCRIPTION,
        top_tools: [
            { name: "Read", count: 95 },
            { name: "Edit", count: 72 },
            { name: "Bash", count: 38 }
        ]
    },
    scoring: MOCK_SCORING_MID,
    feedback: MOCK_FEEDBACK_SIMPLE,
    error_summary: {
        rate: 0.12,
        total: 5,
        main_types: ["타입 에러"],
        recovery: {
            immediate_fix: 4,
            alternative: 1
        }
    },
    main_workflow: "분석 → 수정 → 테스트"
};

export const MOCK_DAILY_REPORT_LOW_SCORE: Partial<DailyReport> = {
    identifier: "work_2026-02-10",
    filename: "2026-02-10.json",
    date: "2026-02-10",
    date_range: {
        start: "2026-02-10",
        end: "2026-02-10"
    },
    summary: {
        sessions: 18,
        avg_messages: 8,
        avg_tool_calls: 15,
        main_tasks: ["Planning", "Documentation"]
    },
    usage_style: {
        prompt_stats: {
            avg_length: 120,
            avg_words: 22,
            distribution: {
                command: 25,
                descriptive: 60,
                plan_based: 15
            }
        },
        session_scale: {
            small: { count: 10, avg_turns: 4 },
            medium: { count: 6, avg_turns: 9 },
            large: { count: 2, avg_turns: 18 }
        },
        correction_ratio: {
            initial: 12,
            followup: 6,
            ratio: 0.50
        }
    },
    tool_usage: {
        skills: [],
        agents: [],
        commands: MOCK_COMMANDS_WITHOUT_DESCRIPTION,
        top_tools: [
            { name: "Read", count: 50 },
            { name: "Write", count: 35 }
        ]
    },
    scoring: MOCK_SCORING_LOW,
    feedback: MOCK_FEEDBACK_SIMPLE,
    error_summary: {
        rate: 0.08,
        total: 2,
        main_types: ["문서 형식"],
        recovery: {
            immediate_fix: 2,
            alternative: 0
        }
    },
    main_workflow: "계획 → 문서화"
};

// scoring이 없는 구버전 리포트
export const MOCK_DAILY_REPORT_NO_SCORING: Partial<DailyReport> = {
    identifier: "work_2026-02-11",
    filename: "2026-02-11.json",
    date: "2026-02-11",
    date_range: {
        start: "2026-02-11",
        end: "2026-02-11"
    },
    summary: {
        sessions: 15,
        avg_messages: 9,
        avg_tool_calls: 16,
        main_tasks: ["Coding"]
    },
    usage_style: {
        prompt_stats: {
            avg_length: 140,
            avg_words: 26,
            distribution: {
                command: 30,
                descriptive: 50,
                plan_based: 20
            }
        },
        session_scale: {
            small: { count: 8, avg_turns: 5 },
            medium: { count: 5, avg_turns: 10 },
            large: { count: 2, avg_turns: 20 }
        },
        correction_ratio: {
            initial: 10,
            followup: 5,
            ratio: 0.50
        }
    },
    tool_usage: {
        skills: [],
        agents: [],
        commands: MOCK_COMMANDS_WITHOUT_DESCRIPTION,
        top_tools: [
            { name: "Read", count: 45 },
            { name: "Edit", count: 32 }
        ]
    },
    // scoring, feedback 없음 (구버전)
    error_summary: {
        rate: 0.05,
        total: 1,
        main_types: [],
        recovery: {
            immediate_fix: 1,
            alternative: 0
        }
    },
    main_workflow: "구현"
};

// index.json (파일 목록)
export const MOCK_INDEX_JSON_WITH_SCORING = {
    files: [
        { name: "2026-02-08.json", location: "work" },
        { name: "2026-02-08.json", location: "side" },
        { name: "2026-02-09.json", location: "work" },
        { name: "2026-02-10.json", location: "work" },
        { name: "2026-02-11.json", location: "work" }
    ]
};

// 집계 통계 (categoryAverages 포함)
export const MOCK_AGGREGATED_STATS_WITH_SCORING = {
    totalDays: 4,
    totalSessions: 130, // 45 + 20 + 32 + 18 + 15
    totalToolCalls: 2860,
    averageEvaluationScore: 74, // (90 + 85 + 70 + 50) / 4 = 73.75 ≈ 74
    scoringCategoryAverages: {
        intent: 19, // ((23 + 22 + 18 + 13) / 4) = 19
        efficiency: 22.25, // ((27 + 26 + 21 + 15) / 4) = 22.25
        fitness: 18, // ((22 + 21 + 17 + 12) / 4) = 18
        workflow: 14.75 // ((18 + 17 + 14 + 10) / 4) = 14.75
    },
    latestScoring: MOCK_SCORING_LOW,
    toolUsageAggregated: [
        { toolName: "Read", usageCount: 390 },
        { toolName: "Edit", usageCount: 294 },
        { toolName: "Write", usageCount: 158 },
        { toolName: "Bash", usageCount: 83 },
        { toolName: "Grep", usageCount: 32 }
    ],
    mainTasks: ["Coding", "Refactoring", "Planning", "Debugging", "Documentation", "Design"],
    dailyTrend: [
        {
            date: "2026-02-08",
            reportCount: 2,
            sessions: 65, // 45 + 20
            toolCalls: 1075,
            score: 88 // (90 + 85) / 2 = 87.5 ≈ 88
        },
        {
            date: "2026-02-09",
            reportCount: 1,
            sessions: 32,
            toolCalls: 704,
            score: 70
        },
        {
            date: "2026-02-10",
            reportCount: 1,
            sessions: 18,
            toolCalls: 540,
            score: 50
        },
        {
            date: "2026-02-11",
            reportCount: 1,
            sessions: 15,
            toolCalls: 541,
            score: undefined // scoring 없음
        }
    ]
};

// 빈 상태 (scoring이 있는 리포트 0개)
export const MOCK_INDEX_JSON_NO_SCORING = {
    files: [
        { name: "2026-02-11.json", location: "work" }
    ]
};

export const MOCK_AGGREGATED_STATS_NO_SCORING = {
    totalDays: 1,
    totalSessions: 15,
    totalToolCalls: 541,
    averageEvaluationScore: undefined,
    scoringCategoryAverages: undefined,
    latestScoring: undefined,
    toolUsageAggregated: [
        { toolName: "Read", usageCount: 45 },
        { toolName: "Edit", usageCount: 32 }
    ],
    mainTasks: ["Coding"],
    dailyTrend: [
        {
            date: "2026-02-11",
            reportCount: 1,
            sessions: 15,
            toolCalls: 541,
            score: undefined
        }
    ]
};

// JSON 파일 내용 맵
export const MOCK_JSON_FILES: Record<string, Partial<DailyReport>> = {
    "work/2026-02-08": MOCK_DAILY_REPORT_WITH_SCORING,
    "side/2026-02-08": MOCK_DAILY_REPORT_SIDE,
    "work/2026-02-09": MOCK_DAILY_REPORT_MID_SCORE,
    "work/2026-02-10": MOCK_DAILY_REPORT_LOW_SCORE,
    "work/2026-02-11": MOCK_DAILY_REPORT_NO_SCORING
};

// API 응답 래퍼
export const wrapResponse = <T>(data: T): string => {
    return JSON.stringify(data);
};
