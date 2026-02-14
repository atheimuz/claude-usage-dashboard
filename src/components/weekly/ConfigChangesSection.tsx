import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import type { ConfigChange } from "@/types";

interface Props {
    configChanges?: ConfigChange[];
}

const CATEGORY_LABELS: Record<string, string> = {
    skill: "스킬",
    command: "커맨드",
    project_config: "프로젝트 설정",
    settings: "환경 설정"
};

function groupByCategory(changes: ConfigChange[]) {
    const groups: Record<string, ConfigChange[]> = {};
    for (const change of changes) {
        const key = change.category;
        if (!groups[key]) groups[key] = [];
        groups[key].push(change);
    }
    return groups;
}

export function ConfigChangesSection({ configChanges }: Props) {
    if (!configChanges || configChanges.length === 0) return null;

    const grouped = groupByCategory(configChanges);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5" />
                    설정 변경 이력
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.entries(grouped).map(([category, changes]) => (
                    <div key={category}>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                            {CATEGORY_LABELS[category] ?? category}
                        </p>
                        <Accordion type="multiple">
                            {changes.map((change) => (
                                <AccordionItem
                                    key={change.name}
                                    value={`${category}-${change.name}`}
                                >
                                    <AccordionTrigger className="py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-medium">
                                                {change.name}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {change.details.length > 0 ? (
                                            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                                                {change.details.map((detail, i) => (
                                                    <li key={i}>{detail}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                상세 내용 없음
                                            </p>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
