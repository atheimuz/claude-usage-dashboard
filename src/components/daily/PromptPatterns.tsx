import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PromptPatterns as PromptPatternsType } from "@/types";

interface Props {
    patterns: PromptPatternsType;
}

export function PromptPatterns({ patterns }: Props) {
    const hasAny = patterns.effective.length > 0 || patterns.conversationFlow.length > 0;
    if (!hasAny) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5" />
                    프롬프트 패턴
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {patterns.effective.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            효과적이었던 프롬프트
                        </p>
                        <ul className="list-disc space-y-1 pl-4">
                            {patterns.effective.map((item, i) => (
                                <li key={i} className="text-sm">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {patterns.conversationFlow.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">대화 흐름</p>
                        <ul className="space-y-1">
                            {patterns.conversationFlow.map((flow) => (
                                <li key={flow.type} className="text-sm">
                                    <span className="font-semibold">{flow.type}</span>
                                    <span className="ml-1 text-muted-foreground">
                                        - {flow.description}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
