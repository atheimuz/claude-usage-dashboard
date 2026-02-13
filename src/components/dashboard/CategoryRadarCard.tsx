import { Radar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoringRadarChart } from "@/components/shared/ScoringRadarChart";

interface CategoryRadarCardProps {
    categoryAverages: {
        intent: number;
        efficiency: number;
        fitness: number;
        workflow: number;
    };
    label?: string;
}

export function CategoryRadarCard({ categoryAverages, label }: CategoryRadarCardProps) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Radar className="h-5 w-5" />
                    {label ?? "카테고리별 평균"}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center">
                <ScoringRadarChart categoryAverages={categoryAverages} height={180} />
            </CardContent>
        </Card>
    );
}
