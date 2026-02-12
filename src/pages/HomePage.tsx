import { useMemo } from "react";
import { AlertCircle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAllReports } from "@/hooks/useReports";
import { aggregateReports } from "@/lib/aggregator";
import { UsageScoreCard } from "@/components/shared/UsageScoreCard";
import { ToolStatsTable } from "@/components/daily/ToolStatsTable";
import { TaskTypeGrid } from "@/components/daily/TaskTypeGrid";
import { TechStackCloud } from "@/components/dashboard/TechStackCloud";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export function HomePage() {
    const { data: reports, isLoading, isError } = useAllReports();

    const stats = useMemo(() => (reports.length > 0 ? aggregateReports(reports) : null), [reports]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="mt-1 h-5 w-64" />
                </div>
                <Skeleton className="h-48" />
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>데이터를 불러오는 중 오류가 발생했습니다.</AlertDescription>
                <Button size="sm" className="mt-2" onClick={() => window.location.reload()}>
                    다시 시도
                </Button>
            </Alert>
        );
    }

    if (!stats || reports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
                <p className="text-lg font-semibold">아직 기록된 사용 일지가 없습니다.</p>
                <p className="text-sm text-muted-foreground">
                    public/data/ 디렉토리에 마크다운 파일을 추가해 주세요.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">클로드 코드 활용도 종합</p>
            </div>
            <UsageScoreCard
                score={stats.averageEvaluationScore ?? stats.latestEvaluation?.overallScore ?? 0}
                maxScore={stats.latestEvaluation?.maxScore ?? 100}
                categories={stats.evaluationCategoryAverages ?? stats.latestEvaluation?.categories ?? []}
                grade={stats.latestEvaluation?.grade}
                taskComplexity={stats.latestEvaluation?.taskComplexity}
                label={stats.averageEvaluationScore ? "평균 활용도 점수" : "최신 활용도 점수"}
                categoryLabel="카테고리별 점수"
                size="lg"
            />
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <ToolStatsTable toolStats={stats.toolUsageAggregated} />
                <TaskTypeGrid taskTypes={stats.taskTypeAggregated} />
            </div>
            <TechStackCloud frequency={stats.techStackFrequency} />
            <RecentActivity reports={reports} />
        </div>
    );
}
