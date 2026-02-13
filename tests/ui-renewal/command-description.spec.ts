import { test, expect } from "@playwright/test";
import {
    MOCK_INDEX_JSON_WITH_SCORING,
    MOCK_JSON_FILES,
    wrapResponse
} from "../mocks/ui-renewal.mock";

test.describe("DailyDetailPage - 커맨드 description 열 표시", () => {
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

    test.describe("4-1. 테이블 구조", () => {
        test("커맨드 테이블 헤더에 '커맨드', '설명', '횟수' 3개 열이 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            // 커맨드 테이블 찾기
            const commandTable = page.locator("table").filter({ hasText: "/clear" });
            await expect(commandTable).toBeVisible();

            // 테이블 헤더 확인
            const tableHeader = commandTable.locator("thead");
            await expect(tableHeader).toContainText("커맨드");
            await expect(tableHeader).toContainText("설명");
            await expect(tableHeader).toContainText("횟수");
        });

        test("description이 있는 커맨드의 경우 설명 열에 텍스트가 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const commandTable = page.locator("table").filter({ hasText: "/clear" });

            // /clear 행 찾기
            const clearRow = commandTable.locator("tr").filter({ hasText: "/clear" });
            await expect(clearRow).toBeVisible();

            // description 확인
            await expect(clearRow).toContainText("대화 히스토리 초기화");
        });

        test("description이 없는 커맨드의 경우 설명 열이 빈 셀로 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const commandTable = page.locator("table").filter({ hasText: "/clear" });

            // /review 행 찾기 (description 없음)
            const reviewRow = commandTable.locator("tr").filter({ hasText: "/review" });
            await expect(reviewRow).toBeVisible();

            // description 셀이 비어있는지 확인
            const cells = await reviewRow.locator("td").all();
            expect(cells.length).toBe(3); // 커맨드, 설명, 횟수

            const descriptionCell = cells[1];
            const descriptionText = await descriptionCell.textContent();
            expect(descriptionText?.trim()).toBe("");
        });
    });

    test.describe("4-2. 스타일", () => {
        test("설명 열의 텍스트가 text-muted-foreground 스타일로 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const commandTable = page.locator("table").filter({ hasText: "/clear" });
            const clearRow = commandTable.locator("tr").filter({ hasText: "/clear" });

            // 설명 셀 찾기 (2번째 td)
            const descriptionCell = clearRow.locator("td").nth(1);

            // text-muted-foreground 클래스 확인
            const className = await descriptionCell.getAttribute("class");
            expect(className).toContain("text-muted-foreground");
        });

        test("커맨드명이 font-mono 스타일로 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const commandTable = page.locator("table").filter({ hasText: "/clear" });
            const clearRow = commandTable.locator("tr").filter({ hasText: "/clear" });

            // 커맨드 셀 찾기 (1번째 td)
            const commandCell = clearRow.locator("td").nth(0);

            // font-mono 클래스 확인
            const className = await commandCell.getAttribute("class");
            expect(className).toContain("font-mono");
        });

        test("설명 텍스트가 일반 폰트(mono 아님)로 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const commandTable = page.locator("table").filter({ hasText: "/clear" });
            const clearRow = commandTable.locator("tr").filter({ hasText: "/clear" });

            // 설명 셀 찾기
            const descriptionCell = clearRow.locator("td").nth(1);

            // font-mono 클래스가 없어야 함
            const className = await descriptionCell.getAttribute("class");
            expect(className).not.toContain("font-mono");
        });
    });

    test.describe("4-3. 하위 호환성", () => {
        test("description 필드가 없는 구버전 JSON에서도 테이블이 정상 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/side/2026-02-08");
            await page.waitForLoadState("networkidle");

            // 커맨드 테이블 찾기
            const commandTable = page.locator("table").filter({ hasText: "/clear" });

            // description이 없는 경우에도 테이블은 표시되어야 함
            await expect(commandTable).toBeVisible();
        });

        test("모든 커맨드에 description이 없으면 2열 테이블(커맨드/횟수)로 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/side/2026-02-08");
            await page.waitForLoadState("networkidle");

            const commandTable = page.locator("table").filter({ hasText: "/clear" });
            const tableHeader = commandTable.locator("thead");

            // "설명" 헤더가 없어야 함
            const headerText = await tableHeader.textContent();
            const hasDescriptionHeader = headerText?.includes("설명");

            // description이 하나도 없으면 2열 테이블
            if (!hasDescriptionHeader) {
                await expect(tableHeader).toContainText("커맨드");
                await expect(tableHeader).toContainText("횟수");
                await expect(tableHeader).not.toContainText("설명");

                // 헤더 셀 개수 확인
                const headerCells = await tableHeader.locator("th").count();
                expect(headerCells).toBe(2);
            } else {
                // description이 하나라도 있으면 3열 테이블
                await expect(tableHeader).toContainText("커맨드");
                await expect(tableHeader).toContainText("설명");
                await expect(tableHeader).toContainText("횟수");

                const headerCells = await tableHeader.locator("th").count();
                expect(headerCells).toBe(3);
            }
        });
    });
});
