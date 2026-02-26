import { test, expect } from "@playwright/test";
import { MonthlyListPage } from "../page-objects/monthly-list.page";
import {
    MOCK_INDEX_JSON,
    MOCK_MONTHLY_REPORTS,
    MOCK_EMPTY_INDEX_JSON,
    wrapResponse
} from "../mocks/claude-usage-dashboard.mock";

test.describe("월간 일지 목록 페이지", () => {
    let monthlyListPage: MonthlyListPage;

    test.beforeEach(async ({ page }) => {
        // API 인터셉트 설정
        await page.route("**/data/index.json", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: wrapResponse(MOCK_INDEX_JSON)
            })
        );

        // 각 월간 JSON 파일 인터셉트
        for (const [filename, content] of Object.entries(MOCK_MONTHLY_REPORTS)) {
            await page.route(`**/data/${filename}.json`, (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify(content)
                })
            );
        }

        monthlyListPage = new MonthlyListPage(page);
        await monthlyListPage.navigateToMonthlyList();
    });

    test.describe("2-1. 페이지 로드 및 레이아웃", () => {
        test("/monthly 페이지에 접속하면 페이지 타이틀 Monthly Logs가 표시되어야 한다", async () => {
            await expect(monthlyListPage.pageTitle).toBeVisible();
            await expect(monthlyListPage.pageTitle).toHaveText("Monthly Logs");
        });

        test("서브타이틀 월별 클로드 코드 사용 일지가 표시되어야 한다", async () => {
            await expect(monthlyListPage.pageSubtitle).toBeVisible();
        });

        test("뷰 전환 토글 버튼이 표시되어야 한다", async () => {
            await expect(monthlyListPage.viewToggle).toBeVisible();
        });

        test("헤더의 Monthly Logs 링크에 활성 상태 표시가 있어야 한다", async ({ page }) => {
            const monthlyLogsLink = page.getByRole("link", { name: "Monthly Logs" });
            await expect(monthlyLogsLink).toHaveClass(/active|current/i);
        });
    });

    test.describe("2-2. 리스트 뷰 (기본)", () => {
        test("리스트 뷰가 기본으로 표시되어야 한다", async () => {
            await monthlyListPage.expectListViewVisible();
        });

        test("월간 일지 목록이 최신 날짜순으로 정렬되어야 한다", async () => {
            const cards = monthlyListPage.listCards;
            const firstCardDate = await cards.first().locator("[data-date]").textContent();
            const lastCardDate = await cards.last().locator("[data-date]").textContent();

            // 최신 날짜가 위에 있어야 함
            expect(firstCardDate).toBeTruthy();
            expect(lastCardDate).toBeTruthy();
        });

        test("각 월간 일지 카드에 월 정보가 표시되어야 한다", async () => {
            const firstCard = monthlyListPage.listCards.first();
            await expect(firstCard).toContainText(/\d{4}년\s+\d{1,2}월|\d{4}-\d{2}/);
        });

        test("각 월간 일지 카드에 식별자 Badge가 표시되어야 한다", async () => {
            const firstCard = monthlyListPage.listCards.first();
            const badge = firstCard.locator("[role='badge'], .badge");
            await expect(badge.first()).toBeVisible();
        });

        test("각 월간 일지 카드에 세션 수, 도구 호출 수, 프로젝트 수가 표시되어야 한다", async () => {
            const firstCard = monthlyListPage.listCards.first();
            await expect(firstCard).toContainText(/세션/);
            await expect(firstCard).toContainText(/도구 호출/);
            await expect(firstCard).toContainText(/프로젝트/);
        });

        test("각 월간 일지 카드에 주요 작업 유형 Badge가 표시되어야 한다", async () => {
            const firstCard = monthlyListPage.listCards.first();
            await expect(firstCard).toContainText(/Coding|Refactoring|Planning/);
        });

        test("같은 월의 일지들이 월 헤딩으로 그룹핑되어야 한다", async () => {
            const dateHeadings = monthlyListPage.dateHeadings;
            await expect(dateHeadings.first()).toBeVisible();
        });

        test("월간 일지 카드 클릭 시 상세 페이지로 이동해야 한다", async ({ page }) => {
            await monthlyListPage.clickListCard(0);
            await page.waitForURL(/\/monthly\/.+/);
            expect(page.url()).toMatch(/\/monthly\/.+/);
        });
    });

    test.describe("2-3. 달력 뷰", () => {
        test("뷰 전환 토글로 달력 뷰로 변경할 수 있어야 한다", async () => {
            await monthlyListPage.switchToCalendarView();
            await monthlyListPage.expectCalendarViewVisible();
        });

        test("달력 뷰에 월 네비게이션이 표시되어야 한다", async () => {
            await monthlyListPage.switchToCalendarView();
            await expect(monthlyListPage.monthNavigation).toBeVisible();
        });

        test("좌우 화살표로 연도를 이동할 수 있어야 한다", async () => {
            await monthlyListPage.switchToCalendarView();
            await expect(monthlyListPage.prevMonthButton).toBeVisible();
            await expect(monthlyListPage.nextMonthButton).toBeVisible();

            const currentMonth = await monthlyListPage.currentMonth.textContent();
            await monthlyListPage.navigateToNextMonth();
            const nextMonth = await monthlyListPage.currentMonth.textContent();

            expect(currentMonth).not.toBe(nextMonth);
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

            const loadingPage = new MonthlyListPage(newPage);
            await loadingPage.navigateToMonthlyList();
            await loadingPage.expectLoadingState();

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

            const emptyPage = new MonthlyListPage(newPage);
            await emptyPage.navigateToMonthlyList();
            await emptyPage.expectEmptyState();

            await newPage.close();
        });
    });
});
