import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScoringRadarChart } from "@/components/shared/ScoringRadarChart";
import type { EvaluationGrade, ScoringCategories } from "@/types";

const gradeConfig: Record<EvaluationGrade, { label: string; className: string }> = {
    S: { label: "S", className: "bg-violet-500 text-white border-violet-500" },
    A: { label: "A", className: "bg-success text-white border-success" },
    B: { label: "B", className: "bg-blue-500 text-white border-blue-500" },
    C: { label: "C", className: "bg-warning text-warning-foreground border-warning" },
    D: { label: "D", className: "bg-orange-500 text-white border-orange-500" },
    F: { label: "F", className: "bg-destructive text-white border-destructive" }
};

const SCORE_THRESHOLDS = { high: 80, mid: 60 } as const;

const SCORE_COLORS = {
    high: { text: "text-success", stroke: "stroke-success" },
    mid: { text: "text-orange-500", stroke: "stroke-orange-500" },
    low: { text: "text-destructive", stroke: "stroke-destructive" }
} as const;

function getScoreLevel(pct: number) {
    if (pct >= SCORE_THRESHOLDS.high) return "high";
    if (pct >= SCORE_THRESHOLDS.mid) return "mid";
    return "low";
}

const getScoreColor = (pct: number) => SCORE_COLORS[getScoreLevel(pct)].text;
const getStrokeClass = (pct: number) => SCORE_COLORS[getScoreLevel(pct)].stroke;

interface UsageScoreCardProps {
    score: number;
    maxScore?: number;
    categories?: ScoringCategories;
    categoryAverages?: { intent: number; efficiency: number; fitness: number; workflow: number };
    grade?: EvaluationGrade;
    title?: string;
    label?: string;
    categoryLabel?: string;
    size?: "sm" | "lg";
    featured?: boolean;
}

export function UsageScoreCard({
    score,
    maxScore = 100,
    categories,
    categoryAverages,
    grade,
    title,
    label,
    categoryLabel,
    size = "lg",
    featured = false
}: UsageScoreCardProps) {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const isLg = size === "lg";
    const gaugeSize = isLg ? "h-32 w-32" : "h-28 w-28";
    const scoreTextSize = isLg ? "text-3xl" : "text-2xl";

    const hasCategories = categories || categoryAverages;

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
                <div className={cn("flex items-center gap-6")}>
                    {/* Score gauge */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={cn("relative", gaugeSize)}>
                            <svg className={cn(gaugeSize, "-rotate-90")} viewBox="0 0 120 120" role="img" aria-label={`${title ?? "활용도 점수"}: ${score}/${maxScore}`}>
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
                                    className={cn(
                                        getStrokeClass(percentage),
                                        "transition-all duration-500"
                                    )}
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
                        {grade && (
                            <Badge
                                className={cn("text-sm font-bold", gradeConfig[grade].className)}
                            >
                                {gradeConfig[grade].label}
                            </Badge>
                        )}
                    </div>

                    {/* Category Radar Chart */}
                    {hasCategories && (
                        <div className="flex-1">
                            {categoryLabel && (
                                <p className="mb-2 text-sm font-semibold">{categoryLabel}</p>
                            )}
                            <ScoringRadarChart
                                categories={categories}
                                categoryAverages={categoryAverages}
                                height={200}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
