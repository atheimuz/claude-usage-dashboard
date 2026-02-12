import { FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SessionDetail } from "@/types";

interface Props {
    sessions: SessionDetail[];
}

export function SessionTimeline({ sessions }: Props) {
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
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {sessions.map((session, i) => (
                        <div key={i} className="min-w-[220px] flex-1 rounded-lg border p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <p className="font-semibold leading-tight">{session.groupName}</p>
                            </div>
                            <div className="space-y-1 text-sm">
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
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
