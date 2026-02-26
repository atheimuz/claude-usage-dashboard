import { test, expect } from "@playwright/test";
import { WeeklyListPage } from "../page-objects/weekly-list.page";
import {
    MOCK_INDEX_JSON,
    MOCK_MARKDOWN_FILES,
    MOCK_EMPTY_INDEX_JSON,
    wrapResponse
} from "../mocks/claude-usage-dashboard.mock";

test.describe("주간 일지 목록 페이지", () => {
    let weeklyListPage: WeeklyListPage;

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

        weeklyListPage = new WeeklyListPage(page);
        await weeklyListPage.navigateToWeeklyList();
    });

    test.describe("2-1. 페이지 로드 및 레이아웃", () => {
        test("/weekly 페이지에 접속하면 페이지 타이틀 Weekly Logs가 표시되어야 한다", async () => {
            await expect(weeklyListPage.pageTitle).toBeVisible();
            await expect(weeklyListPage.pageTitle).toHaveText("Weekly Logs");
        });

        test("서브타이틀 주간별 클로드 코드 사용 일지가 표시되어야 한다", async () => {
            await expect(weeklyListPage.pageSubtitle).toBeVisible();
        });

        test("뷰 전환 토글 버튼이 표시되어야 한다", async () => {
            await expect(weeklyListPage.viewToggle).toBeVisible();
        });

        test("헤더의 Weekly Logs 링크에 활성 상태 표시가 있어야 한다", async ({ page }) => {
            const weeklyLogsLink = page.getByRole("link", { name: "Weekly Logs" });
            await expect(weeklyLogsLink).toHaveClass(/active|current/i);
        });
    });

    test.describe("2-2. 리스트 뷰 (기본)", () => {
        test("리스트 뷰가 기본으로 표시되어야 한다", async () => {
            await weeklyListPage.expectListViewVisible();
        });

        test("주간 일지 목록이 최신 날짜순으로 정렬되어야 한다", async () => {
            const cards = weeklyListPage.listCards;
            const firstCardDate = await cards.first().locator("[data-date]").textContent();
            const lastCardDate = await cards.last().locator("[data-date]").textContent();

            // 최신 날짜가 위에 있어야 함
            expect(firstCardDate).toBeTruthy();
            expect(lastCardDate).toBeTruthy();
        });

        test("각 주간 일지 카드에 주차 정보가 표시되어야 한다", async () => {
            const firstCard = weeklyListPage.listCards.first();
            await expect(firstCard).toContainText(/\d{4}년.*\d+주차|\d{4}-\d{2}-W\d+/);
        });

        test("각 주간 일지 카드에 식별자 Badge가 표시되어야 한다", async () => {
            const firstCard = weeklyListPage.listCards.first();
            const badge = firstCard.locator("[role='badge'], .badge");
            await expect(badge.first()).toBeVisible();
        });

        test("각 주간 일지 카드에 세션 수, 도구 호출 수, 프로젝트 수가 표시되어야 한다", async () => {
            const firstCard = weeklyListPage.listCards.first();
            await expect(firstCard).toContainText(/세션/);
            await expect(firstCard).toContainText(/도구 호출/);
            await expect(firstCard).toContainText(/프로젝트/);
        });

        test("각 주간 일지 카드에 주요 작업 유형 Badge가 표시되어야 한다", async () => {
            const firstCard = weeklyListPage.listCards.first();
            await expect(firstCard).toContainText(/Coding|Refactoring|Planning/);
        });

        test("같은 주차의 일지들이 주차 헤딩으로 그룹핑되어야 한다", async () => {
            const dateHeadings = weeklyListPage.dateHeadings;
            await expect(dateHeadings.first()).toBeVisible();
        });

        test("주간 일지 카드 클릭 시 상세 페이지로 이동해야 한다", async ({ page }) => {
            await weeklyListPage.clickListCard(0);
            await page.waitForURL(/\/weekly\/.+/);
            expect(page.url()).toMatch(/\/weekly\/.+/);
        });
    });

    test.describe("2-3. 달력 뷰", () => {
        test("뷰 전환 토글로 달력 뷰로 변경할 수 있어야 한다", async () => {
            await weeklyListPage.switchToCalendarView();
            await weeklyListPage.expectCalendarViewVisible();
        });

        test("달력 뷰에 월 네비게이션이 표시되어야 한다", async () => {
            await weeklyListPage.switchToCalendarView();
            await expect(weeklyListPage.monthNavigation).toBeVisible();
        });

        test("좌우 화살표로 월을 이동할 수 있어야 한다", async () => {
            await weeklyListPage.switchToCalendarView();
            await expect(weeklyListPage.prevMonthButton).toBeVisible();
            await expect(weeklyListPage.nextMonthButton).toBeVisible();

            const currentMonth = await weeklyListPage.currentMonth.textContent();
            await weeklyListPage.navigateToNextMonth();
            const nextMonth = await weeklyListPage.currentMonth.textContent();

            expect(currentMonth).not.toBe(nextMonth);
        });

        test("달력 그리드에 일~토 요일이 표시되어야 한다", async () => {
            await weeklyListPage.switchToCalendarView();
            const grid = weeklyListPage.calendarGrid;
            await expect(grid).toContainText(/일|월|화|수|목|금|토/);
        });

        test("데이터가 있는 날짜에 하이라이트 표시가 되어야 한다", async () => {
            await weeklyListPage.switchToCalendarView();
            await expect(weeklyListPage.highlightedDates.first()).toBeVisible();
        });

        test("데이터가 있는 날짜에 일지 수가 표시되어야 한다", async () => {
            await weeklyListPage.switchToCalendarView();
            const highlightedDate = weeklyListPage.highlightedDates.first();
            await expect(highlightedDate).toContainText(/\d+/);
        });

        test("데이터가 있는 날짜 호버 시 툴팁이 표시되어야 한다", async ({ page }) => {
            await weeklyListPage.switchToCalendarView();
            const highlightedDate = weeklyListPage.highlightedDates.first();
            await highlightedDate.hover();

            const tooltip = page.locator("[role='tooltip'], .tooltip");
            await expect(tooltip).toBeVisible();
        });

        test("툴팁에 일지 수, 세션 수, 도구 호출 수가 표시되어야 한다", async ({ page }) => {
            await weeklyListPage.switchToCalendarView();
            const highlightedDate = weeklyListPage.highlightedDates.first();
            await highlightedDate.hover();

            const tooltip = page.locator("[role='tooltip'], .tooltip");
            await expect(tooltip).toContainText(/일지/);
            await expect(tooltip).toContainText(/세션/);
            await expect(tooltip).toContainText(/도구 호출/);
        });

        test("오늘 날짜에 테두리 강조가 되어야 한다", async () => {
            await weeklyListPage.switchToCalendarView();
            await weeklyListPage.expectTodayHighlighted();
        });

        test("일지가 1개인 날짜 클릭 시 해당 주간 일지 상세 페이지로 이동해야 한다", async ({ page }) => {
            await weeklyListPage.switchToCalendarView();

            // 2026-02-09는 일지가 1개만 있음
            await weeklyListPage.clickDateInCalendar("2026-02-09");
            await page.waitForURL(/\/weekly\/.+/);
            expect(page.url()).toContain("/weekly/work/2026-02-09");
        });

        test("일지가 여러 개인 날짜 클릭 시 일지 목록 팝오버가 표시되어야 한다", async ({ page }) => {
            await weeklyListPage.switchToCalendarView();

            // 2026-02-08은 일지가 2개 있음 (work, side)
            await weeklyListPage.clickDateInCalendar("2026-02-08");

            const popover = page.locator("[role='dialog'], .popover");
            await expect(popover).toBeVisible();
        });

        test("팝오버에서 개별 일지 클릭 시 상세 페이지로 이동해야 한다", async ({ page }) => {
            await weeklyListPage.switchToCalendarView();

            await weeklyListPage.clickDateInCalendar("2026-02-08");

            const popover = page.locator("[role='dialog'], .popover");
            const firstItem = popover.locator("a, button").first();
            await firstItem.click();

            await page.waitForURL(/\/weekly\/.+/);
            expect(page.url()).toMatch(/\/weekly\/(work|side)\/2026-02-08/);
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

            const loadingPage = new WeeklyListPage(newPage);
            await loadingPage.navigateToWeeklyList();
            await loadingPage.expectLoadingState();

            await newPage.close();
        });

        test("달력 뷰 로딩 중 Skeleton 그리드가 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/**/*.md", async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await route.abort();
            });

            await newPage.goto("/weekly");
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

            const emptyPage = new WeeklyListPage(newPage);
            await emptyPage.navigateToWeeklyList();
            await emptyPage.expectEmptyState();

            await newPage.close();
        });
    });
});
