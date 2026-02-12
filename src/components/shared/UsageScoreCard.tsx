import { ThumbsUp, AlertTriangle, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EvaluationCategory, EvaluationGrade, TaskComplexity } from "@/types";

const gradeConfig: Record<EvaluationGrade, { label: string; className: string }> = {
    S: { label: "S", className: "bg-violet-500 text-white border-violet-500" },
    A: { label: "A", className: "bg-emerald-500 text-white border-emerald-500" },
    B: { label: "B", className: "bg-blue-500 text-white border-blue-500" },
    C: { label: "C", className: "bg-amber-500 text-white border-amber-500" },
    D: { label: "D", className: "bg-red-500 text-white border-red-500" }
};

const complexityConfig: Record<TaskComplexity, { label: string; className: string }> = {
    경량: {
        label: "경량",
        className:
            "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
    },
    중량: {
        label: "중량",
        className:
            "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700"
    },
    중량급: {
        label: "중량급",
        className:
            "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
    }
};

const SCORE_THRESHOLDS = { high: 80, mid: 60 } as const;

const SCORE_COLORS = {
    high: { text: "text-emerald-500", stroke: "stroke-emerald-500", bg: "bg-emerald-500" },
    mid: { text: "text-amber-500", stroke: "stroke-amber-500", bg: "bg-amber-500" },
    low: { text: "text-red-500", stroke: "stroke-red-500", bg: "bg-red-500" },
} as const;

function getScoreLevel(pct: number) {
    if (pct >= SCORE_THRESHOLDS.high) return "high";
    if (pct >= SCORE_THRESHOLDS.mid) return "mid";
    return "low";
}

const getScoreColor = (pct: number) => SCORE_COLORS[getScoreLevel(pct)].text;
const getStrokeColor = (pct: number) => SCORE_COLORS[getScoreLevel(pct)].stroke;
const getBarColor = (pct: number) => SCORE_COLORS[getScoreLevel(pct)].bg;

interface UsageScoreCardProps {
    score: number;
    maxScore: number;
    categories: EvaluationCategory[];
    grade?: EvaluationGrade;
    taskComplexity?: TaskComplexity;
    title?: string;
    label?: string;
    categoryLabel?: string;
    strengths?: string[];
    improvements?: string[];
    size?: "sm" | "lg";
    featured?: boolean;
}

export function UsageScoreCard({
    score,
    maxScore,
    categories,
    grade,
    taskComplexity,
    title,
    label,
    categoryLabel,
    strengths = [],
    improvements = [],
    size = "lg",
    featured = false
}: UsageScoreCardProps) {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const isLg = size === "lg";
    const gaugeSize = isLg ? "h-32 w-32" : "h-28 w-28";
    const scoreTextSize = isLg ? "text-3xl" : "text-2xl";

    return (
        <Card className={cn(featured && "border-2 border-primary/20")}>
            {title && (
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent className={cn(!title && "p-6")}>
                <div className={cn("flex flex-col gap-10 md:flex-row md:items-center")}>
                    {/* Score gauge */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={cn("relative", gaugeSize)}>
                            <svg className={cn(gaugeSize, "-rotate-90")} viewBox="0 0 120 120">
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    fill="none"
                                    strokeWidth="8"
                                    className="stroke-muted"
                                />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    fill="none"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    className={getStrokeColor(percentage)}
                                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span
                                    className={`${scoreTextSize} font-bold ${getScoreColor(percentage)}`}
                                >
                                    {score}
                                </span>
                                <span className="text-xs text-muted-foreground">/ {maxScore}</span>
                            </div>
                        </div>
                        {label && (
                            <p className="text-sm font-medium text-muted-foreground">{label}</p>
                        )}
                        {(grade || taskComplexity) && (
                            <div className="flex items-center gap-2 mt-1">
                                {grade && (
                                    <Badge
                                        className={cn(
                                            "text-sm font-bold",
                                            gradeConfig[grade].className
                                        )}
                                    >
                                        {gradeConfig[grade].label}
                                    </Badge>
                                )}
                                {taskComplexity && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-xs",
                                            complexityConfig[taskComplexity].className
                                        )}
                                    >
                                        {complexityConfig[taskComplexity].label}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Category bars */}
                    {categories.length > 0 && (
                        <div className="flex-1 space-y-3">
                            {categoryLabel && (
                                <p className="text-sm font-semibold">{categoryLabel}</p>
                            )}
                            {categories.map((cat) => {
                                const catPct =
                                    cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;
                                return (
                                    <div key={cat.name} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>{cat.name}</span>
                                            <span className="font-medium">
                                                {cat.score}/{cat.maxScore}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full rounded-full ${getBarColor(catPct)}`}
                                                style={{
                                                    width: `${catPct}%`,
                                                    transition: "width 0.5s ease"
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Strengths & Improvements */}
                {(strengths.length > 0 || improvements.length > 0) && (
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {strengths.length > 0 && (
                            <div>
                                <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                    <ThumbsUp className="h-3.5 w-3.5" /> 잘한 점
                                </p>
                                <ul className="space-y-1">
                                    {strengths.map((s, i) => (
                                        <li key={i} className="text-sm text-muted-foreground">
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {improvements.length > 0 && (
                            <div>
                                <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                                    <AlertTriangle className="h-3.5 w-3.5" /> 개선 포인트
                                </p>
                                <ul className="space-y-1">
                                    {improvements.map((s, i) => (
                                        <li key={i} className="text-sm text-muted-foreground">
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
