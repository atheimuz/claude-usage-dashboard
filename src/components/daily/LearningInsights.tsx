import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    insights: string[];
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

export function LearningInsights({ insights }: Props) {
    if (insights.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5" />
                    학습 인사이트
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <span>{renderBoldText(insight)}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
