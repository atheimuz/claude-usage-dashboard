import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Props {
  frequency: Record<string, number>
}

function getVariant(freq: number, maxFreq: number): "default" | "secondary" | "outline" {
  const pct = freq / maxFreq
  if (pct > 0.8) return "default"
  if (pct > 0.5) return "secondary"
  return "outline"
}

export function TechStackCloud({ frequency }: Props) {
  const entries = useMemo(
    () => Object.entries(frequency).sort((a, b) => b[1] - a[1]),
    [frequency]
  )
  if (entries.length === 0) return null
  const maxFreq = entries[0][1]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">기술 스택</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {entries.map(([tech, freq]) => (
            <Badge key={tech} variant={getVariant(freq, maxFreq)}>
              {tech} ({freq})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
