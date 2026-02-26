import { test, expect } from "@playwright/test";
import { MonthlyDetailPage } from "../page-objects/monthly-detail.page";
import {
    MOCK_INDEX_JSON,
    MOCK_MONTHLY_REPORTS,
    wrapResponse
} from "../mocks/claude-usage-dashboard.mock";

test.describe("월간 일지 상세 페이지 - 사용자 시나리오", () => {
    let monthlyDetailPage: MonthlyDetailPage;

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

        monthlyDetailPage = new MonthlyDetailPage(page);
    });

    test("사용자가 특정 월간 일지를 열어 기본 정보를 확인할 수 있다", async () => {
        // Given - 월간 일지 상세 페이지에 접속하면
        await monthlyDetailPage.navigateToMonthlyDetail("work/2026-02");

        // Then - 날짜, 식별자가 모두 표시됨
        await expect(monthlyDetailPage.dateTitle).toBeVisible();
        await expect(monthlyDetailPage.dateTitle).toContainText(/\d{4}년\s+\d{1,2}월/);
        await expect(monthlyDetailPage.identifierBadge).toContainText("work");
    });

    test("사용자가 월간 일지 상세에서 전체 활동 통계를 확인할 수 있다", async () => {
        // Given - 월간 일지 상세 페이지에서
        await monthlyDetailPage.navigateToMonthlyDetail("work/2026-02");

        // Then - 핵심 통계가 정확한 값과 함께 표시됨
        await expect(monthlyDetailPage.totalSessionsCard).toContainText("102");
    });

    test.describe("네비게이션", () => {
        test("사용자가 월간 일지 목록으로 돌아갈 수 있다", async ({ page }) => {
            // Given - 월간 일지 상세 페이지에서
            await monthlyDetailPage.navigateToMonthlyDetail("work/2026-02");
            await expect(monthlyDetailPage.backToListLink).toBeVisible();

            // When - 목록 링크를 클릭하면
            await monthlyDetailPage.clickBackToList();

            // Then - 월간 일지 목록 페이지로 이동함
            await page.waitForURL("/monthly");
            expect(page.url()).toContain("/monthly");
        });

        test("사용자가 이전/다음 월간 일지로 이동할 수 있다", async ({ page }) => {
            // Given - 중간 월간 일지에서
            await monthlyDetailPage.navigateToMonthlyDetail("side/2026-02");
            await monthlyDetailPage.expectNavigationButtonsVisible();

            // When - 이전 버튼을 클릭하면
            await monthlyDetailPage.clickPrevMonthly();

            // Then - 이전 월간 일지로 이동함
            await page.waitForURL(/\/monthly\/work\/2026-02/);
            expect(page.url()).toContain("work/2026-02");
        });

        test("첫 번째 월간 일지에서는 이전 버튼이 비활성화된다", async () => {
            // Given - 첫 번째 월간 일지에서
            await monthlyDetailPage.navigateToMonthlyDetail("work/2026-02");

            // Then - 이전 버튼이 비활성화됨
            await monthlyDetailPage.expectPrevButtonDisabled();
        });

        test("마지막 월간 일지에서는 다음 버튼이 비활성화된다", async () => {
            // Given - 마지막 월간 일지에서
            await monthlyDetailPage.navigateToMonthlyDetail("work/2026-01");

            // Then - 다음 버튼이 비활성화됨
            await monthlyDetailPage.expectNextButtonDisabled();
        });
    });

    test.describe("로딩 및 에러 상태", () => {
        test("데이터 로딩 중에는 스켈레톤이 표시된다", async ({ page }) => {
            // Given - 데이터 로딩이 지연되는 상황에서
            const newPage = await page.context().newPage();
            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                })
            );
            await newPage.route("**/data/work/2026-02.json", async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify(MOCK_MONTHLY_REPORTS["work/2026-02"])
                });
            });

            // When - 월간 일지 상세 페이지에 접속하면
            const loadingPage = new MonthlyDetailPage(newPage);
            await loadingPage.navigateToMonthlyDetail("work/2026-02");

            // Then - 로딩 스켈레톤이 표시됨
            await loadingPage.expectLoadingState();

            await newPage.close();
        });

        test("파일을 불러올 수 없을 때 에러가 표시된다", async ({ page }) => {
            // Given - 파일 로드가 실패하는 상황에서
            const newPage = await page.context().newPage();
            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                })
            );
            await newPage.route("**/data/work/2026-02.json", (route) => route.abort("failed"));

            // When - 월간 일지 상세 페이지에 접속하면
            const errorPage = new MonthlyDetailPage(newPage);
            await errorPage.navigateToMonthlyDetail("work/2026-02");

            // Then - 에러 Alert이 표시됨
            await errorPage.expectErrorState();

            await newPage.close();
        });

        test("존재하지 않는 월간 일지 접근 시 404 메시지와 목록 링크가 표시된다", async ({ page }) => {
            // Given - 존재하지 않는 월간 일지에 접근하면
            const newPage = await page.context().newPage();
            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                })
            );
            await newPage.route("**/data/unknown/invalid.json", (route) =>
                route.fulfill({ status: 404 })
            );

            // When - 월간 일지 상세 페이지에 접속하면
            const notFoundPage = new MonthlyDetailPage(newPage);
            await notFoundPage.navigateToMonthlyDetail("unknown/invalid");

            // Then - 404 메시지와 목록 링크가 표시됨
            await notFoundPage.expectNotFoundState();
            await expect(newPage.getByRole("link", { name: /목록/i })).toBeVisible();

            await newPage.close();
        });
    });
});
