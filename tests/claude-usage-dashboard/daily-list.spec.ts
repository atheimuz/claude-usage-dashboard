import { test, expect } from "@playwright/test";
import { DailyListPage } from "../page-objects/daily-list.page";
import {
    MOCK_INDEX_JSON,
    MOCK_MARKDOWN_FILES,
    MOCK_EMPTY_INDEX_JSON,
    wrapResponse
} from "../mocks/claude-usage-dashboard.mock";

test.describe("일지 목록 페이지", () => {
    let dailyListPage: DailyListPage;

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

        dailyListPage = new DailyListPage(page);
        await dailyListPage.navigateToDailyList();
    });

    test.describe("2-1. 페이지 로드 및 레이아웃", () => {
        test("/daily 페이지에 접속하면 페이지 타이틀 Daily Logs가 표시되어야 한다", async () => {
            await expect(dailyListPage.pageTitle).toBeVisible();
            await expect(dailyListPage.pageTitle).toHaveText("Daily Logs");
        });

        test("서브타이틀 날짜별 클로드 코드 사용 일지가 표시되어야 한다", async () => {
            await expect(dailyListPage.pageSubtitle).toBeVisible();
        });

        test("뷰 전환 토글 버튼이 표시되어야 한다", async () => {
            await expect(dailyListPage.viewToggle).toBeVisible();
        });

        test("헤더의 Daily Logs 링크에 활성 상태 표시가 있어야 한다", async ({ page }) => {
            const dailyLogsLink = page.getByRole("link", { name: "Daily Logs" });
            await expect(dailyLogsLink).toHaveClass(/active|current/i);
        });
    });

    test.describe("2-2. 리스트 뷰 (기본)", () => {
        test("리스트 뷰가 기본으로 표시되어야 한다", async () => {
            await dailyListPage.expectListViewVisible();
        });

        test("일지 목록이 최신 날짜순으로 정렬되어야 한다", async () => {
            const cards = dailyListPage.listCards;
            const firstCardDate = await cards.first().locator("[data-date]").textContent();
            const lastCardDate = await cards.last().locator("[data-date]").textContent();

            // 최신 날짜가 위에 있어야 함
            expect(firstCardDate).toBeTruthy();
            expect(lastCardDate).toBeTruthy();
        });

        test("각 일지 카드에 날짜와 요일이 표시되어야 한다", async () => {
            const firstCard = dailyListPage.listCards.first();
            await expect(firstCard).toContainText(/2026-\d{2}-\d{2}/);
            await expect(firstCard).toContainText(/월|화|수|목|금|토|일/);
        });

        test("각 일지 카드에 식별자 Badge가 표시되어야 한다", async () => {
            const firstCard = dailyListPage.listCards.first();
            const badge = firstCard.locator("[role='badge'], .badge");
            await expect(badge.first()).toBeVisible();
        });

        test("각 일지 카드에 세션 수, 도구 호출 수, 프로젝트 수가 표시되어야 한다", async () => {
            const firstCard = dailyListPage.listCards.first();
            await expect(firstCard).toContainText(/세션/);
            await expect(firstCard).toContainText(/도구 호출/);
            await expect(firstCard).toContainText(/프로젝트/);
        });

        test("각 일지 카드에 주요 작업 유형 Badge가 표시되어야 한다", async () => {
            const firstCard = dailyListPage.listCards.first();
            await expect(firstCard).toContainText(/Coding|Refactoring|Planning/);
        });

        test("같은 날짜의 일지들이 날짜 헤딩으로 그룹핑되어야 한다", async () => {
            // 2026-02-08에 2개의 일지가 있음 (work, side)
            await dailyListPage.expectDateGrouping("2026-02-08");
            const dateHeadings = dailyListPage.dateHeadings;
            await expect(dateHeadings.first()).toBeVisible();
        });

        test("일지 카드 클릭 시 상세 페이지로 이동해야 한다", async ({ page }) => {
            await dailyListPage.clickListCard(0);
            await page.waitForURL(/\/daily\/.+/);
            expect(page.url()).toMatch(/\/daily\/.+/);
        });
    });

    test.describe("2-3. 달력 뷰", () => {
        test("뷰 전환 토글로 달력 뷰로 변경할 수 있어야 한다", async () => {
            await dailyListPage.switchToCalendarView();
            await dailyListPage.expectCalendarViewVisible();
        });

        test("달력 뷰에 월 네비게이션이 표시되어야 한다", async () => {
            await dailyListPage.switchToCalendarView();
            await expect(dailyListPage.monthNavigation).toBeVisible();
        });

        test("좌우 화살표로 월을 이동할 수 있어야 한다", async () => {
            await dailyListPage.switchToCalendarView();
            await expect(dailyListPage.prevMonthButton).toBeVisible();
            await expect(dailyListPage.nextMonthButton).toBeVisible();

            const currentMonth = await dailyListPage.currentMonth.textContent();
            await dailyListPage.navigateToNextMonth();
            const nextMonth = await dailyListPage.currentMonth.textContent();

            expect(currentMonth).not.toBe(nextMonth);
        });

        test("달력 그리드에 일~토 요일이 표시되어야 한다", async () => {
            await dailyListPage.switchToCalendarView();
            const grid = dailyListPage.calendarGrid;
            await expect(grid).toContainText(/일|월|화|수|목|금|토/);
        });

        test("데이터가 있는 날짜에 하이라이트 표시가 되어야 한다", async () => {
            await dailyListPage.switchToCalendarView();
            await expect(dailyListPage.highlightedDates.first()).toBeVisible();
        });

        test("데이터가 있는 날짜에 일지 수가 표시되어야 한다", async () => {
            await dailyListPage.switchToCalendarView();
            const highlightedDate = dailyListPage.highlightedDates.first();
            await expect(highlightedDate).toContainText(/\d+/);
        });

        test("데이터가 있는 날짜 호버 시 툴팁이 표시되어야 한다", async ({ page }) => {
            await dailyListPage.switchToCalendarView();
            const highlightedDate = dailyListPage.highlightedDates.first();
            await highlightedDate.hover();

            const tooltip = page.locator("[role='tooltip'], .tooltip");
            await expect(tooltip).toBeVisible();
        });

        test("툴팁에 일지 수, 세션 수, 도구 호출 수가 표시되어야 한다", async ({ page }) => {
            await dailyListPage.switchToCalendarView();
            const highlightedDate = dailyListPage.highlightedDates.first();
            await highlightedDate.hover();

            const tooltip = page.locator("[role='tooltip'], .tooltip");
            await expect(tooltip).toContainText(/일지/);
            await expect(tooltip).toContainText(/세션/);
            await expect(tooltip).toContainText(/도구 호출/);
        });

        test("오늘 날짜에 테두리 강조가 되어야 한다", async () => {
            await dailyListPage.switchToCalendarView();
            await dailyListPage.expectTodayHighlighted();
        });

        test("일지가 1개인 날짜 클릭 시 해당 일지 상세 페이지로 이동해야 한다", async ({ page }) => {
            await dailyListPage.switchToCalendarView();

            // 2026-02-09는 일지가 1개만 있음
            await dailyListPage.clickDateInCalendar("2026-02-09");
            await page.waitForURL(/\/daily\/.+/);
            expect(page.url()).toContain("/daily/work/2026-02-09");
        });

        test("일지가 여러 개인 날짜 클릭 시 일지 목록 팝오버가 표시되어야 한다", async ({ page }) => {
            await dailyListPage.switchToCalendarView();

            // 2026-02-08은 일지가 2개 있음 (work, side)
            await dailyListPage.clickDateInCalendar("2026-02-08");

            const popover = page.locator("[role='dialog'], .popover");
            await expect(popover).toBeVisible();
        });

        test("팝오버에서 개별 일지 클릭 시 상세 페이지로 이동해야 한다", async ({ page }) => {
            await dailyListPage.switchToCalendarView();

            await dailyListPage.clickDateInCalendar("2026-02-08");

            const popover = page.locator("[role='dialog'], .popover");
            const firstItem = popover.locator("a, button").first();
            await firstItem.click();

            await page.waitForURL(/\/daily\/.+/);
            expect(page.url()).toMatch(/\/daily\/(work|side)\/2026-02-08/);
        });
    });

    test.describe("2-4. 로딩 및 에러 상태", () => {
        test("리스트 뷰 로딩 중 Skeleton 카드가 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/index.json", async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                });
            });

            const loadingPage = new DailyListPage(newPage);
            await loadingPage.navigateToDailyList();
            await loadingPage.expectLoadingState();

            await newPage.close();
        });

        test("달력 뷰 로딩 중 Skeleton 그리드가 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/**/*.md", async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await route.abort();
            });

            await newPage.goto("/daily");
            const skeleton = newPage.locator(".skeleton, [aria-busy='true']");
            await expect(skeleton.first()).toBeVisible();

            await newPage.close();
        });

        test("데이터가 없을 때 빈 상태 메시지가 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_EMPTY_INDEX_JSON)
                })
            );

            const emptyPage = new DailyListPage(newPage);
            await emptyPage.navigateToDailyList();
            await emptyPage.expectEmptyState();

            await newPage.close();
        });
    });
});
