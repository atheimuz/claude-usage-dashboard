import { test, expect } from "@playwright/test";
import { DailyDetailPage } from "../page-objects/daily-detail.page";
import {
    MOCK_INDEX_JSON,
    MOCK_MARKDOWN_FILES,
    wrapResponse
} from "../mocks/claude-usage-dashboard.mock";

test.describe("일지 상세 페이지 - 사용자 시나리오", () => {
    let dailyDetailPage: DailyDetailPage;

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

        dailyDetailPage = new DailyDetailPage(page);
    });

    test("사용자가 특정 일지를 열어 기본 정보를 확인할 수 있다", async () => {
        // Given - 일지 상세 페이지에 접속하면
        await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");

        // Then - 날짜, 요일, 식별자, 생성일이 모두 표시됨
        await expect(dailyDetailPage.dateTitle).toBeVisible();
        await expect(dailyDetailPage.dateTitle).toContainText("2026-02-08");
        await expect(dailyDetailPage.dateTitle).toContainText(/월|화|수|목|금|토|일/);
        await expect(dailyDetailPage.identifierBadge).toContainText("work");
        await expect(dailyDetailPage.generatedDate).toContainText("2026-02-11");
    });

    test("사용자가 일지 상세에서 전체 활동 통계를 확인할 수 있다", async () => {
        // Given - 일지 상세 페이지에서
        await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");

        // Then - 4개의 핵심 통계가 정확한 값과 함께 표시됨
        await expect(dailyDetailPage.statsCards).toHaveCount(4);
        await expect(dailyDetailPage.totalSessionsCard).toContainText("102");
        await expect(dailyDetailPage.totalToolCallsCard).toContainText("1600");
        await expect(dailyDetailPage.workingHoursCard).toContainText(/13:53|00:22/);
        await expect(dailyDetailPage.projectCountCard).toContainText("4");

        // And - 프로젝트별 세션 수 테이블이 표시됨
        await dailyDetailPage.expectProjectSessionsTableVisible();
    });

    test("사용자가 기술 스택과 클로드 활용 방식을 확인할 수 있다", async () => {
        // Given - 일지 상세 페이지에서
        await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");

        // Then - 기술 스택 3개 카테고리가 Badge 형태로 표시됨
        await dailyDetailPage.expectTechStackSectionVisible();
        await expect(dailyDetailPage.languagesBadges.first()).toContainText(/TypeScript|Python/);
        await expect(dailyDetailPage.frameworksBadges.first()).toContainText(/Astro|React|Tailwind/);
        await expect(dailyDetailPage.toolsBadges.first()).toContainText(/Git|npm/);

        // And - 클로드 활용 방식 섹션이 표시됨
        await dailyDetailPage.expectClaudeUsageSectionVisible();
        await expect(dailyDetailPage.modesSubSection).toBeVisible();
        await expect(dailyDetailPage.featuresSubSection).toBeVisible();
        await expect(dailyDetailPage.delegationStyleSubSection).toBeVisible();
        await dailyDetailPage.expectProgressBarsVisible();
    });

    test("사용자가 프롬프트 패턴과 효과적인 방법을 확인할 수 있다", async () => {
        // Given - 일지 상세 페이지에서
        await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");

        // Then - 프롬프트 패턴 섹션이 표시됨
        await dailyDetailPage.expectPromptPatternsSectionVisible();
        await expect(dailyDetailPage.effectivePromptsSubSection).toBeVisible();
        await expect(dailyDetailPage.conversationFlowSubSection).toBeVisible();
        await expect(dailyDetailPage.conversationFlowSubSection).toContainText(/단발 요청|연속 대화/);
    });

    test("사용자가 도구 사용 순위와 주요 용도를 확인할 수 있다", async () => {
        // Given - 일지 상세 페이지에서
        await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");

        // Then - 도구 활용 통계 테이블이 표시되고
        await dailyDetailPage.expectToolStatsTableVisible();

        const table = dailyDetailPage.toolStatsTable;
        await expect(table).toContainText("도구명");
        await expect(table).toContainText("사용 횟수");
        await expect(table).toContainText("주요 용도");

        // And - 가장 많이 사용한 도구가 상단에 표시됨
        const firstRow = dailyDetailPage.toolStatsRows.first();
        await expect(firstRow).toContainText("Read");
        await expect(firstRow).toContainText("394");
    });

    test("사용자가 작업 유형별 분포를 확인할 수 있다", async ({ page }) => {
        // Given - 일지 상세 페이지에서
        await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");

        // Then - 작업 유형 카드들이 아이콘과 함께 표시됨
        await dailyDetailPage.expectTaskTypeSectionVisible();
        await expect(dailyDetailPage.taskTypeCards.first()).toBeVisible();

        const icon = page.locator("[role='region'][aria-label*='작업 유형'] svg[class*='lucide']");
        await expect(icon.first()).toBeVisible();

        // And - 각 카드에 타입명과 건수가 표시됨
        const firstCard = dailyDetailPage.taskTypeCards.first();
        await expect(firstCard).toContainText(/Coding|Refactoring|Planning/);
        await expect(firstCard).toContainText(/\d+회/);
    });

    test("사용자가 세션 상세를 펼쳐서 확인할 수 있다", async () => {
        // Given - 일지 상세 페이지의 세션 섹션에서
        await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
        await dailyDetailPage.expectSessionAccordionVisible();

        // Then - 첫 번째 세션이 기본으로 펼쳐져 있고 상세 정보가 표시됨
        await dailyDetailPage.expectFirstAccordionExpanded();

        const firstItem = dailyDetailPage.firstAccordionItem;
        await expect(firstItem).toContainText(/자동화 블로그 인프라 구축/);
        await expect(firstItem).toContainText(/04:53/);
        await expect(firstItem).toContainText(/대화형 요구사항 분석/);
        await expect(firstItem).toContainText(/트렌드 수집 파이프라인/);
        await expect(firstItem).toContainText(/45개 파일/);

        // When - 다른 세션을 클릭하면
        const secondItem = dailyDetailPage.accordionItems.nth(1);
        await dailyDetailPage.clickAccordionItem(1);

        // Then - 해당 세션이 펼쳐짐
        await secondItem.waitFor({ state: "visible" });
    });

    test("사용자가 학습 인사이트와 워크플로우 패턴을 확인할 수 있다", async ({ page }) => {
        // Given - 일지 상세 페이지에서
        await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");

        // Then - 학습 인사이트가 아이콘과 함께 표시됨
        await dailyDetailPage.expectLearningInsightsSectionVisible();
        const icon = page.locator("[role='region'][aria-label*='학습 인사이트'] svg[class*='lucide']");
        await expect(icon.first()).toBeVisible();

        const firstInsight = dailyDetailPage.insightItems.first();
        const boldText = firstInsight.locator("strong, b, [class*='font-semibold']");
        await expect(boldText.first()).toBeVisible();

        // And - 워크플로우 패턴이 표시됨
        await dailyDetailPage.expectWorkflowPatternsSectionVisible();
        const firstPattern = dailyDetailPage.patternItems.first();
        await expect(firstPattern).toContainText(/탐색 → 수정 → 검증/);
    });

    test.describe("네비게이션", () => {
        test("사용자가 일지 목록으로 돌아갈 수 있다", async ({ page }) => {
            // Given - 일지 상세 페이지에서
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
            await expect(dailyDetailPage.backToListLink).toBeVisible();

            // When - 목록 링크를 클릭하면
            await dailyDetailPage.clickBackToList();

            // Then - 일지 목록 페이지로 이동함
            await page.waitForURL("/daily");
            expect(page.url()).toContain("/daily");
        });

        test("사용자가 이전/다음 일지로 이동할 수 있다", async ({ page }) => {
            // Given - 중간 일지에서
            await dailyDetailPage.navigateToDailyDetail("side/2026-02-08");
            await dailyDetailPage.expectNavigationButtonsVisible();

            // When - 이전 버튼을 클릭하면
            await dailyDetailPage.clickPrevDaily();

            // Then - 이전 일지로 이동함
            await page.waitForURL(/\/daily\/work\/2026-02-08/);
            expect(page.url()).toContain("work/2026-02-08");
        });

        test("첫 번째 일지에서는 이전 버튼이 비활성화된다", async () => {
            // Given - 첫 번째 일지에서
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");

            // Then - 이전 버튼이 비활성화됨
            await dailyDetailPage.expectPrevButtonDisabled();
        });

        test("마지막 일지에서는 다음 버튼이 비활성화된다", async () => {
            // Given - 마지막 일지에서
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-10");

            // Then - 다음 버튼이 비활성화됨
            await dailyDetailPage.expectNextButtonDisabled();
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
            await newPage.route("**/data/work/2026-02-08.md", async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await route.fulfill({
                    status: 200,
                    contentType: "text/markdown",
                    body: MOCK_MARKDOWN_FILES["work/2026-02-08"]
                });
            });

            // When - 일지 상세 페이지에 접속하면
            const loadingPage = new DailyDetailPage(newPage);
            await loadingPage.navigateToDailyDetail("work/2026-02-08");

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
            await newPage.route("**/data/work/2026-02-08.md", (route) => route.abort("failed"));

            // When - 일지 상세 페이지에 접속하면
            const errorPage = new DailyDetailPage(newPage);
            await errorPage.navigateToDailyDetail("work/2026-02-08");

            // Then - 에러 Alert이 표시됨
            await errorPage.expectErrorState();

            await newPage.close();
        });

        test("존재하지 않는 일지 접근 시 404 메시지와 목록 링크가 표시된다", async ({ page }) => {
            // Given - 존재하지 않는 일지에 접근하면
            const newPage = await page.context().newPage();
            await newPage.route("**/data/index.json", (route) =>
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: wrapResponse(MOCK_INDEX_JSON)
                })
            );
            await newPage.route("**/data/unknown/invalid.md", (route) =>
                route.fulfill({ status: 404 })
            );

            // When - 일지 상세 페이지에 접속하면
            const notFoundPage = new DailyDetailPage(newPage);
            await notFoundPage.navigateToDailyDetail("unknown/invalid");

            // Then - 404 메시지와 목록 링크가 표시됨
            await notFoundPage.expectNotFoundState();
            await expect(newPage.getByRole("link", { name: /목록/i })).toBeVisible();

            await newPage.close();
        });
    });
});
