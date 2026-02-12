import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTaskTypeIcon } from "@/lib/icons";
import type { TaskType } from "@/types";

interface Props {
    taskTypes: TaskType[];
}

export function TaskTypeGrid({ taskTypes }: Props) {
    if (taskTypes.length === 0) return null;

    const hasPercentage = taskTypes.some((tt) => tt.percentage != null);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="h-5 w-5" />
                    작업 유형
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {taskTypes.map((tt) => {
                        const Icon = getTaskTypeIcon(tt.type);
                        return (
                            <div
                                key={tt.type}
                                className="flex items-start gap-3 rounded-lg border p-3"
                            >
                                <Icon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{tt.type}</span>
                                        <Badge variant="outline">{tt.count}회</Badge>
                                        {tt.percentage != null && (
                                            <span className="text-xs text-muted-foreground">
                                                {tt.percentage}%
                                            </span>
                                        )}
                                    </div>
                                    {tt.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {tt.description}
                                        </p>
                                    )}
                                    {hasPercentage && tt.percentage != null && (
                                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary/60"
                                                style={{ width: `${tt.percentage}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
