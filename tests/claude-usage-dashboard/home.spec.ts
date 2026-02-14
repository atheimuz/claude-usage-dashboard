import { test, expect } from "@playwright/test";
import { HomePage } from "../page-objects/home.page";
import {
    MOCK_INDEX_JSON,
    MOCK_MARKDOWN_FILES,
    MOCK_EMPTY_INDEX_JSON,
    wrapResponse
} from "../mocks/claude-usage-dashboard.mock";

test.describe("홈 대시보드 - 사용자 시나리오", () => {
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
    });

    test("사용자가 홈에 접속하면 전체 통계 요약을 확인할 수 있다", async () => {
        // Given - 홈 페이지 접속
        await homePage.navigateToHome();

        // Then - 헤더와 4개의 핵심 통계가 표시됨
        await homePage.expectHeaderVisible();
        await expect(homePage.statsCards).toHaveCount(4);
        await expect(homePage.activeDaysCard).toContainText("3");
        await expect(homePage.totalSessionsCard).toContainText("240");
        await expect(homePage.totalToolCallsCard).toContainText("3520");
        await expect(homePage.totalProjectsCard).toContainText("9");
    });

    test("사용자가 도구 활용 현황을 확인할 수 있다", async () => {
        // Given - 홈 페이지에서
        await homePage.navigateToHome();

        // Then - 도구 활용 통계가 표시되고 가장 많이 사용한 도구가 표시됨
        await expect(homePage.toolUsageChart).toBeVisible();
        await expect(homePage.toolUsageChart).toContainText("Read");
        await expect(homePage.toolUsageChart).toContainText("1,004회");
    });

    test("사용자가 작업 유형 분포를 확인할 수 있다", async () => {
        // Given - 홈 페이지에서
        await homePage.navigateToHome();

        // Then - 작업 유형별 이름, 횟수, 백분율이 표시됨
        await expect(homePage.taskTypeChart).toBeVisible();
        await expect(homePage.taskTypeChart).toContainText("Coding");
        await expect(homePage.taskTypeChart).toContainText("188회");
        await expect(homePage.taskTypeChart).toContainText("%");
    });

    test("사용자가 일별 활동 추이를 시각적으로 확인할 수 있다", async ({ page }) => {
        // Given - 홈 페이지에서
        await homePage.navigateToHome();

        // Then - 차트가 표시되고 X축에 날짜가 있음
        await expect(homePage.trendChart).toBeVisible();
        const xAxis = page.locator("[role='region'][aria-label*='일별 활동'] .recharts-xAxis");
        await expect(xAxis).toBeVisible();
        await expect(xAxis).toContainText(/02-08|02-09|02-10/);

        // When - 차트에 호버하면
        const chartLine = homePage.trendChart.locator(".recharts-line, .recharts-area").first();
        await chartLine.hover();

        // Then - 툴팁이 표시됨
        const tooltip = page.locator(".recharts-tooltip-wrapper");
        await expect(tooltip).toBeVisible();
    });

    test("사용자가 기술 스택 사용 빈도를 확인할 수 있다", async ({ page }) => {
        // Given - 홈 페이지에서
        await homePage.navigateToHome();

        // Then - 기술 스택이 카테고리별로 구분되어 Badge 형태로 표시됨
        await homePage.expectTechStackVisible();
        await expect(page.getByText(/Languages/i)).toBeVisible();
        await expect(page.getByText(/Frameworks/i)).toBeVisible();
        await expect(page.getByText(/Tools/i)).toBeVisible();

        const firstBadge = homePage.techStackBadges.first();
        const className = await firstBadge.getAttribute("class");
        expect(className).toMatch(/default|secondary|outline/);
    });

    test("사용자가 최근 활동 목록에서 일지 정보를 확인하고 상세 페이지로 이동할 수 있다", async ({ page }) => {
        // Given - 홈 페이지의 최근 활동 섹션에서
        await homePage.navigateToHome();
        await homePage.expectRecentActivityVisible();

        // Then - 각 활동 카드에 날짜, 요일, 세션 수, 도구 호출 수, 작업 유형이 표시됨
        const firstCard = homePage.recentActivityCards.first();
        await expect(firstCard).toContainText(/2026-\d{2}-\d{2}/);
        await expect(firstCard).toContainText(/월|화|수|목|금|토|일/);
        await expect(firstCard).toContainText(/세션/);
        await expect(firstCard).toContainText(/도구 호출/);
        await expect(firstCard).toContainText(/Coding|Refactoring|Planning/);

        // When - 활동 카드를 클릭하면
        await homePage.clickRecentActivityCard(0);

        // Then - 해당 일지 상세 페이지로 이동함
        await page.waitForURL(/\/weekly\/.+/);
        expect(page.url()).toMatch(/\/weekly\/.+/);
    });

    test("사용자가 최근 활동에서 전체 일지 목록으로 이동할 수 있다", async ({ page }) => {
        // Given - 홈 페이지의 최근 활동 섹션에서
        await homePage.navigateToHome();
        await expect(homePage.viewAllLink).toBeVisible();

        // When - 전체 보기 링크를 클릭하면
        await homePage.clickViewAll();

        // Then - 일지 목록 페이지로 이동함
        await page.waitForURL("/weekly");
        expect(page.url()).toContain("/weekly");
    });

    test.describe("로딩 및 에러 상태", () => {
        test("데이터 로딩 중에는 로딩 상태가 표시된다", async ({ page }) => {
            // Given - 데이터 로딩이 지연되는 상황에서
            const newPage = await page.context().newPage();
            await newPage.route("**/data/index.json", async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                });
            });

            // When - 홈 페이지에 접속하면
            const loadingHomePage = new HomePage(newPage);
            await loadingHomePage.navigateToHome();

            // Then - 로딩 스켈레톤이 표시됨
            await loadingHomePage.expectLoadingState();

            await newPage.close();
        });

        test("데이터 로드 실패 시 에러와 재시도 버튼이 표시된다", async ({ page }) => {
            // Given - 데이터 로드가 실패하는 상황에서
            const newPage = await page.context().newPage();
            await newPage.route("**/data/index.json", (route) => route.abort("failed"));

            // When - 홈 페이지에 접속하면
            const errorHomePage = new HomePage(newPage);
            await errorHomePage.navigateToHome();

            // Then - 에러 메시지와 재시도 버튼이 표시됨
            await errorHomePage.expectErrorState();
            await expect(errorHomePage.retryButton).toBeVisible();

            await newPage.close();
        });

        test("데이터가 없을 때 빈 상태 안내 메시지가 표시된다", async ({ page }) => {
            // Given - 일지 데이터가 없는 상황에서
            const newPage = await page.context().newPage();
            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_EMPTY_INDEX_JSON)
                })
            );

            // When - 홈 페이지에 접속하면
            const emptyHomePage = new HomePage(newPage);
            await emptyHomePage.navigateToHome();

            // Then - 빈 상태 안내 메시지가 표시됨
            await emptyHomePage.expectEmptyState();
            await expect(newPage.getByText(/public\/data/i)).toBeVisible();

            await newPage.close();
        });
    });
});
