export const TASK_TYPE_COLORS: Record<string, string> = {
  코딩: "#3b82f6",
  디버깅: "#ef4444",
  리팩토링: "#a855f7",
  수정: "#f97316",
  테스트: "#10b981",
  "설계/기획": "#22c55e",
  설정: "#64748b",
  "탐색/분석": "#06b6d4",
  학습: "#8b5cf6",
  스타일링: "#ec4899",
  문서화: "#f59e0b",
  "배포/CI": "#14b8a6",
  보안: "#dc2626",
  "성능 최적화": "#eab308",
  "데이터/DB": "#6366f1",
}

const DEFAULT_COLOR = "#9ca3af"

export function getTaskTypeColor(type: string): string {
  return TASK_TYPE_COLORS[type] ?? DEFAULT_COLOR
}
