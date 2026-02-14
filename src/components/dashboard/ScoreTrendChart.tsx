import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { formatDateShort } from "@/lib/utils";
import type { WeeklyTrendPoint } from "@/types";

interface ScoreTrendChartProps {
    weeklyTrend: WeeklyTrendPoint[];
}

const chartConfig = {
    score: {
        label: "활용도 점수",
        color: "var(--chart-1)"
    }
} satisfies ChartConfig;

export function ScoreTrendChart({ weeklyTrend }: ScoreTrendChartProps) {
    const chartData = useMemo(() => {
        return weeklyTrend
            .filter((d) => d.score !== undefined)
            .map((d) => ({
                date: formatDateShort(d.date),
                score: d.score!,
                fullDate: d.date
            }));
    }, [weeklyTrend]);

    if (chartData.length === 0) return null;

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" />
                    활용도 점수 추이
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 items-center">
                <ChartContainer config={chartConfig} className="h-[180px] w-full">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            domain={[0, 100]}
                            ticks={[0, 20, 40, 60, 80, 100]}
                            tickLine={false}
                            axisLine={false}
                            width={35}
                            tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip
                            content={({ active, payload }) => {
                                if (!active || !payload || payload.length === 0) return null;
                                const data = payload[0].payload;
                                return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <p className="text-sm font-medium">{data.fullDate}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {data.score}점
                                        </p>
                                    </div>
                                );
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="var(--color-score)"
                            fill="var(--color-score)"
                            fillOpacity={0.3}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
