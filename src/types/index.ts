export interface FileEntry {
    name: string;
    location: string;
}

// 새 JSON 형식에 맞는 타입 정의
export interface DateRange {
    start: string;
    end: string;
}

export interface Summary {
    sessions: number;
    avg_messages: number;
    avg_tool_calls: number;
    main_tasks: string[];
}

export interface PromptDistribution {
    command: number;
    descriptive: number;
    plan_based: number;
}

export interface PromptStats {
    avg_length: number;
    avg_words: number;
    distribution: PromptDistribution;
}

export interface SessionScaleItem {
    count: number;
    avg_turns: number;
}

export interface SessionScale {
    [size: string]: SessionScaleItem;
}

export interface CorrectionRatio {
    initial: number;
    followup: number;
    ratio: number;
}

export interface UsageStyle {
    prompt_stats: PromptStats;
    session_scale: SessionScale;
    correction_ratio: CorrectionRatio;
}

export interface ToolUsageItem {
    name?: string;
    type?: string;
    count: number;
    description?: string;
}

export interface ToolUsage {
    skills: ToolUsageItem[];
    agents: ToolUsageItem[];
    commands: ToolUsageItem[];
    top_tools: ToolUsageItem[];
}

export interface ScoringCategory {
    score: number;
    max: number;
}

export interface ScoringCategories {
    intent: ScoringCategory;
    efficiency: ScoringCategory;
    fitness: ScoringCategory;
    workflow: ScoringCategory;
}

export interface Scoring {
    total: number;
    grade: EvaluationGrade;
    categories: ScoringCategories;
}

export interface Feedback {
    strengths: string[];
    improvements: string[];
    context_tips: string[];
}

export interface RecoveryStats {
    immediate_fix: number;
    alternative: number;
}

export interface ErrorSummary {
    rate: number;
    total: number;
    main_types: string[];
    recovery: RecoveryStats;
}

export interface WeeklyReport {
    // 메타 (런타임에 추가)
    identifier: string;
    filename: string;
    date: string; // 파일명에서 추출한 주간 키 (예: "2026-02-W2")

    // JSON 원본 필드
    date_range: DateRange;
    summary: Summary;
    usage_style: UsageStyle;
    tool_usage: ToolUsage;
    scoring: Scoring;
    feedback: Feedback;
    error_summary: ErrorSummary;
    main_workflow: string;
}

export type EvaluationGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

// Aggregator용 타입
export interface ToolStat {
    toolName: string;
    usageCount: number;
}

export interface FrequentToolItem {
    name: string;
    category: 'agent' | 'command' | 'skill';
    totalCount: number;
    description?: string;
}

export interface AggregatedStats {
    totalDays: number;
    totalSessions: number;
    totalToolCalls: number;
    toolUsageAggregated: ToolStat[];
    mainTasks: string[];
    weeklyTrend: WeeklyTrendPoint[];
    averageEvaluationScore?: number;
    latestScoring?: Scoring;
    scoringCategoryAverages?: {
        intent: number;
        efficiency: number;
        fitness: number;
        workflow: number;
    };
    frequentTools: FrequentToolItem[];
}

export interface WeeklyTrendPoint {
    date: string;
    reportCount: number;
    sessions: number;
    toolCalls: number;
    score?: number; // 해당 날짜의 평균 활용도 점수
}
