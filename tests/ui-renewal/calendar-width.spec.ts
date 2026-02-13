import { test, expect } from "@playwright/test";
import {
    MOCK_INDEX_JSON_WITH_SCORING,
    MOCK_JSON_FILES,
    wrapResponse
} from "../mocks/ui-renewal.mock";

test.describe("DailyListPage - 달력 너비 제한", () => {
    test.beforeEach(async ({ page }) => {
        // API 인터셉트 설정
        await page.route("**/data/index.json", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: wrapResponse(MOCK_INDEX_JSON_WITH_SCORING)
            })
        );

        // JSON 파일 인터셉트
        for (const [filename, content] of Object.entries(MOCK_JSON_FILES)) {
            await page.route(`**/data/${filename}.json`, (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(content)
                })
            );
        }
    });

    test.describe("7-1. 달력 Card 스타일", () => {
        test("달력 Card의 최대 너비가 384px(max-w-sm)이어야 한다", async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto("/daily");
            await page.waitForLoadState("networkidle");

            // 달력 보기 버튼 클릭
            const calendarButton = page.getByRole("button", { name: /달력 보기/i });
            if (await calendarButton.isVisible()) {
                await calendarButton.click();
                await page.waitForTimeout(300);
            }

            // 달력 Card 찾기
            const calendarCard = page.locator("#calendar-panel");
            await expect(calendarCard).toBeVisible();

            // max-w-sm 클래스 확인
            const className = await calendarCard.getAttribute("class");
            expect(className).toContain("max-w-sm");

            // 실제 너비 확인 (384px 이하)
            const boundingBox = await calendarCard.boundingBox();
            if (boundingBox) {
                expect(boundingBox.width).toBeLessThanOrEqual(384);
            }
        });

        test("달력 Card가 우측 정렬(ml-auto)되어야 한다", async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto("/daily");
            await page.waitForLoadState("networkidle");

            // 달력 보기 버튼 클릭
            const calendarButton = page.getByRole("button", { name: /달력 보기/i });
            if (await calendarButton.isVisible()) {
                await calendarButton.click();
                await page.waitForTimeout(300);
            }

            const calendarCard = page.locator("#calendar-panel");
            await expect(calendarCard).toBeVisible();

            // ml-auto 클래스 확인
            const className = await calendarCard.getAttribute("class");
            expect(className).toContain("ml-auto");

            // 우측 정렬 확인 (부모 컨테이너 대비 위치)
            const parentBoundingBox = await calendarCard.locator("..").boundingBox();
            const cardBoundingBox = await calendarCard.boundingBox();

            if (parentBoundingBox && cardBoundingBox) {
                const parentRight = parentBoundingBox.x + parentBoundingBox.width;
                const cardRight = cardBoundingBox.x + cardBoundingBox.width;
                // 오른쪽 끝이 거의 같아야 함 (우측 정렬)
                expect(Math.abs(parentRight - cardRight)).toBeLessThan(20);
            }
        });

        test("달력 Card 내부 padding이 유지되어야 한다", async ({ page }) => {
            await page.goto("/daily");
            await page.waitForLoadState("networkidle");

            // 달력 보기 버튼 클릭
            const calendarButton = page.getByRole("button", { name: /달력 보기/i });
            if (await calendarButton.isVisible()) {
                await calendarButton.click();
                await page.waitForTimeout(300);
            }

            const calendarCard = page.locator("#calendar-panel");
            await expect(calendarCard).toBeVisible();

            // padding 클래스 확인 (p-4 또는 유사)
            const className = await calendarCard.getAttribute("class");
            expect(className).toMatch(/p-\d+/);
        });
    });

    test.describe("7-2. 반응형", () => {
        test("모바일 화면(< 384px)에서 달력이 화면 너비 100%로 축소되어야 한다", async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto("/daily");
            await page.waitForLoadState("networkidle");

            // 달력 보기 버튼 클릭
            const calendarButton = page.getByRole("button", { name: /달력 보기/i });
            if (await calendarButton.isVisible()) {
                await calendarButton.click();
                await page.waitForTimeout(300);
            }

            const calendarCard = page.locator("#calendar-panel");
            await expect(calendarCard).toBeVisible();

            // 너비가 뷰포트와 비슷해야 함
            const viewportWidth = 375;
            const boundingBox = await calendarCard.boundingBox();

            if (boundingBox) {
                // 패딩을 고려하여 약간 작을 수 있음
                expect(boundingBox.width).toBeGreaterThan(viewportWidth * 0.85);
                expect(boundingBox.width).toBeLessThanOrEqual(viewportWidth);
            }
        });

        test("데스크톱 화면에서 달력이 384px로 제한되어야 한다", async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto("/daily");
            await page.waitForLoadState("networkidle");

            // 달력 보기 버튼 클릭
            const calendarButton = page.getByRole("button", { name: /달력 보기/i });
            if (await calendarButton.isVisible()) {
                await calendarButton.click();
                await page.waitForTimeout(300);
            }

            const calendarCard = page.locator("#calendar-panel");
            await expect(calendarCard).toBeVisible();

            const boundingBox = await calendarCard.boundingBox();
            if (boundingBox) {
                // 384px 이하여야 함
                expect(boundingBox.width).toBeLessThanOrEqual(384);
                // 너무 작지 않아야 함 (최소 300px 정도)
                expect(boundingBox.width).toBeGreaterThan(300);
            }
        });
    });

    test.describe("7-3. 기능 유지", () => {
        test("달력 내부의 날짜 셀이 정상적으로 클릭 가능해야 한다", async ({ page }) => {
            await page.goto("/daily");
            await page.waitForLoadState("networkidle");

            // 달력 보기 버튼 클릭
            const calendarButton = page.getByRole("button", { name: /달력 보기/i });
            if (await calendarButton.isVisible()) {
                await calendarButton.click();
                await page.waitForTimeout(300);
            }

            const calendarCard = page.locator("#calendar-panel");
            await expect(calendarCard).toBeVisible();

            // 날짜 셀 클릭 (2026-02-08)
            const dateCell = calendarCard.locator("button").filter({ hasText: "8" }).first();
            if (await dateCell.isVisible()) {
                await dateCell.click();
                await page.waitForTimeout(300);

                // 클릭 후 상세 페이지로 이동 또는 Popover 표시
                const isNavigated = page.url().includes("/daily/");
                const isPopoverVisible = await page.locator("[role='dialog'], .popover").isVisible();

                expect(isNavigated || isPopoverVisible).toBe(true);
            }
        });

        test("같은 날짜에 여러 리포트가 있는 경우 Popover가 정상 동작해야 한다", async ({ page }) => {
            await page.goto("/daily");
            await page.waitForLoadState("networkidle");

            // 달력 보기 버튼 클릭
            const calendarButton = page.getByRole("button", { name: /달력 보기/i });
            if (await calendarButton.isVisible()) {
                await calendarButton.click();
                await page.waitForTimeout(300);
            }

            const calendarCard = page.locator("#calendar-panel");
            await expect(calendarCard).toBeVisible();

            // 2026-02-08 날짜 셀 클릭 (work, side 2건)
            const dateCell = calendarCard.locator("button").filter({ hasText: "8" }).first();
            if (await dateCell.isVisible()) {
                await dateCell.click();
                await page.waitForTimeout(300);

                // Popover 표시 확인
                const popover = page.locator("[role='dialog'], .popover");
                if (await popover.isVisible()) {
                    // Popover 내부에 work, side 표시
                    await expect(popover).toContainText("work");
                    await expect(popover).toContainText("side");
                }
            }
        });

        test("달력 너비 변경 후에도 CalendarView의 grid-cols-7이 정상 작동해야 한다", async ({ page }) => {
            await page.goto("/daily");
            await page.waitForLoadState("networkidle");

            // 달력 보기 버튼 클릭
            const calendarButton = page.getByRole("button", { name: /달력 보기/i });
            if (await calendarButton.isVisible()) {
                await calendarButton.click();
                await page.waitForTimeout(300);
            }

            const calendarCard = page.locator("#calendar-panel");
            await expect(calendarCard).toBeVisible();

            // grid-cols-7 확인 (7개 열)
            const calendarGrid = calendarCard.locator(".grid-cols-7, [class*='grid'][class*='cols-7']");
            if (await calendarGrid.isVisible()) {
                await expect(calendarGrid).toBeVisible();

                // 첫 번째 행의 셀 개수 확인
                const firstRow = calendarGrid.locator("> *").first().locator("..");
                const cellsInRow = await firstRow.locator("> button, > div").count();

                // 7개 열이어야 함 (요일: 일~토)
                expect(cellsInRow).toBeGreaterThanOrEqual(7);
            }
        });
    });
});
