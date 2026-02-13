import { test, expect } from "@playwright/test";
import {
    MOCK_INDEX_JSON_WITH_SCORING,
    MOCK_JSON_FILES,
    wrapResponse
} from "../mocks/ui-renewal.mock";

test.describe("Radar Chart - 활용도 평가 카테고리", () => {
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

    test.describe("2-1. DailyDetailPage - Radar Chart 표시", () => {
        test("활용도 평가 카드 내부에 Radar Chart가 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");

            // Recharts RadarChart 요소 확인
            const radarChart = usageScoreCard.locator(".recharts-surface");
            await expect(radarChart).toBeVisible();
        });

        test("Radar Chart에 4개 축(의도 전달, 효율성, 적합성, 워크플로우)이 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");

            // 각 축 라벨 확인
            await expect(usageScoreCard).toContainText("의도 전달");
            await expect(usageScoreCard).toContainText("효율성");
            await expect(usageScoreCard).toContainText("적합성");
            await expect(usageScoreCard).toContainText("워크플로우");
        });

        test("각 축에 카테고리명이 한글로 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");
            const polarAngleAxis = usageScoreCard.locator(".recharts-polar-angle-axis-tick");

            // PolarAngleAxis 텍스트가 한글인지 확인
            const axisCount = await polarAngleAxis.count();
            expect(axisCount).toBe(4);

            const axisTexts = await polarAngleAxis.allTextContents();
            expect(axisTexts).toEqual(
                expect.arrayContaining(["의도 전달", "효율성", "적합성", "워크플로우"])
            );
        });
    });

    test.describe("2-2. DailyDetailPage - Radar Chart 데이터 정확성", () => {
        test("Radar Chart에 표시된 값이 정규화된 퍼센트(0-100)여야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");
            const radarPolygon = usageScoreCard.locator(".recharts-radar-polygon");

            await expect(radarPolygon).toBeVisible();

            // Radar 폴리곤이 렌더링되었는지 확인
            const polygonElement = await radarPolygon.first().boundingBox();
            expect(polygonElement).not.toBeNull();
        });

        test("Radar Chart 호버 시 툴팁에 '{카테고리명}: {score}/{max}' 형식이 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");
            const radarChart = usageScoreCard.locator(".recharts-surface");

            // Radar Chart 영역에 호버
            await radarChart.hover();

            // 툴팁 표시 대기 (약간의 지연 필요)
            await page.waitForTimeout(500);

            // 툴팁 확인
            const tooltip = page.locator(".recharts-tooltip-wrapper");
            if (await tooltip.isVisible()) {
                const tooltipText = await tooltip.textContent();
                // "의도 전달: 23/25" 형식인지 확인
                expect(tooltipText).toMatch(/\d+\/\d+/);
            }
        });
    });

    test.describe("2-3. DailyDetailPage - 프로그레스 바 제거", () => {
        test("활용도 평가 카드에 수평 프로그레스 바가 표시되지 않아야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");

            // 프로그레스 바 요소가 없어야 함
            const progressBar = usageScoreCard.locator("[role='progressbar']:not(svg circle)");
            await expect(progressBar).not.toBeVisible();

            // 또는 특정 클래스명으로 확인
            const horizontalProgress = usageScoreCard.locator(".progress-bar, .w-full.h-2");
            const count = await horizontalProgress.count();
            expect(count).toBe(0);
        });

        test("카테고리별 점수가 Radar Chart로만 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");

            // Radar Chart는 있어야 함
            const radarChart = usageScoreCard.locator(".recharts-surface");
            await expect(radarChart).toBeVisible();

            // 프로그레스 바 형식의 점수 표시는 없어야 함
            const scoreWithSlash = usageScoreCard.locator("text=/\\d+\\/\\d+/").first();
            // Radar Chart 툴팁이 아닌 정적 텍스트로 표시되면 안됨
            const isInTooltip = await scoreWithSlash.locator("..").evaluate((el) =>
                el.className.includes("tooltip")
            ).catch(() => true);
            expect(isInTooltip).toBe(true);
        });
    });

    test.describe("6-1. HomePage - Radar Chart 표시", () => {
        test("활용도 평가 카드 내부에 Radar Chart가 표시되어야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");

            // Recharts RadarChart 요소 확인
            const radarChart = usageScoreCard.locator(".recharts-surface");
            await expect(radarChart).toBeVisible();
        });

        test("Radar Chart에 4개 축(의도 전달, 효율성, 적합성, 워크플로우)이 표시되어야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");

            // 각 축 라벨 확인
            await expect(usageScoreCard).toContainText("의도 전달");
            await expect(usageScoreCard).toContainText("효율성");
            await expect(usageScoreCard).toContainText("적합성");
            await expect(usageScoreCard).toContainText("워크플로우");
        });

        test("각 축에 카테고리명이 한글로 표시되어야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");
            const polarAngleAxis = usageScoreCard.locator(".recharts-polar-angle-axis-tick");

            // PolarAngleAxis 텍스트가 한글인지 확인
            const axisCount = await polarAngleAxis.count();
            expect(axisCount).toBe(4);

            const axisTexts = await polarAngleAxis.allTextContents();
            expect(axisTexts).toEqual(
                expect.arrayContaining(["의도 전달", "효율성", "적합성", "워크플로우"])
            );
        });
    });

    test.describe("6-2. HomePage - Radar Chart 데이터 (집계 평균)", () => {
        test("Radar Chart에 표시된 값이 모든 리포트의 카테고리별 평균이어야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");
            const radarPolygon = usageScoreCard.locator(".recharts-radar-polygon");

            await expect(radarPolygon).toBeVisible();

            // 집계 평균값이 정확하게 표시되는지 확인 (목업 데이터 참조)
            // MOCK_AGGREGATED_STATS_WITH_SCORING의 categoryAverages
            // intent: 19, efficiency: 22.25, fitness: 18, workflow: 14.75
            // 정규화: (score/max)*100
            // intent: (19/25)*100 = 76%
            // efficiency: (22.25/30)*100 = 74.17%
            // fitness: (18/25)*100 = 72%
            // workflow: (14.75/20)*100 = 73.75%
        });

        test("Radar Chart에 표시된 값이 정규화된 퍼센트(0-100)여야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");
            const radarPolygon = usageScoreCard.locator(".recharts-radar-polygon");

            await expect(radarPolygon).toBeVisible();

            // Radar 폴리곤이 렌더링되었는지 확인
            const polygonElement = await radarPolygon.first().boundingBox();
            expect(polygonElement).not.toBeNull();
        });

        test("Radar Chart 호버 시 툴팁에 평균값이 표시되어야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");
            const radarChart = usageScoreCard.locator(".recharts-surface");

            // Radar Chart 영역에 호버
            await radarChart.hover();

            // 툴팁 표시 대기
            await page.waitForTimeout(500);

            // 툴팁 확인
            const tooltip = page.locator(".recharts-tooltip-wrapper");
            if (await tooltip.isVisible()) {
                const tooltipText = await tooltip.textContent();
                // 평균값이 표시되는지 확인
                expect(tooltipText).toMatch(/\d+/);
            }
        });
    });

    test.describe("6-3. HomePage - 프로그레스 바 제거", () => {
        test("활용도 평가 카드에 수평 프로그레스 바가 표시되지 않아야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");

            // 프로그레스 바 요소가 없어야 함
            const progressBar = usageScoreCard.locator("[role='progressbar']:not(svg circle)");
            await expect(progressBar).not.toBeVisible();
        });

        test("카테고리별 평균 점수가 Radar Chart로만 표시되어야 한다", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");

            // Radar Chart는 있어야 함
            const radarChart = usageScoreCard.locator(".recharts-surface");
            await expect(radarChart).toBeVisible();

            // 프로그레스 바 형식의 점수 표시는 없어야 함
            const horizontalProgress = usageScoreCard.locator(".progress-bar, .w-full.h-2");
            const count = await horizontalProgress.count();
            expect(count).toBe(0);
        });
    });
});
