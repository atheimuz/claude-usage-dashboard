import { test, expect } from "@playwright/test";
import { DailyDetailPage } from "../page-objects/daily-detail.page";
import {
    MOCK_INDEX_JSON,
    MOCK_MARKDOWN_FILES,
    wrapResponse
} from "../mocks/claude-usage-dashboard.mock";

test.describe("일지 상세 페이지", () => {
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

    test.describe("3-1. 페이지 헤더", () => {
        test("일지 상세 페이지에 접속하면 날짜 타이틀이 표시되어야 한다", async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
            await expect(dailyDetailPage.dateTitle).toBeVisible();
            await expect(dailyDetailPage.dateTitle).toContainText("2026-02-08");
        });

        test("날짜 타이틀에 요일이 함께 표시되어야 한다", async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
            await expect(dailyDetailPage.dateTitle).toContainText(/월|화|수|목|금|토|일/);
        });

        test("식별자 Badge가 표시되어야 한다", async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
            await expect(dailyDetailPage.identifierBadge).toBeVisible();
            await expect(dailyDetailPage.identifierBadge).toContainText("work");
        });

        test("자동 생성일 정보가 표시되어야 한다", async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
            await expect(dailyDetailPage.generatedDate).toBeVisible();
            await expect(dailyDetailPage.generatedDate).toContainText("2026-02-11");
        });

        test("목록으로 돌아가기 링크가 표시되어야 한다", async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
            await expect(dailyDetailPage.backToListLink).toBeVisible();
        });

        test("목록 링크 클릭 시 /daily 페이지로 이동해야 한다", async ({ page }) => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
            await dailyDetailPage.clickBackToList();
            await page.waitForURL("/daily");
            expect(page.url()).toContain("/daily");
        });

        test("이전 일지 네비게이션 버튼이 표시되어야 한다", async () => {
            await dailyDetailPage.navigateToDailyDetail("side/2026-02-08");
            await dailyDetailPage.expectNavigationButtonsVisible();
        });

        test("다음 일지 네비게이션 버튼이 표시되어야 한다", async () => {
            await dailyDetailPage.navigateToDailyDetail("side/2026-02-08");
            await dailyDetailPage.expectNavigationButtonsVisible();
        });

        test("첫 번째 일지에서 이전 버튼이 비활성화되어야 한다", async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
            await dailyDetailPage.expectPrevButtonDisabled();
        });

        test("마지막 일지에서 다음 버튼이 비활성화되어야 한다", async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-10");
            await dailyDetailPage.expectNextButtonDisabled();
        });

        test("이전 버튼 클릭 시 이전 일지로 이동해야 한다", async ({ page }) => {
            await dailyDetailPage.navigateToDailyDetail("side/2026-02-08");
            await dailyDetailPage.clickPrevDaily();
            await page.waitForURL(/\/daily\/work\/2026-02-08/);
            expect(page.url()).toContain("work/2026-02-08");
        });

        test("다음 버튼 클릭 시 다음 일지로 이동해야 한다", async ({ page }) => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
            await dailyDetailPage.clickNextDaily();
            await page.waitForURL(/\/daily\/side\/2026-02-08/);
            expect(page.url()).toContain("side/2026-02-08");
        });
    });

    test.describe("3-2. 전체 통계 카드", () => {
        test.beforeEach(async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
        });

        test("4개의 통계 카드가 표시되어야 한다", async () => {
            await expect(dailyDetailPage.statsCards).toHaveCount(4);
        });

        test("총 세션 수 카드가 표시되어야 한다", async () => {
            await expect(dailyDetailPage.totalSessionsCard).toBeVisible();
            await expect(dailyDetailPage.totalSessionsCard).toContainText("102");
        });

        test("총 도구 호출 카드가 표시되어야 한다", async () => {
            await expect(dailyDetailPage.totalToolCallsCard).toBeVisible();
            await expect(dailyDetailPage.totalToolCallsCard).toContainText("1600");
        });

        test("작업 시간대 카드가 표시되어야 한다", async () => {
            await expect(dailyDetailPage.workingHoursCard).toBeVisible();
            await expect(dailyDetailPage.workingHoursCard).toContainText(/13:53|00:22/);
        });

        test("프로젝트 수 카드가 표시되어야 한다", async () => {
            await expect(dailyDetailPage.projectCountCard).toBeVisible();
            await expect(dailyDetailPage.projectCountCard).toContainText("4");
        });

        test("프로젝트별 세션 수 테이블이 표시되어야 한다", async () => {
            await dailyDetailPage.expectProjectSessionsTableVisible();
        });
    });

    test.describe("3-3. 기술 스택 섹션", () => {
        test.beforeEach(async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
        });

        test("기술 스택 카드가 표시되어야 한다", async () => {
            await expect(dailyDetailPage.techStackSection).toBeVisible();
        });

        test("Languages 서브 섹션이 표시되어야 한다", async () => {
            await dailyDetailPage.expectTechStackSectionVisible();
            await expect(dailyDetailPage.languagesBadges.first()).toContainText(/TypeScript|Python/);
        });

        test("Frameworks 서브 섹션이 표시되어야 한다", async () => {
            await expect(dailyDetailPage.frameworksBadges.first()).toContainText(/Astro|React|Tailwind/);
        });

        test("Tools 서브 섹션이 표시되어야 한다", async () => {
            await expect(dailyDetailPage.toolsBadges.first()).toContainText(/Git|npm/);
        });

        test("각 기술 스택 항목이 Badge 형태로 표시되어야 한다", async () => {
            const badge = dailyDetailPage.languagesBadges.first();
            const className = await badge.getAttribute("class");
            expect(className).toMatch(/badge|Badge/i);
        });
    });

    test.describe("3-4. 클로드 코드 활용 방식 섹션", () => {
        test.beforeEach(async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
        });

        test("클로드 코드 활용 방식 카드가 표시되어야 한다", async () => {
            await dailyDetailPage.expectClaudeUsageSectionVisible();
        });

        test("사용한 모드 서브 섹션이 표시되어야 한다", async () => {
            await expect(dailyDetailPage.modesSubSection).toBeVisible();
        });

        test("각 모드의 퍼센티지가 Progress 바로 표시되어야 한다", async () => {
            await dailyDetailPage.expectProgressBarsVisible();
        });

        test("활용한 기능 서브 섹션이 표시되어야 한다", async () => {
            await expect(dailyDetailPage.featuresSubSection).toBeVisible();
        });

        test("작업 위임 스타일 서브 섹션이 표시되어야 한다", async () => {
            await expect(dailyDetailPage.delegationStyleSubSection).toBeVisible();
        });
    });

    test.describe("3-5. 프롬프트 패턴 섹션", () => {
        test.beforeEach(async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
        });

        test("프롬프트 패턴 카드가 표시되어야 한다", async () => {
            await dailyDetailPage.expectPromptPatternsSectionVisible();
        });

        test("효과적이었던 프롬프트 서브 섹션이 표시되어야 한다", async () => {
            await expect(dailyDetailPage.effectivePromptsSubSection).toBeVisible();
        });

        test("대화 흐름 서브 섹션이 표시되어야 한다", async () => {
            await expect(dailyDetailPage.conversationFlowSubSection).toBeVisible();
        });

        test("각 대화 흐름 타입의 설명이 표시되어야 한다", async () => {
            await expect(dailyDetailPage.conversationFlowSubSection).toContainText(/단발 요청|연속 대화/);
        });
    });

    test.describe("3-6. 도구 활용 통계 테이블", () => {
        test.beforeEach(async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
        });

        test("도구 활용 통계 테이블이 표시되어야 한다", async () => {
            await dailyDetailPage.expectToolStatsTableVisible();
        });

        test("테이블에 도구명, 사용 횟수, 주요 용도 컬럼이 있어야 한다", async () => {
            const table = dailyDetailPage.toolStatsTable;
            await expect(table).toContainText("도구명");
            await expect(table).toContainText("사용 횟수");
            await expect(table).toContainText("주요 용도");
        });

        test("사용 횟수가 내림차순으로 정렬되어야 한다", async () => {
            const firstRow = dailyDetailPage.toolStatsRows.first();
            await expect(firstRow).toContainText("Read");
            await expect(firstRow).toContainText("394");
        });

        test("사용 횟수 셀에 비율 Bar가 표시되어야 한다", async ({ page }) => {
            const progressBar = page.locator("[role='table'] [role='progressbar'], [role='table'] .progress-bar");
            await expect(progressBar.first()).toBeVisible();
        });
    });

    test.describe("3-7. 작업 유형 분포", () => {
        test.beforeEach(async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
        });

        test("작업 유형 섹션이 표시되어야 한다", async () => {
            await dailyDetailPage.expectTaskTypeSectionVisible();
        });

        test("각 작업 유형이 카드 형태로 표시되어야 한다", async () => {
            await expect(dailyDetailPage.taskTypeCards.first()).toBeVisible();
        });

        test("각 카드에 lucide-react 아이콘이 표시되어야 한다", async ({ page }) => {
            const icon = page.locator("[role='region'][aria-label*='작업 유형'] svg[class*='lucide']");
            await expect(icon.first()).toBeVisible();
        });

        test("각 카드에 타입명, 건수, 설명이 표시되어야 한다", async () => {
            const firstCard = dailyDetailPage.taskTypeCards.first();
            await expect(firstCard).toContainText(/Coding|Refactoring|Planning/);
            await expect(firstCard).toContainText(/\d+회/);
        });
    });

    test.describe("3-8. 세션 상세", () => {
        test.beforeEach(async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
        });

        test("세션 상세 아코디언이 표시되어야 한다", async () => {
            await dailyDetailPage.expectSessionAccordionVisible();
        });

        test("각 아코디언 아이템에 세션 그룹명이 표시되어야 한다", async () => {
            const firstItem = dailyDetailPage.accordionItems.first();
            await expect(firstItem).toContainText(/자동화 블로그 인프라 구축/);
        });

        test("각 아코디언 아이템에 시작 시간과 작업 유형 태그가 표시되어야 한다", async () => {
            const firstItem = dailyDetailPage.accordionItems.first();
            await expect(firstItem).toContainText(/04:53/);
            await expect(firstItem).toContainText(/Coding|Planning/);
        });

        test("첫 번째 아코디언 아이템이 기본으로 펼쳐져 있어야 한다", async () => {
            await dailyDetailPage.expectFirstAccordionExpanded();
        });

        test("아코디언 클릭 시 펼침/접힘 상태가 토글되어야 한다", async () => {
            const secondItem = dailyDetailPage.accordionItems.nth(1);
            const initialState = await secondItem.getAttribute("data-state");

            await dailyDetailPage.clickAccordionItem(1);
            await secondItem.waitFor({ state: "visible" });

            const newState = await secondItem.getAttribute("data-state");
            expect(newState).not.toBe(initialState);
        });

        test("펼쳐진 아코디언에 활용 방식이 표시되어야 한다", async () => {
            const firstItem = dailyDetailPage.firstAccordionItem;
            await expect(firstItem).toContainText(/대화형 요구사항 분석/);
        });

        test("펼쳐진 아코디언에 주요 작업이 표시되어야 한다", async () => {
            const firstItem = dailyDetailPage.firstAccordionItem;
            await expect(firstItem).toContainText(/트렌드 수집 파이프라인/);
        });

        test("펼쳐진 아코디언에 수정 규모가 표시되어야 한다", async () => {
            const firstItem = dailyDetailPage.firstAccordionItem;
            await expect(firstItem).toContainText(/45개 파일/);
        });
    });

    test.describe("3-9. 학습 인사이트", () => {
        test.beforeEach(async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
        });

        test("학습 인사이트 카드가 표시되어야 한다", async () => {
            await dailyDetailPage.expectLearningInsightsSectionVisible();
        });

        test("각 인사이트 항목 앞에 Lightbulb 아이콘이 표시되어야 한다", async ({ page }) => {
            const icon = page.locator("[role='region'][aria-label*='학습 인사이트'] svg[class*='lucide']");
            await expect(icon.first()).toBeVisible();
        });

        test("각 인사이트의 볼드 텍스트가 강조 표시되어야 한다", async () => {
            const firstInsight = dailyDetailPage.insightItems.first();
            const boldText = firstInsight.locator("strong, b, [class*='font-semibold']");
            await expect(boldText.first()).toBeVisible();
        });
    });

    test.describe("3-10. 워크플로우 패턴", () => {
        test.beforeEach(async () => {
            await dailyDetailPage.navigateToDailyDetail("work/2026-02-08");
        });

        test("워크플로우 패턴 카드가 표시되어야 한다", async () => {
            await dailyDetailPage.expectWorkflowPatternsSectionVisible();
        });

        test("각 패턴이 번호 리스트로 표시되어야 한다", async () => {
            const firstPattern = dailyDetailPage.patternItems.first();
            await expect(firstPattern).toBeVisible();
        });

        test("각 패턴의 이름이 강조 표시되어야 한다", async () => {
            const firstPattern = dailyDetailPage.patternItems.first();
            await expect(firstPattern).toContainText(/탐색 → 수정 → 검증/);
        });

        test("각 패턴의 흐름이 Badge로 표시되어야 한다", async () => {
            const firstPattern = dailyDetailPage.patternItems.first();
            const badge = firstPattern.locator("[role='badge'], .badge");
            await expect(badge.first()).toBeVisible();
        });
    });

    test.describe("3-11. 로딩 및 에러 상태", () => {
        test("데이터 로딩 중 각 섹션에 Skeleton이 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/work/2026-02-08.md", async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await route.fulfill({
                    status: 200,
                    contentType: "text/markdown",
                    body: MOCK_MARKDOWN_FILES["work/2026-02-08"]
                });
            });

            const loadingPage = new DailyDetailPage(newPage);
            await loadingPage.navigateToDailyDetail("work/2026-02-08");
            await loadingPage.expectLoadingState();

            await newPage.close();
        });

        test("파일을 불러올 수 없는 경우 에러 Alert이 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/work/2026-02-08.md", (route) =>
                route.abort("failed")
            );

            const errorPage = new DailyDetailPage(newPage);
            await errorPage.navigateToDailyDetail("work/2026-02-08");
            await errorPage.expectErrorState();

            await newPage.close();
        });

        test("존재하지 않는 파일명 접근 시 404 메시지가 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/unknown/2026-12-31.md", (route) =>
                route.fulfill({
                    status: 404,
                    contentType: "application/json",
                    body: JSON.stringify({ error: "Not Found" })
                })
            );

            const notFoundPage = new DailyDetailPage(newPage);
            await notFoundPage.navigateToDailyDetail("unknown/2026-12-31");
            await notFoundPage.expectNotFoundState();

            await newPage.close();
        });

        test("404 상태에 목록으로 돌아가기 버튼이 표시되어야 한다", async ({ page }) => {
            const newPage = await page.context().newPage();

            await newPage.route("**/data/unknown/invalid.md", (route) =>
                route.fulfill({ status: 404 })
            );

            await newPage.goto("/daily/unknown/invalid");
            await expect(newPage.getByRole("link", { name: /목록/i })).toBeVisible();

            await newPage.close();
        });
    });
});
