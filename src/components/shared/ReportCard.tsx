import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TaskTypeBar } from "@/components/shared/TaskTypeBar";
import type { DailyReport } from "@/types";

interface Props {
    report: DailyReport;
    showDate?: boolean;
}

export function ReportCard({ report, showDate }: Props) {
    return (
        <Link
            to={`/daily/${report.filename}`}
            className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-accent/50"
        >
            <div className="flex-1 space-y-2">
                {showDate && (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatDate(report.date)}</span>
                    </div>
                )}
                <TaskTypeBar taskTypes={report.taskTypes} />
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
    );
}
