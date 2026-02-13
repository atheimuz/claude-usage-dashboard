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
import type { ToolUsage } from "@/types";

interface Props {
    toolUsage: ToolUsage;
}

export function ClaudeUsageSection({ toolUsage }: Props) {
    const { agents, commands, skills } = toolUsage;
    const hasAny = agents.length > 0 || commands.length > 0 || skills.length > 0;
    if (!hasAny) return null;

    const hasAgentDescription = agents.some((a) => a.description);
    const hasCommandDescription = commands.some((c) => c.description);
    const hasSkillDescription = skills.some((s) => s.description);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5" />
                    클로드 코드 활용 방식
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {agents.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            Sub Agent 위임
                        </p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Agent 유형</TableHead>
                                    {hasAgentDescription && (
                                        <TableHead>설명</TableHead>
                                    )}
                                    <TableHead className="text-right">횟수</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {agents.map((agent) => (
                                    <TableRow key={agent.type}>
                                        <TableCell className="font-medium">
                                            {agent.type}
                                        </TableCell>
                                        {hasAgentDescription && (
                                            <TableCell className="text-muted-foreground">
                                                {agent.description}
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right">
                                            {agent.count}회
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                {commands.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            슬래시 커맨드
                        </p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>커맨드</TableHead>
                                    {hasCommandDescription && (
                                        <TableHead>설명</TableHead>
                                    )}
                                    <TableHead className="text-right">횟수</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {commands.map((cmd) => (
                                    <TableRow key={cmd.name}>
                                        <TableCell className="font-mono font-medium">
                                            {cmd.name}
                                        </TableCell>
                                        {hasCommandDescription && (
                                            <TableCell className="text-muted-foreground">
                                                {cmd.description}
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right">{cmd.count}회</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                {skills.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            사용한 스킬
                        </p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>스킬</TableHead>
                                    {hasSkillDescription && (
                                        <TableHead>설명</TableHead>
                                    )}
                                    <TableHead className="text-right">횟수</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {skills.map((skill) => (
                                    <TableRow key={skill.name}>
                                        <TableCell className="font-mono font-medium">
                                            {skill.name}
                                        </TableCell>
                                        {hasSkillDescription && (
                                            <TableCell className="text-muted-foreground">
                                                {skill.description}
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right">{skill.count}회</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
