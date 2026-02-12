import { test, expect } from "@playwright/test";
import { HomePage } from "../page-objects/home.page";
import {
    MOCK_INDEX_JSON,
    MOCK_MARKDOWN_FILES,
    MOCK_AGGREGATED_STATS,
    MOCK_EMPTY_INDEX_JSON,
    wrapResponse
} from "../mocks/claude-usage-dashboard.mock";

test.describe("홈 대시보드 페이지", () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        // API 인터셉트 설정
        await page.route("**/data/index.json", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: wrapResponse(MOCK_INDEX_JSON)
            })
        );

        // 각 마크다운 파일 인터셉트
        for (const [filename, content] of Object.entries(MOCK_MARKDOWN_FILES)) {
            await page.route(`**/data/${filename}.md`, (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "text/markdown",
                    body: content
                })
            );
        }

        homePage = new HomePage(page);
        await homePage.navigateToHome();
    });

    test.describe("1-1. 페이지 로드 및 레이아웃", () => {
        test("홈 페이지에 접속하면 헤더가 표시되어야 한다", async () => {
            await homePage.expectHeaderVisible();
        });

        test("헤더에 서비스명 Claude Usage Dashboard가 표시되어야 한다", async () => {
            await expect(homePage.serviceName).toBeVisible();
            await expect(homePage.serviceName).toHaveText(/Claude Usage Dashboard/i);
        });

        test("헤더에 다크 모드 토글 버튼이 표시되어야 한다", async () => {
            await expect(homePage.darkModeToggle).toBeVisible();
        });

        test("헤더에 네비게이션 링크 Dashboard와 Daily Logs가 표시되어야 한다", async () => {
            await expect(homePage.dashboardLink).toBeVisible();
            await expect(homePage.dailyLogsLink).toBeVisible();
        });

        test("현재 페이지인 Dashboard 링크에 활성 상태 표시가 있어야 한다", async () => {
            await expect(homePage.dashboardLink).toHaveClass(/active|current/i);
        });
    });

    test.describe("1-2. 통계 카드 영역", () => {
        test("4개의 통계 카드가 표시되어야 한다", async () => {
            await expect(homePage.statsCards).toHaveCount(4);
        });

        test("활동 일수 카드에 총 일수가 표시되어야 한다", async () => {
            await expect(homePage.activeDaysCard).toBeVisible();
            await expect(homePage.activeDaysCard).toContainText("3");
        });

        test("총 세션 수 카드에 전체 세션 수가 표시되어야 한다", async () => {
            await expect(homePage.totalSessionsCard).toBeVisible();
            await expect(homePage.totalSessionsCard).toContainText("240");
        });

        test("총 도구 호출 카드에 전체 도구 호출 횟수가 표시되어야 한다", async () => {
            await expect(homePage.totalToolCallsCard).toBeVisible();
            await expect(homePage.totalToolCallsCard).toContainText("3520");
        });

        test("프로젝트 수 카드에 고유 프로젝트 수가 표시되어야 한다", async () => {
            await expect(homePage.totalProjectsCard).toBeVisible();
            await expect(homePage.totalProjectsCard).toContainText("9");
        });

        test("각 통계 카드에 적절한 아이콘이 표시되어야 한다", async () => {
            const icons = homePage.page.locator("svg[class*='lucide']");
            await expect(icons.first()).toBeVisible();
        });
    });

    test.describe("1-3. 도구 활용 통계", () => {
        test("도구 활용 통계 테이블이 표시되어야 한다", async () => {
            await expect(homePage.toolUsageChart).toBeVisible();
        });

        test("도구명과 사용 횟수가 정확하게 표시되어야 한다", async () => {
            const chartArea = homePage.toolUsageChart;
            await expect(chartArea).toContainText("Read");
            await expect(chartArea).toContainText("1,004회");
        });
    });

    test.describe("1-4. 작업 유형 분포", () => {
        test("작업 유형 그리드가 표시되어야 한다", async () => {
            await expect(homePage.taskTypeChart).toBeVisible();
        });

        test("각 작업 유형의 이름과 횟수가 표시되어야 한다", async () => {
            const chartArea = homePage.taskTypeChart;
            await expect(chartArea).toContainText("Coding");
            await expect(chartArea).toContainText("188회");
        });

        test("각 작업 유형에 백분율이 표시되어야 한다", async () => {
            const chartArea = homePage.taskTypeChart;
            await expect(chartArea).toContainText("%");
        });
    });

    test.describe("1-5. 일별 활동 추이 차트", () => {
        test("일별 활동 추이 차트가 표시되어야 한다", async () => {
            await expect(homePage.trendChart).toBeVisible();
        });

        test("X축에 날짜가 표시되어야 한다", async ({ page }) => {
            const xAxis = page.locator("[role='region'][aria-label*='일별 활동'] .recharts-xAxis");
            await expect(xAxis).toBeVisible();
            await expect(xAxis).toContainText(/02-08|02-09|02-10/);
        });

        test("Y축에 세션 수와 도구 호출 수가 표시되어야 한다", async ({ page }) => {
            const yAxis = page.locator("[role='region'][aria-label*='일별 활동'] .recharts-yAxis");
            await expect(yAxis.first()).toBeVisible();
        });

        test("차트 호버 시 툴팁에 상세 정보가 표시되어야 한다", async ({ page }) => {
            const chart = homePage.trendChart;
            const chartLine = chart.locator(".recharts-line, .recharts-area").first();
            await chartLine.hover();

            const tooltip = page.locator(".recharts-tooltip-wrapper");
            await expect(tooltip).toBeVisible();
        });
    });

    test.describe("1-6. 기술 스택 빈도", () => {
        test("기술 스택 섹션이 표시되어야 한다", async () => {
            await homePage.expectTechStackVisible();
        });

        test("Languages, Frameworks, Tools 카테고리가 구분되어 표시되어야 한다", async ({ page }) => {
            await expect(page.getByText(/Languages/i)).toBeVisible();
            await expect(page.getByText(/Frameworks/i)).toBeVisible();
            await expect(page.getByText(/Tools/i)).toBeVisible();
        });

        test("각 기술 스택이 Badge 형태로 표시되어야 한다", async () => {
            await expect(homePage.techStackBadges.first()).toBeVisible();
        });

        test("빈도에 따라 Badge 스타일이 차등 적용되어야 한다", async () => {
            const badges = homePage.techStackBadges;
            const firstBadge = badges.first();
            const className = await firstBadge.getAttribute("class");
            expect(className).toMatch(/default|secondary|outline/);
        });
    });

    test.describe("1-7. 최근 활동 목록", () => {
        test("최근 활동 섹션이 표시되어야 한다", async () => {
            await homePage.expectRecentActivityVisible();
        });

        test("최근 7일간의 활동이 표시되어야 한다", async () => {
            const cardCount = await homePage.recentActivityCards.count();
            expect(cardCount).toBeLessThanOrEqual(7);
            expect(cardCount).toBeGreaterThan(0);
        });

        test("각 활동 카드에 날짜와 요일이 표시되어야 한다", async () => {
            const firstCard = homePage.recentActivityCards.first();
            await expect(firstCard).toContainText(/2026-\d{2}-\d{2}/);
            await expect(firstCard).toContainText(/월|화|수|목|금|토|일/);
        });

        test("각 활동 카드에 세션 수, 도구 호출 수, 프로젝트 수가 표시되어야 한다", async () => {
            const firstCard = homePage.recentActivityCards.first();
            await expect(firstCard).toContainText(/세션/);
            await expect(firstCard).toContainText(/도구 호출/);
            await expect(firstCard).toContainText(/프로젝트/);
        });

        test("각 활동 카드에 식별자 Badge가 표시되어야 한다", async () => {
            const firstCard = homePage.recentActivityCards.first();
            const badge = firstCard.locator("[role='badge'], .badge");
            await expect(badge.first()).toBeVisible();
        });

        test("각 활동 카드에 주요 작업 유형 태그가 표시되어야 한다", async () => {
            const firstCard = homePage.recentActivityCards.first();
            await expect(firstCard).toContainText(/Coding|Refactoring|Planning/);
        });

        test("활동 카드 클릭 시 해당 일지 상세 페이지로 이동해야 한다", async ({ page }) => {
            await homePage.clickRecentActivityCard(0);
            await page.waitForURL(/\/daily\/.+/);
            expect(page.url()).toMatch(/\/daily\/.+/);
        });

        test("전체 보기 링크가 표시되어야 한다", async () => {
            await expect(homePage.viewAllLink).toBeVisible();
        });

        test("전체 보기 링크 클릭 시 /daily 페이지로 이동해야 한다", async ({ page }) => {
            await homePage.clickViewAll();
            await page.waitForURL("/daily");
            expect(page.url()).toContain("/daily");
        });
    });

    test.describe("1-8. 로딩 상태", () => {
        test("데이터 로딩 중 통계 카드 영역에 Skeleton이 표시되어야 한다", async ({ page }) => {
            // 새 페이지 컨텍스트로 로딩 상태 테스트
            const newPage = await page.context().newPage();

            // API 응답을 지연시켜 로딩 상태 확인
            await newPage.route("**/data/index.json", async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                });
            });

            const loadingHomePage = new HomePage(newPage);
            await loadingHomePage.navigateToHome();
            await loadingHomePage.expectLoadingState();

            await newPage.close();
        });

        test("데이터 로딩 중 차트 영역에 Skeleton이 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/**/*.md", async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await route.abort();
            });

            await newPage.goto("/");
            const skeleton = newPage.locator(".skeleton, [aria-busy='true']");
            await expect(skeleton.first()).toBeVisible();

            await newPage.close();
        });

        test("데이터 로딩 중 최근 활동 영역에 Skeleton이 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/index.json", async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 500));
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                });
            });

            await newPage.goto("/");
            const skeleton = newPage.locator(".skeleton, [aria-busy='true']");
            await expect(skeleton.first()).toBeVisible();

            await newPage.close();
        });
    });

    test.describe("1-9. 에러 상태", () => {
        test("데이터 로드 실패 시 에러 Alert이 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 500,
                    contentType: "application/json",
                    body: JSON.stringify({ error: "Internal Server Error" })
                })
            );

            const errorHomePage = new HomePage(newPage);
            await errorHomePage.navigateToHome();
            await errorHomePage.expectErrorState();

            await newPage.close();
        });

        test("에러 Alert에 다시 시도 버튼이 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/index.json", (route) =>
                route.abort("failed")
            );

            const errorHomePage = new HomePage(newPage);
            await errorHomePage.navigateToHome();
            await expect(errorHomePage.retryButton).toBeVisible();

            await newPage.close();
        });
    });

    test.describe("1-10. 빈 상태", () => {
        test("데이터가 없을 때 빈 상태 메시지가 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_EMPTY_INDEX_JSON)
                })
            );

            const emptyHomePage = new HomePage(newPage);
            await emptyHomePage.navigateToHome();
            await emptyHomePage.expectEmptyState();

            await newPage.close();
        });

        test("빈 상태에 안내 메시지가 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_EMPTY_INDEX_JSON)
                })
            );

            await newPage.goto("/");
            await expect(newPage.getByText(/public\/data/i)).toBeVisible();

            await newPage.close();
        });
    });
});
