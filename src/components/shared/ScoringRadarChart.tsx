import { useMemo } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { ChartTooltip } from "@/components/ui/chart";
import type { ScoringCategories } from "@/types";

const CATEGORY_MAX = {
    intent: 25,
    efficiency: 30,
    fitness: 25,
    workflow: 20
} as const;

const CATEGORY_LABELS = {
    intent: "의도 전달",
    efficiency: "효율성",
    fitness: "적합성",
    workflow: "워크플로우"
} as const;

interface ScoringRadarChartProps {
    categories?: ScoringCategories;
    categoryAverages?: {
        intent: number;
        efficiency: number;
        fitness: number;
        workflow: number;
    };
    height?: number;
}

export function ScoringRadarChart({
    categories,
    categoryAverages,
    height = 200
}: ScoringRadarChartProps) {
    const chartData = useMemo(() => {
        if (categories) {
            return Object.entries(categories).map(([key, cat]) => ({
                label: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS],
                value: cat.max > 0 ? (cat.score / cat.max) * 100 : 0,
                score: cat.score,
                max: cat.max
            }));
        }
        if (categoryAverages) {
            return Object.entries(categoryAverages).map(([key, avg]) => {
                const max = CATEGORY_MAX[key as keyof typeof CATEGORY_MAX];
                return {
                    label: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS],
                    value: max > 0 ? (avg / max) * 100 : 0,
                    score: avg,
                    max
                };
            });
        }
        return [];
    }, [categories, categoryAverages]);

    if (chartData.length === 0) return null;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={chartData}>
                <PolarGrid gridType="polygon" stroke="var(--muted)" />
                <PolarAngleAxis
                    dataKey="label"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Radar
                    name="점수"
                    dataKey="value"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                />
                <ChartTooltip
                    content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0) return null;
                        const data = payload[0].payload;
                        return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className="text-sm font-medium">{data.label}</p>
                                <p className="text-xs text-muted-foreground">
                                    {data.score}/{data.max}
                                </p>
                            </div>
                        );
                    }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}
