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
import type { ClaudeUsage } from "@/types";

interface Props {
    claudeUsage: ClaudeUsage;
}

export function ClaudeUsageSection({ claudeUsage }: Props) {
    const { modes, features, delegationStyle, subAgentUsages, slashCommands } = claudeUsage;
    const hasAny =
        modes.length > 0 ||
        features.length > 0 ||
        delegationStyle.length > 0 ||
        (subAgentUsages && subAgentUsages.length > 0) ||
        (slashCommands && slashCommands.length > 0);
    if (!hasAny) return null;

    const hasAgentDesc = subAgentUsages?.some((a) => a.description) ?? false;
    const hasCmdDesc = slashCommands?.some((c) => c.description) ?? false;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5" />
                    클로드 코드 활용 방식
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {modes.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            사용한 모드
                        </p>
                        <ul className="space-y-1">
                            {modes.map((mode) => (
                                <li key={mode.name} className="text-sm">
                                    <span className="font-semibold">{mode.name}</span>
                                    {mode.percentage != null && (
                                        <span className="ml-2 text-muted-foreground">
                                            {mode.percentage}%
                                        </span>
                                    )}
                                    {mode.description && mode.description !== mode.name && (
                                        <span className="ml-1 text-muted-foreground">
                                            - {mode.description}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {features.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            활용한 기능
                        </p>
                        <ul className="space-y-1">
                            {features.map((feat) => (
                                <li key={feat.name} className="text-sm">
                                    <span className="font-semibold">{feat.name}</span>
                                    {feat.percentage != null && (
                                        <span className="ml-2 text-muted-foreground">
                                            {feat.percentage}%
                                        </span>
                                    )}
                                    {feat.count != null && (
                                        <span className="ml-2 text-muted-foreground">
                                            {feat.count}회
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {subAgentUsages && subAgentUsages.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            Sub Agent 위임
                        </p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Agent 유형</TableHead>
                                    <TableHead className="text-right">횟수</TableHead>
                                    {hasAgentDesc && <TableHead>설명</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subAgentUsages.map((agent) => (
                                    <TableRow key={agent.agentType}>
                                        <TableCell className="font-medium">
                                            {agent.agentType}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {agent.count}회
                                        </TableCell>
                                        {hasAgentDesc && (
                                            <TableCell className="text-muted-foreground">
                                                {agent.description || "-"}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                {slashCommands && slashCommands.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            슬래시 커맨드
                        </p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>커맨드</TableHead>
                                    <TableHead className="text-right">횟수</TableHead>
                                    {hasCmdDesc && <TableHead>설명</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {slashCommands.map((cmd) => (
                                    <TableRow key={cmd.command}>
                                        <TableCell className="font-mono font-medium">
                                            {cmd.command}
                                        </TableCell>
                                        <TableCell className="text-right">{cmd.count}회</TableCell>
                                        {hasCmdDesc && (
                                            <TableCell className="text-muted-foreground">
                                                {cmd.description || "-"}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                {delegationStyle.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            작업 위임 스타일
                        </p>
                        <ul className="list-disc space-y-1 pl-4">
                            {delegationStyle.map((style, i) => (
                                <li key={i} className="text-sm">
                                    {style}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
