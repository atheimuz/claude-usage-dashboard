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
import type { ToolStat } from "@/types";

interface Props {
    toolStats: ToolStat[];
}

export function ToolStatsTable({ toolStats }: Props) {
    if (toolStats.length === 0) return null;
    const maxCount = Math.max(...toolStats.map((t) => t.usageCount));

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
                            <TableHead className="hidden md:table-cell">주요 용도</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {toolStats.map((ts) => (
                            <TableRow key={ts.toolName}>
                                <TableCell className="font-medium">{ts.toolName}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="min-w-[4rem] text-sm">
                                            {formatNumber(ts.usageCount)}회
                                        </span>
                                        <div className="h-2 flex-1 rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary"
                                                style={{
                                                    width: `${(ts.usageCount / maxCount) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                                    {ts.primaryUse}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
