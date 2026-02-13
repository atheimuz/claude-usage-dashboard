import { Lightbulb, ThumbsUp, AlertTriangle, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Feedback } from "@/types";

interface Props {
    feedback: Feedback;
}

function renderBoldText(text: string) {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) =>
        i % 2 === 1 ? (
            <span key={i} className="font-semibold">{part}</span>
        ) : (
            part
        )
    );
}

export function LearningInsights({ feedback }: Props) {
    const { strengths, improvements, context_tips } = feedback;
    const hasAny = strengths.length > 0 || improvements.length > 0 || context_tips.length > 0;

    if (!hasAny) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5" />
                    피드백 & 인사이트
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {strengths.length > 0 && (
                    <div>
                        <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            <ThumbsUp className="h-4 w-4" />
                            잘한 점
                        </p>
                        <ul className="space-y-1 pl-5">
                            {strengths.map((item, i) => (
                                <li key={i} className="list-disc text-sm text-muted-foreground">
                                    {renderBoldText(item)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {improvements.length > 0 && (
                    <div>
                        <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="h-4 w-4" />
                            개선 포인트
                        </p>
                        <ul className="space-y-1 pl-5">
                            {improvements.map((item, i) => (
                                <li key={i} className="list-disc text-sm text-muted-foreground">
                                    {renderBoldText(item)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {context_tips.length > 0 && (
                    <div>
                        <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                            <BookOpen className="h-4 w-4" />
                            컨텍스트 팁
                        </p>
                        <ul className="space-y-1 pl-5">
                            {context_tips.map((item, i) => (
                                <li key={i} className="list-disc text-sm text-muted-foreground">
                                    {renderBoldText(item)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
