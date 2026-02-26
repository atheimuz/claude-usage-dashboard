import { Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import type { ToolUsage, ToolUsageItem } from "@/types";

interface ToolUsageTableProps {
    title: string;
    nameHeader: string;
    items: ToolUsageItem[];
    getName: (item: ToolUsageItem) => string | undefined;
    mono?: boolean;
}

function ToolUsageTable({ title, nameHeader, items, getName, mono }: ToolUsageTableProps) {
    if (items.length === 0) return null;
    const hasDescription = items.some((item) => item.description);
    return (
        <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">{title}</p>
            <Table className="table-fixed">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-60">{nameHeader}</TableHead>
                        {hasDescription && <TableHead>설명</TableHead>}
                        <TableHead className="w-15 text-right">횟수</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={getName(item)}>
                            <TableCell className={mono ? "font-mono font-medium" : "font-medium"}>
                                {getName(item)}
                            </TableCell>
                            {hasDescription && (
                                <TableCell className="text-muted-foreground">
                                    {item.description}
                                </TableCell>
                            )}
                            <TableCell className="text-right">{item.count}회</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

interface Props {
    toolUsage: ToolUsage;
}

export function ClaudeUsageSection({ toolUsage }: Props) {
    const { agents, commands, skills } = toolUsage;
    const hasAny = agents.length > 0 || commands.length > 0 || skills.length > 0;
    if (!hasAny) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5" />
                    클로드 코드 활용 방식
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <ToolUsageTable
                    title="Sub Agent 위임"
                    nameHeader="Agent 유형"
                    items={agents}
                    getName={(item) => item.type}
                />
                <ToolUsageTable
                    title="슬래시 커맨드"
                    nameHeader="커맨드"
                    items={commands}
                    getName={(item) => item.name}
                    mono
                />
                <ToolUsageTable
                    title="사용한 스킬"
                    nameHeader="스킬"
                    items={skills}
                    getName={(item) => item.name}
                    mono
                />
            </CardContent>
        </Card>
    );
}
