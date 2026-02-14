import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WeeklyReport } from "@/types";

interface Props {
    reports: WeeklyReport[];
    selectedMonth: string | null;
    onSelectMonth: (yearMonth: string | null) => void;
}

const MONTH_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export function CalendarView({ reports, selectedMonth, onSelectMonth }: Props) {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());

    const monthCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const report of reports) {
            const yearMonth = report.date.slice(0, 7);
            if (/^\d{4}-\d{2}$/.test(yearMonth)) {
                counts.set(yearMonth, (counts.get(yearMonth) ?? 0) + 1);
            }
        }
        return counts;
    }, [reports]);

    const handleMonthClick = (monthIndex: number) => {
        const ym = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
        if (selectedMonth === ym) {
            onSelectMonth(null);
        } else {
            onSelectMonth(ym);
        }
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={() => setYear(year - 1)} aria-label="이전 연도">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold" aria-live="polite">{year}년</span>
                <Button variant="outline" size="icon" onClick={() => setYear(year + 1)} aria-label="다음 연도">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {MONTH_LABELS.map((label, i) => {
                    const ym = `${year}-${String(i + 1).padStart(2, "0")}`;
                    const count = monthCounts.get(ym) ?? 0;
                    const hasReports = count > 0;
                    const isSelected = selectedMonth === ym;
                    return (
                        <Button
                            key={ym}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            disabled={!hasReports}
                            className={cn(
                                "flex h-auto flex-col py-2",
                                hasReports && !isSelected && "bg-primary/10 hover:bg-primary/20",
                            )}
                            onClick={() => handleMonthClick(i)}
                        >
                            <span>{label}</span>
                            {hasReports && (
                                <span className={cn("text-xs", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>{count}건</span>
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
