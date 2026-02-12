import { FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import type { SessionDetail } from "@/types";

interface Props {
    sessions: SessionDetail[];
}

export function SessionAccordion({ sessions }: Props) {
    if (sessions.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FolderOpen className="h-5 w-5" />
                    세션 상세
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible defaultValue="session-0">
                    {sessions.map((session, i) => (
                        <AccordionItem key={i} value={`session-${i}`}>
                            <AccordionTrigger className="text-left">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold">{session.groupName}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 text-sm">
                                    {session.approach && (
                                        <div>
                                            <span className="text-muted-foreground">
                                                {session.approach}
                                            </span>
                                        </div>
                                    )}
                                    {session.mainTasks && (
                                        <div>
                                            <span className="text-muted-foreground">
                                                {session.mainTasks}
                                            </span>
                                        </div>
                                    )}
                                    {session.changeScale && (
                                        <div>
                                            <span className="text-muted-foreground">
                                                {session.changeScale}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
