import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
    mainTasks: string[];
}

export function TaskTypeGrid({ mainTasks }: Props) {
    if (mainTasks.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="h-5 w-5" />
                    주요 작업
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {mainTasks.map((task) => (
                        <Badge key={task} variant="secondary" className="text-sm">
                            {task}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
