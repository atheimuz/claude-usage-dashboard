import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

export type StatusType = "completed" | "in-progress" | "pending" | "canceled";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  completed: { label: "완료", variant: "success" },
  "in-progress": { label: "진행 중", variant: "default" },
  pending: { label: "대기", variant: "warning" },
  canceled: { label: "취소", variant: "destructive" },
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={className}>
      {label ?? config.label}
    </Badge>
  );
}
