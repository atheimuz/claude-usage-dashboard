import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { Skeleton } from "@/components/ui/skeleton";

const HomePage = lazy(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })));

const MonthlyListPage = lazy(() =>
    import("@/pages/MonthlyListPage").then((m) => ({ default: m.MonthlyListPage }))
);
const MonthlyDetailPage = lazy(() =>
    import("@/pages/MonthlyDetailPage").then((m) => ({ default: m.MonthlyDetailPage }))
);

const queryClient = new QueryClient();

function PageFallback() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
        </div>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <HashRouter>
                <ScrollToTop />
                <TooltipProvider>
                    <Suspense fallback={<PageFallback />}>
                        <Routes>
                            <Route element={<Layout />}>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/monthly" element={<MonthlyListPage />} />
                                <Route
                                    path="/monthly/:location/:name"
                                    element={<MonthlyDetailPage />}
                                />
                            </Route>
                        </Routes>
                    </Suspense>
                </TooltipProvider>
            </HashRouter>
        </QueryClientProvider>
    );
}

export default App;
