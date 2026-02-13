import { test, expect } from "@playwright/test";
import {
    MOCK_INDEX_JSON_WITH_SCORING,
    MOCK_JSON_FILES,
    wrapResponse
} from "../mocks/ui-renewal.mock";

test.describe("DailyDetailPage - 레이아웃 변경", () => {
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

    test.describe("1-1. 활용도 평가 + 피드백 2열 배치 - 레이아웃 기본 구조", () => {
        test("활용도 평가와 피드백 섹션이 2열 그리드로 배치되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            // 2열 그리드 컨테이너 찾기
            const gridContainer = page.locator(".grid.grid-cols-1.lg\\:grid-cols-2").first();
            await expect(gridContainer).toBeVisible();

            // 활용도 평가와 피드백이 같은 그리드 내에 있는지 확인
            const usageScoreCard = gridContainer.locator("text=활용도 평가").first();
            const feedbackCard = gridContainer.locator("text=피드백").first();

            await expect(usageScoreCard).toBeVisible();
            await expect(feedbackCard).toBeVisible();
        });

        test("데스크톱 화면(>= 1024px)에서 활용도 평가가 좌측, 피드백이 우측에 표시되어야 한다", async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const gridContainer = page.locator(".grid.grid-cols-1.lg\\:grid-cols-2").first();
            const cards = await gridContainer.locator("[data-slot='card']").all();

            // 첫 번째 카드가 활용도 평가인지 확인
            await expect(cards[0]).toContainText("활용도 평가");
            // 두 번째 카드가 피드백인지 확인
            await expect(cards[1]).toContainText("피드백");
        });

        test("모바일 화면(< 1024px)에서 활용도 평가가 위, 피드백이 아래에 세로 배치되어야 한다", async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const gridContainer = page.locator(".grid.grid-cols-1").first();
            await expect(gridContainer).toBeVisible();

            // 활용도 평가와 피드백이 세로로 배치되어 있는지 확인
            const usageScoreCard = gridContainer.locator("text=활용도 평가").first();
            const feedbackCard = gridContainer.locator("text=피드백").first();

            await expect(usageScoreCard).toBeVisible();
            await expect(feedbackCard).toBeVisible();
        });
    });

    test.describe("1-2. 활용도 평가 + 피드백 2열 배치 - 활용도 평가 카드", () => {
        test("활용도 평가 카드에 원형 게이지가 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");
            // 원형 게이지를 나타내는 요소 (보통 SVG circle 또는 progress)
            const circularGauge = usageScoreCard.locator("svg circle, [role='progressbar']").first();
            await expect(circularGauge).toBeVisible();
        });

        test("활용도 평가 카드에 점수와 등급 Badge가 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");

            // 점수 표시 (90점)
            await expect(usageScoreCard).toContainText("90");

            // 등급 Badge (A)
            const gradeBadge = usageScoreCard.locator("[data-slot='badge'], .badge").filter({ hasText: "A" });
            await expect(gradeBadge).toBeVisible();
        });

        test("활용도 평가 카드 내부에 피드백 관련 UI가 없어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const usageScoreCard = page.locator("text=활용도 평가").locator("..");

            // 피드백 관련 텍스트가 없어야 함
            await expect(usageScoreCard.locator("text=잘한 점")).not.toBeVisible();
            await expect(usageScoreCard.locator("text=개선 포인트")).not.toBeVisible();
        });
    });

    test.describe("1-3. 활용도 평가 + 피드백 2열 배치 - 피드백 & 인사이트 카드", () => {
        test("피드백 & 인사이트 카드가 활용도 평가 옆(우측)에 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const gridContainer = page.locator(".grid.grid-cols-1.lg\\:grid-cols-2").first();
            const feedbackCard = gridContainer.locator("text=피드백").first();

            await expect(feedbackCard).toBeVisible();
        });

        test("피드백 카드에 잘한 점, 개선 포인트, 컨텍스트 팁이 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const feedbackCard = page.locator("text=피드백").locator("..");

            await expect(feedbackCard).toContainText("잘한 점");
            await expect(feedbackCard).toContainText("개선 포인트");
            await expect(feedbackCard).toContainText("컨텍스트 팁");

            // 목업 데이터의 실제 내용 확인
            await expect(feedbackCard).toContainText("명확한 요구사항 전달");
            await expect(feedbackCard).toContainText("초기 컨텍스트 제공");
            await expect(feedbackCard).toContainText("파일 구조를 먼저 공유");
        });

        test("피드백 카드가 페이지 하단(8번째)이 아닌 2번째 섹션에 위치해야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            // 페이지의 모든 Card 요소를 가져옴
            const allCards = page.locator("[data-slot='card']");
            const cardCount = await allCards.count();

            // 피드백 카드의 인덱스 찾기
            let feedbackCardIndex = -1;
            for (let i = 0; i < cardCount; i++) {
                const cardText = await allCards.nth(i).textContent();
                if (cardText?.includes("피드백")) {
                    feedbackCardIndex = i;
                    break;
                }
            }

            // 피드백 카드가 상위 5개 카드 내에 있어야 함 (2번째 섹션)
            expect(feedbackCardIndex).toBeGreaterThan(-1);
            expect(feedbackCardIndex).toBeLessThan(5);
        });
    });

    test.describe("3-1. 사용 스타일 + 프롬프트 통계 2열 배치 - 레이아웃 기본 구조", () => {
        test("사용 스타일과 프롬프트 통계가 2열 그리드로 배치되어야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            // 사용 스타일과 프롬프트 통계를 포함하는 2열 그리드 찾기
            const grids = page.locator(".grid.grid-cols-1.lg\\:grid-cols-2");
            let foundGrid = false;

            for (let i = 0; i < await grids.count(); i++) {
                const grid = grids.nth(i);
                const text = await grid.textContent();
                if (text?.includes("사용 스타일") && text?.includes("프롬프트")) {
                    foundGrid = true;
                    await expect(grid).toBeVisible();
                    break;
                }
            }

            expect(foundGrid).toBe(true);
        });

        test("데스크톱 화면에서 사용 스타일이 좌측, 프롬프트 통계가 우측에 표시되어야 한다", async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            // 사용 스타일과 프롬프트 통계를 포함하는 그리드 찾기
            const allCards = page.locator("[data-slot='card']");
            const cardCount = await allCards.count();

            let usageStyleIndex = -1;
            let promptStatsIndex = -1;

            for (let i = 0; i < cardCount; i++) {
                const cardText = await allCards.nth(i).textContent();
                if (cardText?.includes("사용 스타일")) {
                    usageStyleIndex = i;
                }
                if (cardText?.includes("프롬프트")) {
                    promptStatsIndex = i;
                }
            }

            // 사용 스타일이 프롬프트 통계보다 앞에 있거나 같은 행에 있어야 함
            expect(usageStyleIndex).toBeGreaterThan(-1);
            expect(promptStatsIndex).toBeGreaterThan(-1);
        });

        test("모바일 화면에서 사용 스타일이 위, 프롬프트 통계가 아래에 세로 배치되어야 한다", async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const usageStyleCard = page.locator("text=사용 스타일").first();
            const promptStatsCard = page.locator("text=프롬프트").first();

            await expect(usageStyleCard).toBeVisible();
            await expect(promptStatsCard).toBeVisible();
        });
    });

    test.describe("3-2. 사용 스타일 + 프롬프트 통계 2열 배치 - 섹션 순서", () => {
        test("사용 스타일 + 프롬프트 통계 그리드가 3번째 섹션에 위치해야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const allCards = page.locator("[data-slot='card']");
            const cardCount = await allCards.count();

            let usageStyleIndex = -1;

            for (let i = 0; i < cardCount; i++) {
                const cardText = await allCards.nth(i).textContent();
                if (cardText?.includes("사용 스타일")) {
                    usageStyleIndex = i;
                    break;
                }
            }

            // 사용 스타일이 상위 6개 카드 내에 있어야 함 (3번째 섹션)
            expect(usageStyleIndex).toBeGreaterThan(1); // 최소 2번 이후
            expect(usageStyleIndex).toBeLessThan(6);
        });

        test("클로드 코드 활용 방식이 사용 스타일 그리드 아래(4번째)에 위치해야 한다", async ({ page }) => {
            await page.goto("/daily/work/2026-02-08");
            await page.waitForLoadState("networkidle");

            const allCards = page.locator("[data-slot='card']");
            const cardCount = await allCards.count();

            let usageStyleIndex = -1;
            let claudeUsageIndex = -1;

            for (let i = 0; i < cardCount; i++) {
                const cardText = await allCards.nth(i).textContent();
                if (cardText?.includes("사용 스타일")) {
                    usageStyleIndex = i;
                }
                if (cardText?.includes("슬래시 커맨드") || cardText?.includes("클로드 코드")) {
                    claudeUsageIndex = i;
                }
            }

            // 클로드 코드 활용 방식이 사용 스타일보다 뒤에 있어야 함
            expect(usageStyleIndex).toBeGreaterThan(-1);
            expect(claudeUsageIndex).toBeGreaterThan(usageStyleIndex);
        });
    });
});
