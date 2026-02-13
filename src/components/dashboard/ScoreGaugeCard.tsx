import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EvaluationGrade } from "@/types";

const gradeConfig: Record<EvaluationGrade, { label: string; className: string }> = {
    S: { label: "S", className: "bg-violet-500 text-white border-violet-500" },
    A: { label: "A", className: "bg-success text-white border-success" },
    B: { label: "B", className: "bg-blue-500 text-white border-blue-500" },
    C: { label: "C", className: "bg-warning text-warning-foreground border-warning" },
    D: { label: "D", className: "bg-orange-500 text-white border-orange-500" },
    F: { label: "F", className: "bg-destructive text-white border-destructive" }
};

const SCORE_THRESHOLDS = { high: 80, mid: 60 } as const;

function getScoreLevel(pct: number) {
    if (pct >= SCORE_THRESHOLDS.high) return "high";
    if (pct >= SCORE_THRESHOLDS.mid) return "mid";
    return "low";
}

function getScoreColorClass(pct: number) {
    const level = getScoreLevel(pct);
    return {
        high: { text: "text-success", stroke: "stroke-success" },
        mid: { text: "text-orange-500", stroke: "stroke-orange-500" },
        low: { text: "text-destructive", stroke: "stroke-destructive" },
    }[level];
}

interface ScoreGaugeCardProps {
    score: number;
    maxScore?: number;
    grade?: EvaluationGrade;
    label?: string;
}

export function ScoreGaugeCard({
    score,
    maxScore = 100,
    grade,
    label
}: ScoreGaugeCardProps) {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const colorClass = getScoreColorClass(percentage);

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" />
                    {label ?? "활용도 점수"}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center">
                <div className="relative h-32 w-32">
                    <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
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
                            className={cn(colorClass.stroke, "transition-all duration-500")}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={cn("text-3xl font-bold", colorClass.text)}>
                            {score}
                        </span>
                        <span className="text-xs text-muted-foreground">/ {maxScore}</span>
                    </div>
                </div>
                {grade && (
                    <Badge className={cn("mt-3 text-sm font-bold", gradeConfig[grade].className)}>
                        {gradeConfig[grade].label}
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}
