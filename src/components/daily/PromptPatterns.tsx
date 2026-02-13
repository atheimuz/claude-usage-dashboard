import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PromptStats } from "@/types";

interface Props {
    promptStats: PromptStats;
}

export function PromptPatterns({ promptStats }: Props) {
    const { avg_length, avg_words, distribution } = promptStats;
    const total = distribution.command + distribution.descriptive + distribution.plan_based;

    if (total === 0) return null;

    const getPercentage = (value: number) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5" />
                    프롬프트 통계
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">평균 길이</p>
                        <p className="text-2xl font-bold">{Math.round(avg_length)}</p>
                        <p className="text-xs text-muted-foreground">자</p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">평균 단어 수</p>
                        <p className="text-2xl font-bold">{Math.round(avg_words)}</p>
                        <p className="text-xs text-muted-foreground">단어</p>
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                        프롬프트 유형 분포
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>명령형 (Command)</span>
                            <span className="font-medium">{distribution.command}회 ({getPercentage(distribution.command)}%)</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${getPercentage(distribution.command)}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span>서술형 (Descriptive)</span>
                            <span className="font-medium">{distribution.descriptive}회 ({getPercentage(distribution.descriptive)}%)</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${getPercentage(distribution.descriptive)}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span>계획 기반 (Plan-based)</span>
                            <span className="font-medium">{distribution.plan_based}회 ({getPercentage(distribution.plan_based)}%)</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-purple-500"
                                style={{ width: `${getPercentage(distribution.plan_based)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
