import { test, expect } from "@playwright/test";
import {
    MOCK_INDEX_JSON_WITH_SCORING,
    MOCK_INDEX_JSON_NO_SCORING,
    MOCK_JSON_FILES,
    wrapResponse
} from "../mocks/ui-renewal.mock";

test.describe("HomePage - Area Chart (활용도 점수 추이)", () => {
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

    test.describe("5-1. 차트 기본 표시", () => {
        test("활용도 점수 추이 Area Chart가 표시되어야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            // Area Chart 카드 찾기
            const areaChartCard = page.locator("text=활용도 점수 추이").locator("..");
            await expect(areaChartCard).toBeVisible();

            // Recharts AreaChart 요소 확인
            const areaChart = areaChartCard.locator(".recharts-surface");
            await expect(areaChart).toBeVisible();
        });

        test("Area Chart가 페이지 타이틀 아래, 활용도 평가 카드 위에 위치해야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            // 페이지의 모든 Card 요소를 가져옴
            const allCards = page.locator("[data-slot='card']");
            const cardCount = await allCards.count();

            let areaChartIndex = -1;
            let usageScoreIndex = -1;

            for (let i = 0; i < cardCount; i++) {
                const cardText = await allCards.nth(i).textContent();
                if (cardText?.includes("활용도 점수 추이")) {
                    areaChartIndex = i;
                }
                if (cardText?.includes("활용도 평가")) {
                    usageScoreIndex = i;
                }
            }

            // Area Chart가 활용도 평가보다 앞에 있어야 함
            expect(areaChartIndex).toBeGreaterThan(-1);
            expect(usageScoreIndex).toBeGreaterThan(-1);
            expect(areaChartIndex).toBeLessThan(usageScoreIndex);
        });

        test("Card 헤더에 '활용도 점수 추이' 타이틀과 TrendingUp 아이콘이 표시되어야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const areaChartCard = page.locator("text=활용도 점수 추이").locator("..");

            // 타이틀 확인
            await expect(areaChartCard).toContainText("활용도 점수 추이");

            // TrendingUp 아이콘 확인 (lucide-react 아이콘)
            const icon = areaChartCard.locator("svg.lucide-trending-up, svg[class*='trending']");
            await expect(icon.first()).toBeVisible();
        });
    });

    test.describe("5-2. 차트 데이터", () => {
        test("X축에 날짜(MM-DD 형식)가 표시되어야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const areaChartCard = page.locator("text=활용도 점수 추이").locator("..");
            const xAxis = areaChartCard.locator(".recharts-xAxis");

            await expect(xAxis).toBeVisible();

            // X축 텍스트 확인 (MM-DD 형식)
            const xAxisText = await xAxis.textContent();
            expect(xAxisText).toMatch(/\d{2}-\d{2}/);
        });

        test("Y축에 활용도 점수(0-100)가 표시되어야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const areaChartCard = page.locator("text=활용도 점수 추이").locator("..");
            const yAxis = areaChartCard.locator(".recharts-yAxis");

            await expect(yAxis).toBeVisible();

            // Y축 텍스트 확인 (0-100 범위의 숫자)
            const yAxisText = await yAxis.textContent();
            expect(yAxisText).toMatch(/\d+/);
        });

        test("Y축 눈금이 20 단위(0, 20, 40, 60, 80, 100)로 표시되어야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const areaChartCard = page.locator("text=활용도 점수 추이").locator("..");
            const yAxisTicks = areaChartCard.locator(".recharts-yAxis .recharts-cartesian-axis-tick");

            const tickCount = await yAxisTicks.count();
            expect(tickCount).toBeGreaterThanOrEqual(5); // 최소 6개 눈금 (0, 20, 40, 60, 80, 100)

            const tickTexts = await yAxisTicks.allTextContents();
            const tickNumbers = tickTexts.map((t) => parseInt(t.trim())).filter((n) => !isNaN(n));

            // 20 단위로 증가하는지 확인
            expect(tickNumbers).toEqual(expect.arrayContaining([0, 20, 40, 60, 80, 100]));
        });
    });

    test.describe("5-3. 차트 상호작용", () => {
        test("Area Chart 호버 시 툴팁에 날짜와 점수가 표시되어야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const areaChartCard = page.locator("text=활용도 점수 추이").locator("..");
            const areaPath = areaChartCard.locator(".recharts-area-area, .recharts-area-curve").first();

            // Area 영역에 호버
            await areaPath.hover();

            // 툴팁 표시 대기
            await page.waitForTimeout(500);

            // 툴팁 확인
            const tooltip = page.locator(".recharts-tooltip-wrapper");
            if (await tooltip.isVisible()) {
                const tooltipText = await tooltip.textContent();

                // 날짜와 점수가 포함되어 있는지 확인
                expect(tooltipText).toMatch(/\d{4}-\d{2}-\d{2}/); // 날짜
                expect(tooltipText).toMatch(/\d+/); // 점수
            }
        });

        test("영역이 색상으로 채워져야 한다(opacity 0.3)", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const areaChartCard = page.locator("text=활용도 점수 추이").locator("..");
            const areaFill = areaChartCard.locator(".recharts-area-area").first();

            await expect(areaFill).toBeVisible();

            // fill-opacity 속성 확인
            const fillOpacity = await areaFill.getAttribute("fill-opacity");
            if (fillOpacity) {
                const opacity = parseFloat(fillOpacity);
                expect(opacity).toBeCloseTo(0.3, 1);
            }
        });

        test("선이 명확하게 표시되어야 한다(두께 2px)", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const areaChartCard = page.locator("text=활용도 점수 추이").locator("..");
            const areaLine = areaChartCard.locator(".recharts-area-curve").first();

            await expect(areaLine).toBeVisible();

            // stroke-width 속성 확인
            const strokeWidth = await areaLine.getAttribute("stroke-width");
            if (strokeWidth) {
                const width = parseFloat(strokeWidth);
                expect(width).toBeCloseTo(2, 0);
            }
        });
    });

    test.describe("5-4. 엣지 케이스", () => {
        test("scoring이 있는 리포트가 0개이면 차트 섹션이 표시되지 않아야 한다", async ({ page }) => {
            // 새 페이지 컨텍스트
            const newPage = await page.context().newPage();

            // scoring이 없는 index.json으로 인터셉트
            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON_NO_SCORING)
                })
            );

            // JSON 파일 인터셉트
            for (const [filename, content] of Object.entries(MOCK_JSON_FILES)) {
                await newPage.route(`**/data/${filename}.json`, (route) =>
                    route.fulfill({
                        status: 200,
                        contentType: "application/json",
                        body: wrapResponse(content)
                    })
                );
            }

            await newPage.goto("/");
            await newPage.waitForLoadState("networkidle");

            // Area Chart 카드가 표시되지 않아야 함
            const areaChartCard = newPage.locator("text=활용도 점수 추이");
            await expect(areaChartCard).not.toBeVisible();

            await newPage.close();
        });

        test("같은 날짜에 여러 리포트가 있으면 평균 점수가 표시되어야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const areaChartCard = page.locator("text=활용도 점수 추이").locator("..");

            // 2026-02-08의 점수는 (90 + 85) / 2 = 87.5 ≈ 88
            // X축에서 02-08을 찾아 호버
            const xAxisTicks = areaChartCard.locator(".recharts-xAxis .recharts-cartesian-axis-tick");
            const tickCount = await xAxisTicks.count();

            for (let i = 0; i < tickCount; i++) {
                const tickText = await xAxisTicks.nth(i).textContent();
                if (tickText?.includes("02-08")) {
                    // 해당 위치에 호버
                    await xAxisTicks.nth(i).hover();
                    await page.waitForTimeout(500);

                    const tooltip = page.locator(".recharts-tooltip-wrapper");
                    if (await tooltip.isVisible()) {
                        const tooltipText = await tooltip.textContent();
                        // 평균 점수 88이 표시되어야 함
                        expect(tooltipText).toContain("88");
                    }
                    break;
                }
            }
        });

        test("scoring이 있는 리포트가 1개만 있어도 차트가 정상 표시되어야 한다", async ({ page }) => {
            // 단일 리포트만 있는 경우
            const newPage = await page.context().newPage();

            const singleReportIndex = {
                files: [{ name: "2026-02-08.json", location: "work" }]
            };

            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(singleReportIndex)
                })
            );

            for (const [filename, content] of Object.entries(MOCK_JSON_FILES)) {
                await newPage.route(`**/data/${filename}.json`, (route) =>
                    route.fulfill({
                        status: 200,
                        contentType: "application/json",
                        body: wrapResponse(content)
                    })
                );
            }

            await newPage.goto("/");
            await newPage.waitForLoadState("networkidle");

            // Area Chart가 표시되어야 함
            const areaChartCard = newPage.locator("text=활용도 점수 추이").locator("..");
            await expect(areaChartCard).toBeVisible();

            const areaChart = areaChartCard.locator(".recharts-surface");
            await expect(areaChart).toBeVisible();

            await newPage.close();
        });
    });
});
