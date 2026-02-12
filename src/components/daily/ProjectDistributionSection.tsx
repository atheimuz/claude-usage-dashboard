import { FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import type { ProjectDistribution } from "@/types";

interface Props {
    distributions: ProjectDistribution[];
}

export function ProjectDistributionSection({ distributions }: Props) {
    if (distributions.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FolderOpen className="h-5 w-5" />
                    프로젝트 분포
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>프로젝트 유형</TableHead>
                            <TableHead className="text-right">세션 수</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {distributions.map((d) => (
                            <TableRow key={d.projectType}>
                                <TableCell>{d.projectType}</TableCell>
                                <TableCell className="text-right">{d.sessionCount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
