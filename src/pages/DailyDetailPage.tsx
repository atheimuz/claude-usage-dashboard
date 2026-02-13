import { useParams } from "react-router-dom";
import { AlertCircle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDailyReport, useFileList } from "@/hooks/useReports";
import { getNextPrevFilename, sortFilesByDate } from "@/lib/utils";
import { DailyHeader } from "@/components/daily/DailyHeader";
import { UsageScoreCard } from "@/components/shared/UsageScoreCard";
import { UsageStyleSection } from "@/components/daily/UsageStyleSection";
import { ClaudeUsageSection } from "@/components/daily/ClaudeUsageSection";
import { PromptPatterns } from "@/components/daily/PromptPatterns";
import { ToolStatsTable } from "@/components/daily/ToolStatsTable";
import { TaskTypeGrid } from "@/components/daily/TaskTypeGrid";
import { ErrorSummarySection } from "@/components/daily/ErrorSummarySection";
import { LearningInsights } from "@/components/daily/LearningInsights";
import { WorkflowPatterns } from "@/components/daily/WorkflowPatterns";
import { Link } from "react-router-dom";

const LOCATION_PATTERN = /^[a-z0-9_-]+$/i;
const NAME_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidParam(location: string, name: string): boolean {
    return LOCATION_PATTERN.test(location) && NAME_PATTERN.test(name);
}

export function DailyDetailPage() {
    const { location, name } = useParams<{ location: string; name: string }>();
    const isValid = !!(location && name && isValidParam(location, name));
    const filename = isValid ? `${location}/${name}` : "";
    const { data: report, isLoading, isError, refetch } = useDailyReport(filename);
    const { data: files } = useFileList();

    const sorted = files ? sortFilesByDate(files) : [];
    const { prev, next } = filename
        ? getNextPrevFilename(filename, sorted)
        : { prev: undefined, next: undefined };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-32" />
                <Skeleton className="h-16" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
            </div>
        );
    }

    if (isError || !report) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                {isError ? (
                    <Alert variant="destructive" className="max-w-md">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>오류</AlertTitle>
                        <AlertDescription>해당 일지를 불러올 수 없습니다.</AlertDescription>
                        <div className="mt-3 flex gap-2">
                            <Button size="sm" onClick={() => refetch()}>
                                다시 시도
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                                <Link to="/daily">목록으로</Link>
                            </Button>
                        </div>
                    </Alert>
                ) : (
                    <>
                        <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
                        <p className="text-lg font-semibold">해당 날짜의 일지가 없습니다.</p>
                        <Button className="mt-4" variant="outline" asChild>
                            <Link to="/daily">목록으로 돌아가기</Link>
                        </Button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 1. Header */}
            <DailyHeader report={report} prevFilename={prev} nextFilename={next} />

            {/* 2. [2열] 활용도 평가 + 피드백 */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {report.scoring && (
                    <UsageScoreCard
                        score={report.scoring.total}
                        maxScore={100}
                        categories={report.scoring.categories}
                        grade={report.scoring.grade}
                        title="활용도 평가"
                        size="sm"
                        featured
                    />
                )}
                <LearningInsights feedback={report.feedback} />
            </div>

            {/* 3. [2열] 사용 스타일 + 프롬프트 통계 */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <UsageStyleSection usageStyle={report.usage_style} />
                <PromptPatterns promptStats={report.usage_style.prompt_stats} />
            </div>

            {/* 4. 클로드 코드 활용 방식 */}
            <ClaudeUsageSection toolUsage={report.tool_usage} />

            {/* 5. [2열] 도구 통계 + 주요 작업 */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <ToolStatsTable toolStats={report.tool_usage.top_tools} />
                <TaskTypeGrid mainTasks={report.summary.main_tasks} />
            </div>

            {/* 6. 에러 요약 */}
            <ErrorSummarySection errorSummary={report.error_summary} />

            {/* 7. 주요 워크플로우 */}
            <WorkflowPatterns mainWorkflow={report.main_workflow} />
        </div>
    );
}
