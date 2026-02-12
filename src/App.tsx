import { lazy, Suspense } from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Layout } from "@/components/layout/Layout"
import { Skeleton } from "@/components/ui/skeleton"

const HomePage = lazy(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage })))
const DailyListPage = lazy(() => import("@/pages/DailyListPage").then(m => ({ default: m.DailyListPage })))
const DailyDetailPage = lazy(() => import("@/pages/DailyDetailPage").then(m => ({ default: m.DailyDetailPage })))

const queryClient = new QueryClient()

function PageFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <TooltipProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/daily" element={<DailyListPage />} />
                <Route path="/daily/:location/:name" element={<DailyDetailPage />} />
              </Route>
            </Routes>
          </Suspense>
        </TooltipProvider>
      </HashRouter>
    </QueryClientProvider>
  )
}

export default App
