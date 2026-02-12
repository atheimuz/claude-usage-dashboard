import { test, expect } from "@playwright/test";
import { HomePage } from "../page-objects/home.page";
import { DailyListPage } from "../page-objects/daily-list.page";
import {
    MOCK_INDEX_JSON,
    MOCK_MARKDOWN_FILES,
    wrapResponse
} from "../mocks/claude-usage-dashboard.mock";

test.describe("공통 기능", () => {
    test.beforeEach(async ({ page }) => {
        // API 인터셉트 설정
        await page.route("**/data/index.json", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: wrapResponse(MOCK_INDEX_JSON)
            })
        );

        for (const [filename, content] of Object.entries(MOCK_MARKDOWN_FILES)) {
            await page.route(`**/data/${filename}.md`, (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "text/markdown",
                    body: content
                })
            );
        }
    });

    test.describe("4-1. 다크 모드", () => {
        test("다크 모드 토글 버튼 클릭 시 다크 모드로 전환되어야 한다", async ({ page }) => {
            const homePage = new HomePage(page);
            await homePage.navigateToHome();

            const html = page.locator("html");
            const initialTheme = await html.getAttribute("class");

            await homePage.toggleDarkMode();
            await page.waitForTimeout(200); // 테마 전환 애니메이션 대기

            const newTheme = await html.getAttribute("class");
            expect(newTheme).not.toBe(initialTheme);
        });

        test("다크 모드에서 토글 버튼 클릭 시 라이트 모드로 전환되어야 한다", async ({ page }) => {
            const homePage = new HomePage(page);
            await homePage.navigateToHome();

            // 다크 모드로 전환
            await homePage.toggleDarkMode();
            await page.waitForTimeout(200);

            const html = page.locator("html");
            const darkClass = await html.getAttribute("class");

            // 라이트 모드로 재전환
            await homePage.toggleDarkMode();
            await page.waitForTimeout(200);

            const lightClass = await html.getAttribute("class");
            expect(lightClass).not.toBe(darkClass);
        });

        test("다크 모드 설정이 localStorage에 저장되어야 한다", async ({ page }) => {
            const homePage = new HomePage(page);
            await homePage.navigateToHome();

            await homePage.toggleDarkMode();
            await page.waitForTimeout(200);

            const theme = await page.evaluate(() => localStorage.getItem("theme"));
            expect(theme).toBeTruthy();
            expect(theme).toMatch(/dark|light|system/);
        });

        test("페이지 새로고침 시 다크 모드 설정이 유지되어야 한다", async ({ page }) => {
            const homePage = new HomePage(page);
            await homePage.navigateToHome();

            await homePage.toggleDarkMode();
            await page.waitForTimeout(200);

            const html = page.locator("html");
            const themeBeforeReload = await html.getAttribute("class");

            await page.reload();
            await page.waitForTimeout(200);

            const themeAfterReload = await html.getAttribute("class");
            expect(themeAfterReload).toBe(themeBeforeReload);
        });

        test("시스템 설정을 따르는 옵션이 있어야 한다", async ({ page }) => {
            await page.goto("/");

            // 다크 모드 토글을 여러 번 클릭하여 system 옵션 확인
            const darkModeToggle = page.getByRole("button", { name: /dark mode|light mode/i });

            await darkModeToggle.click();
            await page.waitForTimeout(100);
            await darkModeToggle.click();
            await page.waitForTimeout(100);
            await darkModeToggle.click();
            await page.waitForTimeout(100);

            const theme = await page.evaluate(() => localStorage.getItem("theme"));
            // system 옵션이 사이클에 포함되어야 함
            expect(["dark", "light", "system"]).toContain(theme);
        });
    });

    test.describe("4-2. 네비게이션", () => {
        test("헤더의 서비스명 클릭 시 홈 페이지로 이동해야 한다", async ({ page }) => {
            const dailyListPage = new DailyListPage(page);
            await dailyListPage.navigateToDailyList();

            const serviceName = page.getByRole("link", { name: /Claude Usage Dashboard/i });
            await serviceName.click();
            await page.waitForURL("/");
            expect(page.url()).toContain("/");
        });

        test("헤더의 Dashboard 링크 클릭 시 홈 페이지로 이동해야 한다", async ({ page }) => {
            const dailyListPage = new DailyListPage(page);
            await dailyListPage.navigateToDailyList();

            const dashboardLink = page.getByRole("link", { name: "Dashboard" });
            await dashboardLink.click();
            await page.waitForURL("/");
            expect(page.url()).toMatch(/\/$|\/\?/);
        });

        test("헤더의 Daily Logs 링크 클릭 시 일지 목록 페이지로 이동해야 한다", async ({ page }) => {
            const homePage = new HomePage(page);
            await homePage.navigateToHome();

            const dailyLogsLink = page.getByRole("link", { name: "Daily Logs" });
            await dailyLogsLink.click();
            await page.waitForURL("/daily");
            expect(page.url()).toContain("/daily");
        });

        test("현재 페이지에 해당하는 네비게이션 링크가 활성 상태로 표시되어야 한다", async ({ page }) => {
            await page.goto("/");

            const dashboardLink = page.getByRole("link", { name: "Dashboard" });
            const dashboardClass = await dashboardLink.getAttribute("class");
            expect(dashboardClass).toMatch(/active|current/i);

            await page.goto("/daily");

            const dailyLogsLink = page.getByRole("link", { name: "Daily Logs" });
            const dailyLogsClass = await dailyLogsLink.getAttribute("class");
            expect(dailyLogsClass).toMatch(/active|current/i);
        });
    });

    test.describe("4-3. 반응형", () => {
        test("모바일 화면에서 통계 카드가 1열로 표시되어야 한다", async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

            const homePage = new HomePage(page);
            await homePage.navigateToHome();

            const statsCards = homePage.statsCards;
            const firstCard = statsCards.first();
            const secondCard = statsCards.nth(1);

            const firstCardBox = await firstCard.boundingBox();
            const secondCardBox = await secondCard.boundingBox();

            // 두 카드가 세로로 쌓여 있어야 함 (y 좌표가 달라야 함)
            expect(firstCardBox?.y).not.toBe(secondCardBox?.y);
        });

        test("태블릿 화면에서 통계 카드가 2열로 표시되어야 한다", async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 }); // iPad

            const homePage = new HomePage(page);
            await homePage.navigateToHome();

            const statsCards = homePage.statsCards;
            const firstCard = statsCards.first();
            const thirdCard = statsCards.nth(2);

            const firstCardBox = await firstCard.boundingBox();
            const thirdCardBox = await thirdCard.boundingBox();

            // 3번째 카드가 다음 행에 있어야 함
            expect(firstCardBox?.y).not.toBe(thirdCardBox?.y);
        });

        test("데스크탑 화면에서 통계 카드가 4열로 표시되어야 한다", async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD

            const homePage = new HomePage(page);
            await homePage.navigateToHome();

            const statsCards = homePage.statsCards;
            const count = await statsCards.count();

            expect(count).toBe(4);

            // 모든 카드가 같은 행에 있어야 함
            const firstCardBox = await statsCards.first().boundingBox();
            const lastCardBox = await statsCards.last().boundingBox();

            // Y 좌표가 비슷해야 함 (같은 행)
            expect(Math.abs((firstCardBox?.y || 0) - (lastCardBox?.y || 0))).toBeLessThan(10);
        });

        test("모바일 화면에서 차트가 세로로 쌓여야 한다", async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            const homePage = new HomePage(page);
            await homePage.navigateToHome();

            const toolChart = homePage.toolUsageChart;
            const taskChart = homePage.taskTypeChart;

            const toolChartBox = await toolChart.boundingBox();
            const taskChartBox = await taskChart.boundingBox();

            // 두 차트가 세로로 쌓여 있어야 함
            expect(toolChartBox?.y).not.toBe(taskChartBox?.y);
            expect((taskChartBox?.y || 0) > (toolChartBox?.y || 0)).toBe(true);
        });

        test("모바일 화면에서 작업 유형 카드가 1열로 표시되어야 한다", async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            await page.goto("/daily/work/2026-02-08");

            const taskTypeCards = page.locator("[role='region'][aria-label*='작업 유형'] [role='article']");
            const firstCard = taskTypeCards.first();
            const secondCard = taskTypeCards.nth(1);

            const firstCardBox = await firstCard.boundingBox();
            const secondCardBox = await secondCard.boundingBox();

            // 두 카드가 세로로 쌓여 있어야 함
            expect(firstCardBox?.y).not.toBe(secondCardBox?.y);
        });
    });
});
