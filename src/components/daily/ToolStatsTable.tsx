import { Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import type { ToolStat, ToolUsageItem } from "@/types";

interface Props {
    toolStats: ToolStat[] | ToolUsageItem[];
}

function normalizeToolStats(stats: ToolStat[] | ToolUsageItem[]): { name: string; count: number }[] {
    return stats.map((item) => {
        if ('toolName' in item) {
            return { name: item.toolName, count: item.usageCount };
        }
        return { name: item.name || "Unknown", count: item.count };
    });
}

export function ToolStatsTable({ toolStats }: Props) {
    if (toolStats.length === 0) return null;

    const normalized = normalizeToolStats(toolStats);
    const maxCount = Math.max(...normalized.map((t) => t.count));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Wrench className="h-5 w-5" />
                    도구 활용 통계
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>도구</TableHead>
                            <TableHead>사용 횟수</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {normalized.map((ts) => (
                            <TableRow key={ts.name}>
                                <TableCell className="font-medium">{ts.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="min-w-[4rem] text-sm">
                                            {formatNumber(ts.count)}회
                                        </span>
                                        <div className="h-2 flex-1 rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary"
                                                style={{
                                                    width: `${(ts.count / maxCount) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
