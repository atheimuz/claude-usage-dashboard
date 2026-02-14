import { AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ErrorSummary } from "@/types";

interface Props {
    errorSummary: ErrorSummary;
}

export function ErrorSummarySection({ errorSummary }: Props) {
    const { rate, total, main_types, recovery } = errorSummary;

    if (total === 0) return null;

    const getRateColor = (rate: number) => {
        if (rate < 5) return "text-emerald-600 dark:text-emerald-400";
        if (rate < 10) return "text-amber-600 dark:text-amber-400";
        return "text-red-600 dark:text-red-400";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5" />
                    에러 요약
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">에러율</p>
                        <p className={`text-2xl font-bold ${getRateColor(rate)}`}>
                            {rate.toFixed(1)}%
                        </p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">총 에러 수</p>
                        <p className="text-2xl font-bold">{total}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">즉시 수정</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {recovery.immediate_fix}
                        </p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">대안 사용</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {recovery.alternative}
                        </p>
                    </div>
                </div>

                {main_types.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            주요 에러 유형
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {main_types.map((type) => (
                                <Badge key={type} variant="outline">
                                    {type}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <p className="mb-2 flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        <RefreshCw className="h-4 w-4" />
                        복구 통계
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                    width: `${(recovery.immediate_fix / (recovery.immediate_fix + recovery.alternative || 1)) * 100}%`
                                }}
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            즉시 수정 {Math.round((recovery.immediate_fix / (recovery.immediate_fix + recovery.alternative || 1)) * 100)}%
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
