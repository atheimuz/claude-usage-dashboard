import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SummaryItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
}

interface SummaryCardProps {
  layout?: "single" | "double" | "triple";
  items: SummaryItem[];
  title?: string;
  className?: string;
}

export function SummaryCard({
  layout = "single",
  items,
  title,
  className,
}: SummaryCardProps) {
  const displayItems = items.slice(
    0,
    layout === "single" ? 1 : layout === "double" ? 2 : 3
  );

  return (
    <Card className={cn("py-4", className)}>
      <CardContent className="p-0 px-4">
        {title && (
          <h3 className="text-muted-foreground mb-3 text-sm font-medium">
            {title}
          </h3>
        )}
        <div
          className={cn(
            "grid gap-4",
            layout === "single" && "grid-cols-1",
            layout === "double" && "grid-cols-2",
            layout === "triple" && "grid-cols-3"
          )}
        >
          {displayItems.map((item, index) => (
            <SummaryItemDisplay key={index} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryItemDisplay({ item }: { item: SummaryItem }) {
  const Icon = item.icon;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
        <span className="text-muted-foreground text-sm">{item.label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold">{item.value}</span>
        {item.trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-sm",
              item.trend.direction === "up" ? "text-success" : "text-destructive"
            )}
          >
            {item.trend.direction === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {item.trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}
