import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    mainWorkflow: string;
}

export function WorkflowPatterns({ mainWorkflow }: Props) {
    if (!mainWorkflow) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" />
                    주요 워크플로우
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border p-4">
                    <p className="font-mono text-sm">{mainWorkflow}</p>
                </div>
            </CardContent>
        </Card>
    );
}
