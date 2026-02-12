import { test, expect } from "@playwright/test";
import {
    MOCK_INDEX_JSON,
    MOCK_MARKDOWN_FILES,
    wrapResponse
} from "../mocks/claude-usage-dashboard.mock";

test.describe("데이터 Fetching 및 API 인터셉트", () => {
    test.describe("5-1. index.json 로드", () => {
        test("앱 시작 시 /data/index.json을 fetch해야 한다", async ({ page }) => {
            let indexJsonRequested = false;

            await page.route("**/data/index.json", (route) => {
                indexJsonRequested = true;
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                });
            });

            await page.goto("/");
            await page.waitForTimeout(500);

            expect(indexJsonRequested).toBe(true);
        });

        test("index.json의 파일 목록이 정상적으로 파싱되어야 한다", async ({ page }) => {
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

            await page.goto("/daily");
            await page.waitForTimeout(1000);

            // 파일 목록이 UI에 표시되는지 확인
            const listCards = page.locator("[role='article'][data-type='daily-log'], .daily-log-card");
            const count = await listCards.count();
            expect(count).toBeGreaterThan(0);
        });

        test("목업 데이터로 index.json 응답을 인터셉트해야 한다", async ({ page }) => {
            let intercepted = false;

            await page.route("**/data/index.json", (route) => {
                intercepted = true;
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                });
            });

            await page.goto("/");
            await page.waitForTimeout(500);

            expect(intercepted).toBe(true);
        });
    });

    test.describe("5-2. 마크다운 파일 로드", () => {
        test("일지 상세 페이지에서 /data/:filename.md를 fetch해야 한다", async ({ page }) => {
            let markdownRequested = false;

            await page.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                })
            );

            await page.route("**/data/work/2026-02-08.md", (route) => {
                markdownRequested = true;
                route.fulfill({
                    status: 200,
                    contentType: "text/markdown",
                    body: MOCK_MARKDOWN_FILES["work/2026-02-08"]
                });
            });

            await page.goto("/daily/work/2026-02-08");
            await page.waitForTimeout(1000);

            expect(markdownRequested).toBe(true);
        });

        test("마크다운 파일이 정상적으로 파싱되어야 한다", async ({ page }) => {
            await page.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                })
            );

            await page.route("**/data/work/2026-02-08.md", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "text/markdown",
                    body: MOCK_MARKDOWN_FILES["work/2026-02-08"]
                })
            );

            await page.goto("/daily/work/2026-02-08");
            await page.waitForTimeout(1000);

            // 파싱된 데이터가 UI에 표시되는지 확인
            await expect(page.getByText("102")).toBeVisible(); // 총 세션 수
            await expect(page.getByText("1600")).toBeVisible(); // 총 도구 호출
            await expect(page.getByText(/TypeScript/i)).toBeVisible(); // 기술 스택
        });

        test("목업 데이터로 마크다운 파일 응답을 인터셉트해야 한다", async ({ page }) => {
            let intercepted = false;

            await page.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                })
            );

            await page.route("**/data/work/2026-02-08.md", (route) => {
                intercepted = true;
                route.fulfill({
                    status: 200,
                    contentType: "text/markdown",
                    body: MOCK_MARKDOWN_FILES["work/2026-02-08"]
                });
            });

            await page.goto("/daily/work/2026-02-08");
            await page.waitForTimeout(500);

            expect(intercepted).toBe(true);
        });
    });

    test.describe("5-3. 여러 날짜에 여러 일지 처리", () => {
        test.beforeEach(async ({ page }) => {
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

        test("하루에 여러 일지가 있는 경우 모두 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily");
            await page.waitForTimeout(1000);

            // 2026-02-08에 2개의 일지가 있음 (work, side)
            const date2026_02_08Cards = page.locator("[data-date='2026-02-08']");
            const count = await date2026_02_08Cards.count();

            expect(count).toBeGreaterThanOrEqual(2);
        });

        test("같은 날짜의 일지들이 올바르게 그룹핑되어야 한다", async ({ page }) => {
            await page.goto("/daily");
            await page.waitForTimeout(1000);

            // 날짜 헤딩 확인
            const dateHeading = page.getByRole("heading", { name: /2026-02-08/i });
            await expect(dateHeading).toBeVisible();

            // 헤딩 아래에 여러 카드가 있어야 함
            const headingBox = await dateHeading.boundingBox();
            const cards = page.locator("[role='article']");

            let cardsUnderHeading = 0;
            const cardCount = await cards.count();

            for (let i = 0; i < cardCount; i++) {
                const card = cards.nth(i);
                const cardBox = await card.boundingBox();
                if (cardBox && headingBox && cardBox.y > headingBox.y) {
                    const cardDate = await card.getAttribute("data-date");
                    if (cardDate === "2026-02-08") {
                        cardsUnderHeading++;
                    }
                }
            }

            expect(cardsUnderHeading).toBeGreaterThanOrEqual(2);
        });

        test("달력에서 여러 일지가 있는 날짜 클릭 시 팝오버로 목록이 표시되어야 한다", async ({ page }) => {
            await page.goto("/daily");
            await page.waitForTimeout(1000);

            // 달력 뷰로 전환
            const calendarViewButton = page.getByRole("button", { name: /calendar|달력/i });
            await calendarViewButton.click();
            await page.waitForTimeout(500);

            // 2026-02-08 날짜 클릭
            const date2026_02_08Cell = page.locator("[data-date='2026-02-08']").first();
            await date2026_02_08Cell.click();
            await page.waitForTimeout(300);

            // 팝오버 확인
            const popover = page.locator("[role='dialog'], .popover");
            await expect(popover).toBeVisible();

            // 팝오버 내에 2개의 일지 링크가 있어야 함
            const popoverLinks = popover.locator("a, button");
            const linkCount = await popoverLinks.count();
            expect(linkCount).toBeGreaterThanOrEqual(2);
        });
    });

    test.describe("API 에러 처리", () => {
        test("index.json fetch 실패 시 에러 처리", async ({ page }) => {
            await page.route("**/data/index.json", (route) =>
                route.abort("failed")
            );

            await page.goto("/");
            await page.waitForTimeout(1000);

            const errorAlert = page.getByRole("alert");
            await expect(errorAlert).toBeVisible();
        });

        test("마크다운 파일 fetch 실패 시 에러 처리", async ({ page }) => {
            await page.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                })
            );

            await page.route("**/data/work/2026-02-08.md", (route) =>
                route.abort("failed")
            );

            await page.goto("/daily/work/2026-02-08");
            await page.waitForTimeout(1000);

            const errorAlert = page.getByRole("alert");
            await expect(errorAlert).toBeVisible();
        });

        test("404 응답 시 적절한 메시지 표시", async ({ page }) => {
            await page.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                })
            );

            await page.route("**/data/unknown/nonexistent.md", (route) =>
                route.fulfill({
                    status: 404,
                    contentType: "application/json",
                    body: JSON.stringify({ error: "Not Found" })
                })
            );

            await page.goto("/daily/unknown/nonexistent");
            await page.waitForTimeout(1000);

            await expect(page.getByText(/해당 날짜의 일지가 없습니다|Not Found/i)).toBeVisible();
        });
    });

    test.describe("캐싱 동작", () => {
        test("같은 파일을 여러 번 요청해도 한 번만 fetch해야 한다", async ({ page }) => {
            let fetchCount = 0;

            await page.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                })
            );

            await page.route("**/data/work/2026-02-08.md", (route) => {
                fetchCount++;
                route.fulfill({
                    status: 200,
                    contentType: "text/markdown",
                    body: MOCK_MARKDOWN_FILES["work/2026-02-08"]
                });
            });

            // 같은 페이지에 두 번 접속
            await page.goto("/daily/work/2026-02-08");
            await page.waitForTimeout(1000);

            await page.goto("/");
            await page.waitForTimeout(500);

            await page.goto("/daily/work/2026-02-08");
            await page.waitForTimeout(1000);

            // react-query 캐싱으로 인해 두 번째 요청은 fetch하지 않음
            expect(fetchCount).toBe(1);
        });
    });
});
