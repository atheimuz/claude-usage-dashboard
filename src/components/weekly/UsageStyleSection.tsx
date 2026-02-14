import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UsageStyle, SessionScaleItem } from "@/types";

interface Props {
    usageStyle: UsageStyle;
}

export function UsageStyleSection({ usageStyle }: Props) {
    const { session_scale, correction_ratio } = usageStyle;

    const sessionScaleEntries = Object.entries(session_scale).filter(
        (entry): entry is [string, SessionScaleItem] => entry[1] !== undefined
    );
    const hasSessionScale = sessionScaleEntries.length > 0;
    const hasCorrectionData = correction_ratio.initial > 0 || correction_ratio.followup > 0;

    if (!hasSessionScale && !hasCorrectionData) return null;

    const correctionPercent = correction_ratio.ratio * 100;
    const getCorrectionColor = (ratio: number) => {
        if (ratio < 0.3) return "text-emerald-600 dark:text-emerald-400";
        if (ratio < 0.5) return "text-amber-600 dark:text-amber-400";
        return "text-red-600 dark:text-red-400";
    };

    const scaleLabels: Record<string, string> = {
        small: "소형",
        medium: "중형",
        large: "대형",
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    사용 스타일
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {hasSessionScale && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            세션 규모 분포
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {sessionScaleEntries.map(([size, data]) => (
                                <div key={size} className="rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground">
                                        {scaleLabels[size] || size}
                                    </p>
                                    <p className="text-2xl font-bold">{data.count}</p>
                                    <p className="text-xs text-muted-foreground">
                                        평균 {data.avg_turns.toFixed(1)} 턴
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {hasCorrectionData && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            수정 비율
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">초기 요청</p>
                                <p className="text-2xl font-bold">{correction_ratio.initial}</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">후속 수정</p>
                                <p className="text-2xl font-bold">{correction_ratio.followup}</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">수정 비율</p>
                                <p className={`text-2xl font-bold ${getCorrectionColor(correction_ratio.ratio)}`}>
                                    {correctionPercent.toFixed(0)}%
                                </p>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            낮은 수정 비율은 초기 프롬프트가 명확했음을 의미합니다
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
