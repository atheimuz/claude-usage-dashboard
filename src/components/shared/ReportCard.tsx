import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
                        <Badge variant="outline" className="text-xs">
                            {report.identifier}
                        </Badge>
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        {report.summary.sessions}개 세션
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <div className="flex flex-wrap gap-1">
                        {report.summary.main_tasks.slice(0, 3).map((task) => (
                            <Badge key={task} variant="secondary" className="text-xs">
                                {task}
                            </Badge>
                        ))}
                    </div>
                    {report.scoring && (
                        <>
                            <span className="text-muted-foreground">·</span>
                            <Badge variant="outline" className="text-xs">
                                {report.scoring.grade} ({report.scoring.total}점)
                            </Badge>
                        </>
                    )}
                </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
    );
}
