import { Link, useLocation } from "react-router-dom"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Dashboard", path: "/" },
  { label: "Weekly Logs", path: "/weekly" },
]

export function Header() {
  const { isDark, toggleTheme } = useTheme()
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-bold">
            Claude Usage Dashboard
          </Link>
          <nav aria-label="메인 네비게이션" className="flex items-center gap-4">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.path === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    isActive
                      ? "text-foreground underline underline-offset-4"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  )
}
