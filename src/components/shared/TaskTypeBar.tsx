import type { TaskType } from "@/types";
import { getTaskTypeColor } from "@/lib/constants";

interface Props {
    taskTypes: TaskType[];
}

export function TaskTypeBar({ taskTypes }: Props) {
    const top3 = taskTypes.slice(0, 3);
    if (top3.length === 0) return null;

    const total = top3.reduce((sum, tt) => sum + (tt.percentage ?? tt.count), 0);
    const proportions = top3.map((tt) => ({
        ...tt,
        width: total > 0 ? ((tt.percentage ?? tt.count) / total) * 100 : 0
    }));
    return (
        <div className="space-y-1.5">
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {proportions.map((tt) => (
                    <div key={tt.type} className="flex items-center gap-1.5 text-xs">
                        <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: getTaskTypeColor(tt.type) }}
                        />
                        <span className="text-muted-foreground">
                            {tt.type} {Math.round(tt.width)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
