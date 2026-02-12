import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WorkflowPattern } from "@/types";

interface Props {
    patterns: WorkflowPattern[];
}

export function WorkflowPatterns({ patterns }: Props) {
    if (patterns.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" />
                    워크플로우 패턴
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ol className="space-y-3">
                    {patterns.map((pattern, i) => (
                        <li key={i} className="flex items-start gap-3 rounded-lg border p-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                {i + 1}
                            </span>
                            <div>
                                <p className="font-semibold">{pattern.name}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </CardContent>
        </Card>
    );
}
