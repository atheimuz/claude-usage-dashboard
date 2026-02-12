export interface FileEntry {
    name: string;
    location: string;
}

export interface DailyReport {
    date: string;
    identifier: string;
    filename: string;
    overview: OverviewStats;
    projectSessions: ProjectSession[];
    techStack: TechStack;
    claudeUsage: ClaudeUsage;
    promptPatterns: PromptPatterns;
    toolStats: ToolStat[];
    taskTypes: TaskType[];
    sessionDetails: SessionDetail[];
    learningInsights: string[];
    workflowPatterns: WorkflowPattern[];
    usageEvaluation?: UsageEvaluation;
    projectDistribution?: ProjectDistribution[];
}

export interface OverviewStats {
    totalSessions: number;
    totalToolCalls: number;
    projectCount: number;
    totalUserMessages?: number;
    avgMessagesPerSession?: number;
    avgToolCallsPerSession?: number;
}

export interface ProjectSession {
    projectName: string;
    sessionCount: number;
}

export interface TechStackItem {
    name: string;
    mentionCount?: number;
}

export interface TechStack {
    languages: TechStackItem[];
    frameworks: TechStackItem[];
    tools: TechStackItem[];
}

export interface ClaudeUsage {
    modes: UsageMode[];
    features: UsageFeature[];
    delegationStyle: string[];
    subAgentUsages?: SubAgentUsage[];
    slashCommands?: SlashCommandUsage[];
}

export interface UsageMode {
    name: string;
    description: string;
    percentage?: number;
}

export interface UsageFeature {
    name: string;
    description: string;
    percentage?: number;
    count?: number;
}

export interface SubAgentUsage {
    agentType: string;
    count: number;
    description?: string;
}

export interface SlashCommandUsage {
    command: string;
    count: number;
    description?: string;
}

export interface PromptPatterns {
    effective: string[];
    conversationFlow: ConversationFlow[];
}

export interface ConversationFlow {
    type: string;
    description: string;
}

export interface ToolStat {
    toolName: string;
    usageCount: number;
    primaryUse: string;
}

export interface TaskType {
    type: string;
    count: number;
    description: string;
    percentage?: number;
}

export interface SessionDetail {
    groupName: string;
    taskTypes: string[];
    approach: string;
    mainTasks: string;
    changeScale: string;
}

export interface WorkflowPattern {
    name: string;
    flow: string;
}

export type EvaluationGrade = 'S' | 'A' | 'B' | 'C' | 'D';
export type TaskComplexity = '경량' | '중량' | '중량급';

export interface UsageEvaluation {
    overallScore: number;
    maxScore: number;
    grade?: EvaluationGrade;
    taskComplexity?: TaskComplexity;
    categories: EvaluationCategory[];
    strengths: string[];
    improvements: string[];
}

export interface EvaluationCategory {
    name: string;
    score: number;
    maxScore: number;
    description?: string;
}

export interface ProjectDistribution {
    projectType: string;
    sessionCount: string;
}

export interface AggregatedStats {
    totalDays: number;
    totalSessions: number;
    totalToolCalls: number;
    totalProjects: number;
    toolUsageAggregated: ToolStat[];
    taskTypeAggregated: TaskType[];
    techStackFrequency: Record<string, number>;
    dailyTrend: DailyTrendPoint[];
    averageEvaluationScore?: number;
    latestEvaluation?: UsageEvaluation;
    evaluationCategoryAverages?: EvaluationCategory[];
}

export interface DailyTrendPoint {
    date: string;
    reportCount: number;
    sessions: number;
    toolCalls: number;
}
