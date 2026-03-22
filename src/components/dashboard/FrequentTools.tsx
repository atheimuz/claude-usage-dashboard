import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatNumber } from "@/lib/utils";
import type { FrequentToolItem } from "@/types";

interface Props {
    recentFrequentTools: FrequentToolItem[];
    allFrequentTools: FrequentToolItem[];
}

export function FrequentTools({ recentFrequentTools, allFrequentTools }: Props) {
    const [period, setPeriod] = useState<"recent" | "all">("recent");

    const tools = period === "recent" ? recentFrequentTools : allFrequentTools;

    if (recentFrequentTools.length === 0 && allFrequentTools.length === 0) return null;

    const maxCount = tools.length > 0 ? tools[0].totalCount : 1;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5" />
                        자주 쓰는 도구
                    </CardTitle>
                    <ToggleGroup
                        type="single"
                        value={period}
                        onValueChange={(value) => {
                            if (value) setPeriod(value as "recent" | "all");
                        }}
                        size="sm"
                    >
                        <ToggleGroupItem
                            value="recent"
                            aria-label="최근 1개월"
                            className="text-xs px-2.5 h-7"
                            data-testid="frequent-tools-tab-recent"
                        >
                            최근
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="all"
                            aria-label="전체 기간"
                            className="text-xs px-2.5 h-7"
                            data-testid="frequent-tools-tab-all"
                        >
                            전체
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {tools.map((item, index) => (
                        <div
                            key={`${item.category}-${item.name}`}
                            data-testid="frequent-tool-item"
                            className="flex items-center gap-3"
                        >
                            {/* 좌측: 순위 + Badge + 도구명/설명 */}
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="w-6 text-sm text-muted-foreground text-right">
                                    {index + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <span className="font-medium text-sm truncate flex items-center gap-1.5">
                                        <Badge
                                            variant="outline"
                                            className="justify-center text-[11px] px-1.5 py-0 shrink-0"
                                        >
                                            {item.category === "agent"
                                                ? "Agent"
                                                : item.category === "command"
                                                  ? "Command"
                                                  : "Skill"}
                                        </Badge>
                                        <span className="truncate">{item.name}</span>
                                    </span>
                                    {item.description && (
                                        <span className="text-xs text-muted-foreground truncate block">
                                            {item.description}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* 우측: 사용 횟수 + 프로그레스 바 */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="min-w-[4rem] text-sm text-right">
                                    {formatNumber(item.totalCount)}회
                                </span>
                                <div
                                    className="h-2 w-24 rounded-full bg-muted"
                                    role="progressbar"
                                    aria-valuenow={item.totalCount}
                                    aria-valuemin={0}
                                    aria-valuemax={maxCount}
                                    aria-label={`${item.name} 사용 비율`}
                                >
                                    <div
                                        className="h-full rounded-full bg-primary"
                                        style={{
                                            width: `${(item.totalCount / maxCount) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
