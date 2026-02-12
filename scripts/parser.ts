import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, Content, Heading, List, Table } from "mdast";
import type {
    DailyReport,
    OverviewStats,
    ProjectSession,
    TechStack,
    TechStackItem,
    ClaudeUsage,
    UsageMode,
    UsageFeature,
    SubAgentUsage,
    SlashCommandUsage,
    PromptPatterns,
    ConversationFlow,
    ToolStat,
    TaskType,
    SessionDetail,
    WorkflowPattern,
    UsageEvaluation,
    EvaluationGrade,
    TaskComplexity,
    ProjectDistribution
} from "../src/types/index.ts";

function textContent(node: Content): string {
    if ("value" in node) return node.value;
    if ("children" in node) return (node.children as Content[]).map(textContent).join("");
    return "";
}


function extractNumber(text: string): number {
    const m = text.match(/([\d,]+)/);
    return m ? parseInt(m[1].replace(/,/g, ""), 10) : 0;
}

function extractPercentage(text: string): number | undefined {
    const m = text.match(/([\d.]+)%/);
    return m ? parseFloat(m[1]) : undefined;
}

interface Section {
    emoji: string;
    title: string;
    nodes: Content[];
}

function splitSections(root: Root): {
    h1Text: string;
    blockquoteText: string;
    sections: Section[];
} {
    let h1Text = "";
    let blockquoteText = "";
    const sections: Section[] = [];
    let currentSection: Section | null = null;

    for (const node of root.children) {
        if (node.type === "heading" && node.depth === 1) {
            h1Text = textContent(node as Content);
            continue;
        }
        if (node.type === "blockquote" && !blockquoteText) {
            blockquoteText = textContent(node as Content);
            continue;
        }
        if (node.type === "heading" && node.depth === 2) {
            const title = textContent(node as Content);
            const emojiMatch = title.match(
                /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u
            );
            currentSection = {
                emoji: emojiMatch ? emojiMatch[1] : "",
                title: emojiMatch ? title.slice(emojiMatch[0].length) : title,
                nodes: []
            };
            sections.push(currentSection);
            continue;
        }
        if (currentSection) {
            currentSection.nodes.push(node);
        }
    }

    return { h1Text, blockquoteText, sections };
}

function findTable(nodes: Content[]): Table | undefined {
    return nodes.find((n) => n.type === "table") as Table | undefined;
}

function findList(nodes: Content[]): List | undefined {
    return nodes.find((n) => n.type === "list") as List | undefined;
}

function getListItems(list: List): string[] {
    return list.children.map((item) => textContent(item as unknown as Content));
}

function getH3Subsections(nodes: Content[]): Map<string, Content[]> {
    const map = new Map<string, Content[]>();
    let current: string | null = null;
    for (const node of nodes) {
        if (node.type === "heading" && (node as Heading).depth === 3) {
            current = textContent(node as Content);
            map.set(current, []);
        } else if (current) {
            map.get(current)!.push(node);
        }
    }
    return map;
}

function getH4Subsections(nodes: Content[]): Map<string, Content[]> {
    const map = new Map<string, Content[]>();
    let current: string | null = null;
    for (const node of nodes) {
        if (node.type === "heading" && (node as Heading).depth === 4) {
            current = textContent(node as Content);
            map.set(current, []);
        } else if (current) {
            map.get(current)!.push(node);
        }
    }
    return map;
}

function parseOverview(nodes: Content[]): {
    overview: OverviewStats;
    projectSessions: ProjectSession[];
} {
    const overview: OverviewStats = {
        totalSessions: 0,
        totalToolCalls: 0,
        projectCount: 0
    };
    const projectSessions: ProjectSession[] = [];

    const list = findList(nodes);
    if (list) {
        for (const item of list.children) {
            const text = textContent(item as unknown as Content);
            if (text.includes("평균") && text.includes("메시지")) {
                const floatMatch = text.match(/([\d.]+)\s*개/);
                if (floatMatch) overview.avgMessagesPerSession = parseFloat(floatMatch[1]);
            } else if (text.includes("평균") && text.includes("도구")) {
                const floatMatch = text.match(/([\d.]+)\s*회/);
                if (floatMatch) overview.avgToolCallsPerSession = parseFloat(floatMatch[1]);
            } else if (text.includes("세션 수") || text.includes("총 세션")) {
                overview.totalSessions = extractNumber(text);
            } else if (text.includes("도구 호출")) {
                overview.totalToolCalls = extractNumber(text);
            } else if (text.includes("프로젝트 수") || text.includes("프로젝트")) {
                overview.projectCount = extractNumber(text);
            } else if (text.includes("사용자 메시지") || text.includes("총 메시지")) {
                overview.totalUserMessages = extractNumber(text);
            }
        }
    }

    const table = findTable(nodes);
    if (table) {
        const headerRow = table.children[0];
        const firstHeader = headerRow
            ? textContent(headerRow.children[0] as unknown as Content).trim()
            : "";
        const isStatsTable = firstHeader.includes("항목");

        if (isStatsTable) {
            for (let i = 1; i < table.children.length; i++) {
                const row = table.children[i];
                if (row.children.length >= 2) {
                    const label = textContent(row.children[0] as unknown as Content)
                        .trim()
                        .toLowerCase();
                    const valueText = textContent(row.children[1] as unknown as Content).trim();

                    if (label.includes("세션") && label.includes("프로젝트")) {
                        const name = textContent(row.children[0] as unknown as Content)
                            .trim()
                            .replace(/\s*세션\s*$/, "")
                            .trim();
                        const count = extractNumber(valueText);
                        if (name) projectSessions.push({ projectName: name, sessionCount: count });
                    } else if (label.includes("총") && label.includes("세션")) {
                        overview.totalSessions = extractNumber(valueText);
                    } else if (label.includes("사용자") && label.includes("메시지")) {
                        overview.totalUserMessages = extractNumber(valueText);
                    } else if (
                        label.includes("도구") &&
                        label.includes("호출") &&
                        !label.includes("평균")
                    ) {
                        overview.totalToolCalls = extractNumber(valueText);
                    } else if (label.includes("평균") && label.includes("메시지")) {
                        const floatMatch = valueText.match(/~?([\d.]+)/);
                        if (floatMatch) overview.avgMessagesPerSession = parseFloat(floatMatch[1]);
                    } else if (label.includes("평균") && label.includes("도구")) {
                        const floatMatch = valueText.match(/~?([\d.]+)/);
                        if (floatMatch) overview.avgToolCallsPerSession = parseFloat(floatMatch[1]);
                    } else if (label.includes("프로젝트")) {
                        const name = textContent(row.children[0] as unknown as Content)
                            .trim()
                            .replace(/\s*세션\s*$/, "")
                            .trim();
                        const count = extractNumber(valueText);
                        if (name && count)
                            projectSessions.push({ projectName: name, sessionCount: count });
                    }
                }
            }
        } else {
            for (let i = 1; i < table.children.length; i++) {
                const row = table.children[i];
                if (row.children.length >= 2) {
                    const name = textContent(row.children[0] as unknown as Content).trim();
                    const count = extractNumber(textContent(row.children[1] as unknown as Content));
                    if (name) projectSessions.push({ projectName: name, sessionCount: count });
                }
            }
        }
    }

    return { overview, projectSessions };
}

function parseTechStack(nodes: Content[]): TechStack {
    const stack: TechStack = { languages: [], frameworks: [], tools: [] };
    const subs = getH3Subsections(nodes);

    const assignToCategory = (keyLower: string, items: TechStackItem[]) => {
        if (keyLower.includes("언어") || keyLower.includes("language")) stack.languages = items;
        else if (
            keyLower.includes("프레임워크") ||
            keyLower.includes("라이브러리") ||
            keyLower.includes("framework")
        )
            stack.frameworks = items;
        else if (
            keyLower.includes("도구") ||
            keyLower.includes("인프라") ||
            keyLower.includes("tool")
        )
            stack.tools = items;
    };

    if (subs.size > 0) {
        for (const [key, subNodes] of subs) {
            const keyLower = key.toLowerCase();
            const table = findTable(subNodes);
            if (table) {
                const items: TechStackItem[] = [];
                for (let i = 1; i < table.children.length; i++) {
                    const row = table.children[i];
                    if (row.children.length >= 1) {
                        const name = textContent(row.children[0] as unknown as Content).trim();
                        const mentionCount =
                            row.children.length >= 2
                                ? extractNumber(textContent(row.children[1] as unknown as Content))
                                : undefined;
                        if (name) items.push({ name, mentionCount: mentionCount || undefined });
                    }
                }
                assignToCategory(keyLower, items);
                continue;
            }

            const list = findList(subNodes);
            const items: TechStackItem[] = list
                ? getListItems(list).map((s) => ({ name: s.replace(/\s*\(.*?\)\s*$/, "").trim() }))
                : [];
            assignToCategory(keyLower, items);
        }
    } else {
        const table = findTable(nodes);
        if (table) {
            for (let i = 1; i < table.children.length; i++) {
                const row = table.children[i];
                if (row.children.length >= 1) {
                    const name = textContent(row.children[0] as unknown as Content).trim();
                    const mentionCount =
                        row.children.length >= 2
                            ? extractNumber(textContent(row.children[1] as unknown as Content))
                            : undefined;
                    if (name) stack.tools.push({ name, mentionCount: mentionCount || undefined });
                }
            }
        }
    }

    return stack;
}

function parseClaudeUsage(nodes: Content[]): ClaudeUsage {
    const usage: ClaudeUsage = { modes: [], features: [], delegationStyle: [] };
    const subs = getH3Subsections(nodes);

    for (const [key, subNodes] of subs) {
        const keyLower = key.toLowerCase();

        if (keyLower.includes("모드")) {
            const list = findList(subNodes);
            if (!list) continue;
            const items = getListItems(list);
            usage.modes = items.map((text): UsageMode => {
                const nameMatch = text.match(/\*\*(.+?)\*\*/);
                return {
                    name: nameMatch ? nameMatch[1] : text.split(":")[0].trim(),
                    description: text.replace(/\*\*/g, "").trim(),
                    percentage: extractPercentage(text)
                };
            });
        } else if (
            keyLower.includes("sub agent") ||
            keyLower.includes("subagent") ||
            keyLower.includes("서브 에이전트") ||
            keyLower.includes("위임")
        ) {
            const table = findTable(subNodes);
            if (table) {
                const subAgents: SubAgentUsage[] = [];
                const headerRow = table.children[0];
                const headerTexts = headerRow
                    ? headerRow.children.map((c) => textContent(c as unknown as Content).toLowerCase())
                    : [];
                const descIdx = headerTexts.findIndex((h) => h.includes("설명"));
                const countIdx = headerTexts.findIndex((h) => h.includes("횟수") || h.includes("사용"));
                const descBeforeCount = descIdx >= 0 && countIdx >= 0 && descIdx < countIdx;

                for (let i = 1; i < table.children.length; i++) {
                    const row = table.children[i];
                    if (row.children.length >= 2) {
                        const agentType = textContent(row.children[0] as unknown as Content).trim();
                        let count: number;
                        let description: string | undefined;

                        if (descBeforeCount && row.children.length >= 3) {
                            description = textContent(row.children[1] as unknown as Content).trim();
                            count = extractNumber(textContent(row.children[2] as unknown as Content));
                        } else {
                            count = extractNumber(textContent(row.children[1] as unknown as Content));
                            description = row.children.length >= 3
                                ? textContent(row.children[2] as unknown as Content).trim()
                                : undefined;
                        }
                        if (agentType) subAgents.push({ agentType, count, description });
                    }
                }
                if (subAgents.length > 0) {
                    usage.subAgentUsages = subAgents;
                    continue;
                }
            }
            const list = findList(subNodes);
            if (list) {
                usage.delegationStyle = getListItems(list);
            }
        } else if (
            keyLower.includes("슬래시") ||
            keyLower.includes("slash") ||
            keyLower.includes("커맨드") ||
            keyLower.includes("command") ||
            keyLower.includes("skill")
        ) {
            const table = findTable(subNodes);
            if (table) {
                const commands: SlashCommandUsage[] = [];
                const headerRow = table.children[0];
                const headerTexts = headerRow
                    ? headerRow.children.map((c) => textContent(c as unknown as Content).toLowerCase())
                    : [];
                const descIdx = headerTexts.findIndex((h) => h.includes("설명"));
                const countIdx = headerTexts.findIndex((h) => h.includes("횟수") || h.includes("사용"));
                const descBeforeCount = descIdx >= 0 && countIdx >= 0 && descIdx < countIdx;

                for (let i = 1; i < table.children.length; i++) {
                    const row = table.children[i];
                    if (row.children.length >= 2) {
                        const command = textContent(row.children[0] as unknown as Content).trim();
                        let count: number;
                        let description: string | undefined;

                        if (descBeforeCount && row.children.length >= 3) {
                            description = textContent(row.children[1] as unknown as Content).trim();
                            count = extractNumber(textContent(row.children[2] as unknown as Content));
                        } else {
                            count = extractNumber(textContent(row.children[1] as unknown as Content));
                            description = row.children.length >= 3
                                ? textContent(row.children[2] as unknown as Content).trim()
                                : undefined;
                        }
                        if (command) commands.push({ command, count, description });
                    }
                }
                if (commands.length > 0) {
                    usage.slashCommands = [...(usage.slashCommands || []), ...commands];
                }
            }
        } else if ((keyLower.includes("기능") || keyLower.includes("활용")) && !keyLower.includes("skill")) {
            const h4Subs = getH4Subsections(subNodes);
            if (h4Subs.size > 0) {
                for (const [h4Key, h4Nodes] of h4Subs) {
                    const h4Lower = h4Key.toLowerCase();
                    if (
                        h4Lower.includes("sub agent") ||
                        h4Lower.includes("subagent") ||
                        h4Lower.includes("위임") ||
                        h4Lower.includes("서브")
                    ) {
                        const table = findTable(h4Nodes);
                        if (table) {
                            const subAgents: SubAgentUsage[] = [];
                            for (let i = 1; i < table.children.length; i++) {
                                const row = table.children[i];
                                if (row.children.length >= 2) {
                                    const agentType = textContent(
                                        row.children[0] as unknown as Content
                                    ).trim();
                                    const count = extractNumber(
                                        textContent(row.children[1] as unknown as Content)
                                    );
                                    const description =
                                        row.children.length >= 3
                                            ? textContent(
                                                  row.children[2] as unknown as Content
                                              ).trim()
                                            : undefined;
                                    if (agentType)
                                        subAgents.push({ agentType, count, description });
                                }
                            }
                            if (subAgents.length > 0) usage.subAgentUsages = subAgents;
                        }
                    }
                }
            }

            const list = findList(subNodes);
            if (!list) continue;
            const items = getListItems(list);
            usage.features = items.map((text): UsageFeature => {
                const nameMatch = text.match(/\*\*(.+?)\*\*/);
                const countMatch = text.match(/(\d+)\s*회/);
                return {
                    name: nameMatch ? nameMatch[1] : text.split(":")[0].trim(),
                    description: text.replace(/\*\*/g, "").trim(),
                    percentage: extractPercentage(text),
                    count: countMatch ? parseInt(countMatch[1], 10) : undefined
                };
            });
        } else if (keyLower.includes("스타일")) {
            const list = findList(subNodes);
            if (list) usage.delegationStyle = getListItems(list);
        }
    }

    return usage;
}

function parsePromptPatterns(nodes: Content[]): PromptPatterns {
    const patterns: PromptPatterns = { effective: [], conversationFlow: [] };
    const subs = getH3Subsections(nodes);

    for (const [key, subNodes] of subs) {
        const list = findList(subNodes);
        if (!list) continue;
        const items = getListItems(list);
        const keyLower = key.toLowerCase();

        if (keyLower.includes("효과") || keyLower.includes("프롬프트")) {
            patterns.effective = items;
        } else if (keyLower.includes("흐름") || keyLower.includes("대화")) {
            patterns.conversationFlow = items.map((text): ConversationFlow => {
                const typeMatch = text.match(/\*\*(.+?)\*\*/);
                return {
                    type: typeMatch ? typeMatch[1] : text.split(":")[0].trim(),
                    description: text.replace(/\*\*(.+?)\*\*\s*:?\s*/, "").trim()
                };
            });
        }
    }

    return patterns;
}

function parseToolStats(nodes: Content[]): ToolStat[] {
    const table = findTable(nodes);
    if (!table) return [];

    const stats: ToolStat[] = [];
    for (let i = 1; i < table.children.length; i++) {
        const row = table.children[i];
        if (row.children.length >= 3) {
            const toolName = textContent(row.children[0] as unknown as Content).trim();
            const usageCount = extractNumber(textContent(row.children[1] as unknown as Content));
            const primaryUse = textContent(row.children[2] as unknown as Content).trim();
            if (toolName) stats.push({ toolName, usageCount, primaryUse });
        }
    }

    return stats;
}

function parseTaskTypes(nodes: Content[]): TaskType[] {
    const table = findTable(nodes);
    if (table && table.children.length > 1) {
        const tasks: TaskType[] = [];
        for (let i = 1; i < table.children.length; i++) {
            const row = table.children[i];
            if (row.children.length >= 2) {
                const type = textContent(row.children[0] as unknown as Content)
                    .trim()
                    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}][\uFE0F]?\s*/u, "");
                const countText = textContent(row.children[1] as unknown as Content);
                const count = extractNumber(countText);
                const percentage = extractPercentage(countText);
                const description =
                    row.children.length >= 3
                        ? textContent(row.children[2] as unknown as Content).trim()
                        : "";
                if (type) tasks.push({ type, count, description, percentage });
            }
        }
        if (tasks.length > 0) return tasks;
    }

    const list = findList(nodes);
    if (!list) return [];

    return getListItems(list).map((text): TaskType => {
        const cleanText = text.replace(
            /^[\p{Emoji_Presentation}\p{Extended_Pictographic}][\uFE0F]?\s*/u,
            ""
        );
        const match = cleanText.match(/(.+?)\s*\((\d+)\s*회\)\s*[—-]\s*(.+)/);
        if (match) {
            return {
                type: match[1].trim(),
                count: parseInt(match[2], 10),
                description: match[3].trim()
            };
        }
        return {
            type: cleanText,
            count: extractNumber(cleanText),
            description: cleanText.replace(/.*[—-]\s*/, "").trim()
        };
    });
}

function parseSessionDetails(nodes: Content[]): SessionDetail[] {
    const subs = getH3Subsections(nodes);
    const details: SessionDetail[] = [];

    for (const [key, subNodes] of subs) {
        const groupName = key.replace(/^세션\s*그룹\s*\d+\s*:\s*/, "").trim();
        const detail: SessionDetail = {
            groupName,
            taskTypes: [],
            approach: "",
            mainTasks: "",
            changeScale: ""
        };

        const list = findList(subNodes);
        if (list) {
            for (const item of list.children) {
                const text = textContent(item as unknown as Content);
                if (text.includes("작업 유형")) {
                    detail.taskTypes = text
                        .replace(/.*:\s*/, "")
                        .split(/[+,]/)
                        .map((s) =>
                            s
                                .trim()
                                .replace(/[💻♻️📋📚🐛⚙️]/g, "")
                                .trim()
                        )
                        .filter(Boolean);
                } else if (text.includes("활용 방식") || text.includes("활용")) {
                    detail.approach = text.replace(/.*:\s*/, "").trim();
                } else if (text.includes("주요 작업")) {
                    detail.mainTasks = text.replace(/.*:\s*/, "").trim();
                } else if (text.includes("수정 규모")) {
                    detail.changeScale = text.replace(/.*:\s*/, "").trim();
                }
            }
        }

        details.push(detail);
    }

    return details;
}

function parseLearningInsights(nodes: Content[]): string[] {
    const list = findList(nodes);
    if (!list) return [];
    return getListItems(list);
}

function parseWorkflowPatterns(nodes: Content[]): WorkflowPattern[] {
    const list = findList(nodes);
    if (!list) return [];

    return getListItems(list).map((text): WorkflowPattern => {
        const match = text.match(/\*\*(.+?)\*\*\s*:?\s*(.+)/);
        if (match) return { name: match[1], flow: match[2].trim() };
        return { name: text, flow: "" };
    });
}

function parseUsageEvaluation(nodes: Content[]): UsageEvaluation {
    const evaluation: UsageEvaluation = {
        overallScore: 0,
        maxScore: 100,
        categories: [],
        strengths: [],
        improvements: []
    };

    const subs = getH3Subsections(nodes);
    for (const [key] of subs) {
        const keyLower = key.toLowerCase();
        if (keyLower.includes("종합") || keyLower.includes("점수")) {
            const scoreMatch = key.match(/(\d+)\s*\/\s*(\d+)/);
            if (scoreMatch) {
                evaluation.overallScore = parseInt(scoreMatch[1], 10);
                evaluation.maxScore = parseInt(scoreMatch[2], 10);
            }
            const gradeMatch = key.match(/등급\s*:\s*([SABCD])/);
            if (gradeMatch) {
                evaluation.grade = gradeMatch[1] as EvaluationGrade;
            }
        }
    }

    for (const node of nodes) {
        if (node.type === "paragraph") {
            const text = textContent(node as Content);
            const complexityMatch = text.match(/작업\s*복잡도\s*:\s*(경량|중량급|중량)/);
            if (complexityMatch) {
                evaluation.taskComplexity = complexityMatch[1] as TaskComplexity;
                break;
            }
        }
    }

    if (evaluation.overallScore === 0) {
        for (const node of nodes) {
            if (node.type === "paragraph") {
                const text = textContent(node as Content);
                const scoreMatch = text.match(/\*\*(\d+)\s*점?\*\*\s*\/?\s*(\d+)?/);
                if (scoreMatch) {
                    evaluation.overallScore = parseInt(scoreMatch[1], 10);
                    if (scoreMatch[2]) evaluation.maxScore = parseInt(scoreMatch[2], 10);
                }
            }
        }
    }

    const table = findTable(nodes);
    if (table) {
        for (let i = 1; i < table.children.length; i++) {
            const row = table.children[i];
            if (row.children.length >= 2) {
                const name = textContent(row.children[0] as unknown as Content).trim();
                const scoreText = textContent(row.children[1] as unknown as Content);
                const scoreMatch = scoreText.match(/(\d+)\s*\/?\s*(\d+)?/);
                const description =
                    row.children.length >= 3
                        ? textContent(row.children[2] as unknown as Content).trim()
                        : undefined;
                if (name && scoreMatch) {
                    evaluation.categories.push({
                        name,
                        score: parseInt(scoreMatch[1], 10),
                        maxScore: scoreMatch[2] ? parseInt(scoreMatch[2], 10) : 20,
                        description
                    });
                }
            }
        }
    }

    for (const [key, subNodes] of subs) {
        const list = findList(subNodes);
        if (!list) continue;
        const items = getListItems(list);
        const keyLower = key.toLowerCase();
        if (keyLower.includes("잘한") || keyLower.includes("강점") || keyLower.includes("장점")) {
            evaluation.strengths = items;
        } else if (
            keyLower.includes("개선") ||
            keyLower.includes("보완") ||
            keyLower.includes("부족")
        ) {
            evaluation.improvements = items;
        }
    }

    return evaluation;
}

function parseProjectDistribution(nodes: Content[]): ProjectDistribution[] {
    const table = findTable(nodes);
    if (!table) return [];

    const distributions: ProjectDistribution[] = [];
    for (let i = 1; i < table.children.length; i++) {
        const row = table.children[i];
        if (row.children.length >= 2) {
            const projectType = textContent(row.children[0] as unknown as Content).trim();
            const sessionCount = textContent(row.children[1] as unknown as Content).trim();
            if (projectType) distributions.push({ projectType, sessionCount });
        }
    }

    return distributions;
}

const SECTION_MAP: Record<string, string> = {
    "\u{1F4CA}": "overview",
    "\u{1F6E0}": "techStack",
    "\u{1F916}": "claudeUsage",
    "\u{1F4AC}": "promptPatterns",
    "\u{1F527}": "toolStats",
    "\u{1F4DD}": "taskTypes",
    "\u{1F5C2}": "sessionDetails",
    "\u{1F4A1}": "learningInsights",
    "\u{1F4C8}": "workflowPatterns",
    "\u{1F3AF}": "usageEvaluation"
};

function identifySection(emoji: string, title: string): string {
    if (SECTION_MAP[emoji]) {
        if (emoji === "\u{1F5C2}") {
            const t = title.toLowerCase();
            if (t.includes("프로젝트") && t.includes("분포")) return "projectDistribution";
            return "sessionDetails";
        }
        return SECTION_MAP[emoji];
    }
    const t = title.toLowerCase();
    if (t.includes("활용도 평가") || t.includes("평가")) return "usageEvaluation";
    if (t.includes("프로젝트 분포")) return "projectDistribution";
    if (t.includes("도구") && t.includes("통계")) return "toolStats";
    if (t.includes("통계")) return "overview";
    if (t.includes("기술 스택")) return "techStack";
    if (t.includes("활용 방식") || t.includes("클로드")) return "claudeUsage";
    if (t.includes("프롬프트")) return "promptPatterns";
    if (t.includes("도구")) return "toolStats";
    if (t.includes("작업 유형")) return "taskTypes";
    if (t.includes("세션")) return "sessionDetails";
    if (t.includes("인사이트") || t.includes("학습")) return "learningInsights";
    if (t.includes("워크플로우") || t.includes("패턴")) return "workflowPatterns";
    return "unknown";
}

export function parseDailyReport(markdown: string, filename: string): DailyReport {
    const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;

    const { h1Text, blockquoteText, sections } = splitSections(tree);

    const dateMatch = h1Text.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : "";
    const filenameClean = filename.replace(/\.md$/, "");
    let identifier = "";
    if (filenameClean.includes("/")) {
        identifier = filenameClean.split("/")[0];
    } else {
        const idMatch = filenameClean.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
        identifier = idMatch ? idMatch[1] : "";
    }

    const report: DailyReport = {
        date,
        identifier,
        filename: filenameClean,
        overview: { totalSessions: 0, totalToolCalls: 0, projectCount: 0 },
        projectSessions: [],
        techStack: { languages: [], frameworks: [], tools: [] },
        claudeUsage: { modes: [], features: [], delegationStyle: [] },
        promptPatterns: { effective: [], conversationFlow: [] },
        toolStats: [],
        taskTypes: [],
        sessionDetails: [],
        learningInsights: [],
        workflowPatterns: []
    };

    for (const section of sections) {
        const sectionType = identifySection(section.emoji, section.title);

        switch (sectionType) {
            case "overview": {
                const { overview, projectSessions } = parseOverview(section.nodes);
                report.overview = overview;
                report.projectSessions = projectSessions;
                break;
            }
            case "techStack":
                report.techStack = parseTechStack(section.nodes);
                break;
            case "claudeUsage":
                report.claudeUsage = parseClaudeUsage(section.nodes);
                break;
            case "promptPatterns":
                report.promptPatterns = parsePromptPatterns(section.nodes);
                break;
            case "toolStats":
                report.toolStats = parseToolStats(section.nodes);
                break;
            case "taskTypes":
                report.taskTypes = parseTaskTypes(section.nodes);
                break;
            case "sessionDetails":
                report.sessionDetails = parseSessionDetails(section.nodes);
                break;
            case "learningInsights":
                report.learningInsights = parseLearningInsights(section.nodes);
                break;
            case "workflowPatterns":
                report.workflowPatterns = parseWorkflowPatterns(section.nodes);
                break;
            case "usageEvaluation":
                report.usageEvaluation = parseUsageEvaluation(section.nodes);
                break;
            case "projectDistribution":
                report.projectDistribution = parseProjectDistribution(section.nodes);
                break;
        }
    }

    return report;
}
