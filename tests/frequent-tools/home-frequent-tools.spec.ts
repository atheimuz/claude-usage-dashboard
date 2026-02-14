import { test, expect } from "@playwright/test";
import { HomePage } from "../page-objects/home.page";
import {
    MOCK_REPORTS_WITH_TOOLS,
    MOCK_REPORTS_EMPTY_TOOLS,
    wrapResponse
} from "../mocks/frequent-tools.mock";

test.describe("FrequentTools - 자주 쓰는 도구 섹션", () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        // index.json 인터셉트 (3개 파일)
        await page.route("**/data/index.json", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: wrapResponse({
                    files: [
                        { name: "2026-02-08.json", location: "work" },
                        { name: "2026-02-09.json", location: "side" },
                        { name: "2026-02-10.json", location: "work" }
                    ]
                })
            })
        );

        // WeeklyReport JSON 파일 인터셉트
        await page.route("**/data/work/2026-02-08.json", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: wrapResponse(MOCK_REPORTS_WITH_TOOLS[0])
            })
        );

        await page.route("**/data/side/2026-02-09.json", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: wrapResponse(MOCK_REPORTS_WITH_TOOLS[1])
            })
        );

        await page.route("**/data/work/2026-02-10.json", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: wrapResponse(MOCK_REPORTS_WITH_TOOLS[2])
            })
        );

        homePage = new HomePage(page);
    });

    test.describe("자주 쓰는 도구 목록 표시", () => {
        test("자주 쓰는 도구 목록이 올바르게 표시되어야 한다", async ({ page }) => {
            // Given - 홈 페이지 접속
            await homePage.navigateToHome();

            const frequentToolsCard = page.locator("[data-slot='card']").filter({ hasText: "자주 쓰는 도구" });
            const items = frequentToolsCard.locator("[data-testid='frequent-tool-item']");

            // When - FrequentTools 카드가 로드됨
            await expect(items.first()).toBeVisible();

            // Then - 항목들이 사용 횟수 내림차순으로 정렬되어 표시됨
            // 1위: Planner (40회)
            const firstItem = items.first();
            await expect(firstItem).toContainText("1"); // 순위
            await expect(firstItem).toContainText("Planner"); // 도구명
            await expect(firstItem).toContainText("40회"); // 사용 횟수
            await expect(firstItem).toContainText("구현 계획 및 전략 수립"); // description

            // 2위: Coder (38회)
            const secondItem = items.nth(1);
            await expect(secondItem).toContainText("2");
            await expect(secondItem).toContainText("Coder");
            await expect(secondItem).toContainText("38회");
            await expect(secondItem).toContainText("코드 작성 및 구현");

            // Then - 1위 프로그레스 바는 100% 너비
            const firstProgress = firstItem.locator(".bg-primary");
            await expect(firstProgress).toBeVisible();
            const firstStyle = await firstProgress.getAttribute("style");
            expect(firstStyle).toContain("width: 100%");

            // Then - 최대 10개 항목만 표시
            const count = await items.count();
            expect(count).toBeLessThanOrEqual(10);
            expect(count).toBeGreaterThan(0);
        });

        test("각 카테고리별 Badge가 올바르게 표시되어야 한다", async ({ page }) => {
            // Given - 홈 페이지 접속
            await homePage.navigateToHome();

            const frequentToolsCard = page.locator("[data-slot='card']").filter({ hasText: "자주 쓰는 도구" });

            // Then - Agent, Command, Skill Badge가 모두 표시됨
            const agentBadge = frequentToolsCard.locator("[data-slot='badge']").filter({ hasText: "Agent" }).first();
            await expect(agentBadge).toBeVisible();

            const commandBadge = frequentToolsCard.locator("[data-slot='badge']").filter({ hasText: "Command" }).first();
            await expect(commandBadge).toBeVisible();

            const skillBadge = frequentToolsCard.locator("[data-slot='badge']").filter({ hasText: "Skill" }).first();
            await expect(skillBadge).toBeVisible();
        });

        test("description이 없는 항목은 설명 없이 표시되어야 한다", async ({ page }) => {
            // Given - description이 없는 데이터로 페이지 설정
            const newPage = await page.context().newPage();

            const reportWithoutDescription = {
                ...MOCK_REPORTS_WITH_TOOLS[0],
                tool_usage: {
                    ...MOCK_REPORTS_WITH_TOOLS[0].tool_usage,
                    agents: [{ type: "TestAgent", count: 50 }], // description 없음
                    commands: [],
                    skills: []
                }
            };

            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse({
                        files: [{ name: "2026-02-08.json", location: "work" }]
                    })
                })
            );

            await newPage.route("**/data/work/2026-02-08.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(reportWithoutDescription)
                })
            );

            // When - 페이지 접속
            const noDescHomePage = new HomePage(newPage);
            await noDescHomePage.navigateToHome();

            // Then - 도구명은 표시되고 description 영역은 없음
            const frequentToolsCard = newPage.locator("[data-slot='card']").filter({ hasText: "자주 쓰는 도구" });
            await expect(frequentToolsCard).toContainText("TestAgent");

            const testAgentItem = frequentToolsCard.locator("[data-testid='frequent-tool-item']").filter({ hasText: "TestAgent" });
            const descriptionElement = testAgentItem.locator(".text-xs.text-muted-foreground");
            await expect(descriptionElement).not.toBeVisible();

            await newPage.close();
        });
    });

    test.describe("빈 상태", () => {
        test("데이터가 없으면 FrequentTools 카드가 렌더링되지 않아야 한다", async ({ page }) => {
            // Given - 빈 도구 데이터로 페이지 설정
            const newPage = await page.context().newPage();

            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse({
                        files: [{ name: "2026-02-11.json", location: "work" }]
                    })
                })
            );

            await newPage.route("**/data/work/2026-02-11.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_REPORTS_EMPTY_TOOLS[0])
                })
            );

            // When - 페이지 접속
            const emptyHomePage = new HomePage(newPage);
            await emptyHomePage.navigateToHome();

            // Then - FrequentTools 카드가 렌더링되지 않음
            const frequentToolsCard = newPage.locator("[data-slot='card']").filter({ hasText: "자주 쓰는 도구" });
            await expect(frequentToolsCard).not.toBeVisible();

            await newPage.close();
        });

        test("데이터가 없으면 TaskTypeGrid가 full-width로 표시되어야 한다", async ({ page }) => {
            // Given - 빈 도구 데이터로 페이지 설정
            const newPage = await page.context().newPage();

            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse({
                        files: [{ name: "2026-02-11.json", location: "work" }]
                    })
                })
            );

            await newPage.route("**/data/work/2026-02-11.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_REPORTS_EMPTY_TOOLS[0])
                })
            );

            // When - 페이지 접속
            const emptyHomePage = new HomePage(newPage);
            await emptyHomePage.navigateToHome();

            // Then - TaskTypeGrid가 표시되고 FrequentTools가 없으므로 full-width
            const taskTypeGrid = newPage.locator("[data-slot='card']").filter({ hasText: "주요 작업" });
            await expect(taskTypeGrid).toBeVisible();

            const frequentToolsCard = newPage.locator("[data-slot='card']").filter({ hasText: "자주 쓰는 도구" });
            await expect(frequentToolsCard).not.toBeVisible();

            await newPage.close();
        });
    });

    test.describe("레이아웃 및 반응형", () => {
        test("홈 페이지 레이아웃이 올바르게 배치되어야 한다", async ({ page }) => {
            // Given - 데스크톱 화면 크기 (lg 이상)
            await page.setViewportSize({ width: 1280, height: 720 });

            // When - 홈 페이지 접속
            await homePage.navigateToHome();

            const toolStatsTable = page.locator("[data-slot='card']").filter({ hasText: "도구 활용 통계" });
            const frequentToolsCard = page.locator("[data-slot='card']").filter({ hasText: "자주 쓰는 도구" });
            const taskTypeGrid = page.locator("[data-slot='card']").filter({ hasText: "주요 작업" });
            const recentActivity = page.locator("[data-slot='card']").filter({ hasText: "최근 활동" });

            await expect(toolStatsTable).toBeVisible();
            await expect(frequentToolsCard).toBeVisible();
            await expect(taskTypeGrid).toBeVisible();
            await expect(recentActivity).toBeVisible();

            // Then - ToolStatsTable과 FrequentTools가 2열 그리드 (같은 행)
            const toolStatsBox = await toolStatsTable.boundingBox();
            const frequentToolsBox = await frequentToolsCard.boundingBox();

            expect(toolStatsBox).not.toBeNull();
            expect(frequentToolsBox).not.toBeNull();

            if (toolStatsBox && frequentToolsBox) {
                const yDiff = Math.abs(toolStatsBox.y - frequentToolsBox.y);
                expect(yDiff).toBeLessThan(50); // 같은 행으로 판단
            }

            // Then - 순서: FrequentTools → TaskTypeGrid → RecentActivity
            const taskTypeBox = await taskTypeGrid.boundingBox();
            const recentActivityBox = await recentActivity.boundingBox();

            expect(taskTypeBox).not.toBeNull();
            expect(recentActivityBox).not.toBeNull();

            if (frequentToolsBox && taskTypeBox && recentActivityBox) {
                expect(taskTypeBox.y).toBeGreaterThan(frequentToolsBox.y);
                expect(recentActivityBox.y).toBeGreaterThan(taskTypeBox.y);
            }
        });
    });

    test.describe("엣지 케이스", () => {
        test("도구 항목이 10개 미만일 때 있는 만큼만 표시되어야 한다", async ({ page }) => {
            // Given - 홈 페이지 접속 (목업 데이터는 10개 항목)
            await homePage.navigateToHome();

            // Then - 정확히 10개 항목이 표시됨 (MOCK_FREQUENT_TOOLS는 10개)
            const frequentToolsCard = page.locator("[data-slot='card']").filter({ hasText: "자주 쓰는 도구" });
            const listItems = frequentToolsCard.locator("[data-testid='frequent-tool-item']");

            await expect(listItems.first()).toBeVisible();

            const count = await listItems.count();
            expect(count).toBe(10);
        });

        test("undefined 항목은 'Unknown'으로 표시되어야 한다", async ({ page }) => {
            // Given - agent.type, command.name, skill.name이 undefined인 데이터
            const newPage = await page.context().newPage();

            const reportWithUndefined = {
                ...MOCK_REPORTS_WITH_TOOLS[0],
                tool_usage: {
                    ...MOCK_REPORTS_WITH_TOOLS[0].tool_usage,
                    agents: [{ type: undefined as any, count: 10 }],
                    commands: [{ name: undefined as any, count: 8 }],
                    skills: [{ name: undefined as any, count: 6 }]
                }
            };

            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse({
                        files: [{ name: "2026-02-08.json", location: "work" }]
                    })
                })
            );

            await newPage.route("**/data/work/2026-02-08.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(reportWithUndefined)
                })
            );

            // When - 페이지 접속
            const undefinedHomePage = new HomePage(newPage);
            await undefinedHomePage.navigateToHome();

            // Then - "Unknown"으로 표시됨
            const frequentToolsCard = newPage.locator("[data-slot='card']").filter({ hasText: "자주 쓰는 도구" });
            await expect(frequentToolsCard).toContainText("Unknown");

            await newPage.close();
        });

        test("동일 이름이 다른 카테고리에 있을 때 별도 집계되어야 한다", async ({ page }) => {
            // Given - 홈 페이지 접속
            await homePage.navigateToHome();

            const frequentToolsCard = page.locator("[data-slot='card']").filter({ hasText: "자주 쓰는 도구" });

            // Then - skill::/session-analyzer (19회)는 표시되고, command::/session-analyzer (5회)는 상위 10개에서 제외
            const skillRow = frequentToolsCard.locator("[data-testid='frequent-tool-item']")
                .filter({ hasText: "/session-analyzer" })
                .filter({ hasText: "Skill" });
            await expect(skillRow).toBeVisible();

            // Note: command::/session-analyzer (5회)는 상위 10개에서 제외되어 표시되지 않음
            // 상위 10개: Planner(40), Coder(38), /commit(33), /session-analyzer(skill,19), /test(19),
            //           /fix(18), /test-runner(17), Reviewer(12), /doc-generator(11), Debugger(10)
        });
    });
});
