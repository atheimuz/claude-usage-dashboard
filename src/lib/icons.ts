import {
  Code,
  RefreshCw,
  Bug,
  Settings,
  Pencil,
  TestTube,
  ClipboardList,
  Search,
  BookOpen,
  Palette,
  FileText,
  Rocket,
  Shield,
  Zap,
  Database,
  type LucideIcon,
} from "lucide-react"

const TASK_TYPE_ICONS: Record<string, LucideIcon> = {
  코딩: Code,
  디버깅: Bug,
  리팩토링: RefreshCw,
  수정: Pencil,
  테스트: TestTube,
  "설계/기획": ClipboardList,
  설정: Settings,
  "탐색/분석": Search,
  학습: BookOpen,
  스타일링: Palette,
  문서화: FileText,
  "배포/CI": Rocket,
  보안: Shield,
  "성능 최적화": Zap,
  "데이터/DB": Database,
}

export function getTaskTypeIcon(type: string): LucideIcon {
  return TASK_TYPE_ICONS[type] ?? Code
}
