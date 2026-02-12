import { Badge } from "@/components/ui/badge"
import { formatNumber } from "@/lib/utils"
import type { TechStack } from "@/types"

interface Props {
  techStack: TechStack
}

export function TechStackSection({ techStack }: Props) {
  const allItems = [
    ...techStack.languages.map((item) => ({ name: item.name, mentionCount: item.mentionCount, group: "lang" })),
    ...techStack.frameworks.map((item) => ({ name: item.name, mentionCount: item.mentionCount, group: "fw" })),
    ...techStack.tools.map((item) => ({ name: item.name, mentionCount: item.mentionCount, group: "tool" })),
  ]

  if (allItems.length === 0) return null

  const groupColor: Record<string, string> = {
    lang: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    fw: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    tool: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {allItems.map((item) => (
        <Badge
          key={`${item.group}-${item.name}`}
          variant="outline"
          className={`text-xs ${groupColor[item.group] || ""}`}
        >
          {item.name}
          {item.mentionCount != null && (
            <span className="ml-1 opacity-60">({formatNumber(item.mentionCount)})</span>
          )}
        </Badge>
      ))}
    </div>
  )
}
