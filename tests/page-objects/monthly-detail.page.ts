import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class WeeklyDetailPage extends BasePage {
    // Page Header
    readonly dateTitle: Locator;
    readonly identifierBadge: Locator;
    readonly generatedDate: Locator;
    readonly backToListLink: Locator;
    readonly prevWeeklyButton: Locator;
    readonly nextWeeklyButton: Locator;

    // Overview Stats Cards
    readonly statsCards: Locator;
    readonly totalSessionsCard: Locator;
    readonly totalToolCallsCard: Locator;
    readonly workingHoursCard: Locator;
    readonly projectCountCard: Locator;
    readonly projectSessionsTable: Locator;

    // Tech Stack Section
    readonly techStackSection: Locator;
    readonly languagesBadges: Locator;
    readonly frameworksBadges: Locator;
    readonly toolsBadges: Locator;

    // Claude Usage Section
    readonly claudeUsageSection: Locator;
    readonly modesSubSection: Locator;
    readonly featuresSubSection: Locator;
    readonly delegationStyleSubSection: Locator;
    readonly progressBars: Locator;

    // Prompt Patterns Section
    readonly promptPatternsSection: Locator;
    readonly effectivePromptsSubSection: Locator;
    readonly conversationFlowSubSection: Locator;

    // Tool Stats Table
    readonly toolStatsTable: Locator;
    readonly toolStatsRows: Locator;

    // Task Type Grid
    readonly taskTypeSection: Locator;
    readonly taskTypeCards: Locator;

    // Session Details Accordion
    readonly sessionAccordion: Locator;
    readonly accordionItems: Locator;
    readonly firstAccordionItem: Locator;

    // Learning Insights
    readonly learningInsightsSection: Locator;
    readonly insightItems: Locator;

    // Workflow Patterns
    readonly workflowPatternsSection: Locator;
    readonly patternItems: Locator;

    // Loading States
    readonly skeletonCards: Locator;

    // Error States
    readonly errorAlert: Locator;
    readonly notFoundMessage: Locator;

    constructor(page: Page) {
        super(page);

        // Page Header
        this.dateTitle = page.getByRole("heading", { name: /\d{4}년.*\d+주차/i, level: 1 });
        this.identifierBadge = page.locator("[data-identifier-badge], .identifier-badge").first();
        this.generatedDate = page.getByText(/자동 생성:/i);
        this.backToListLink = page.getByRole("link", { name: /목록/i });
        this.prevWeeklyButton = page.getByRole("button", { name: /이전|previous/i }).first();
        this.nextWeeklyButton = page.getByRole("button", { name: /다음|next/i }).first();

        // Overview Stats Cards
        this.statsCards = page.locator("[role='region'][aria-label*='통계'], .stats-cards").locator("[role='article']");
        this.totalSessionsCard = page.getByText(/총 세션 수/i).locator("..");
        this.totalToolCallsCard = page.getByText(/총 도구 호출/i).locator("..");
        this.workingHoursCard = page.getByText(/작업 시간대/i).locator("..");
        this.projectCountCard = page.getByText(/프로젝트 수/i).locator("..");
        this.projectSessionsTable = page.getByRole("table", { name: /프로젝트별 세션/i });

        // Tech Stack Section
        this.techStackSection = page.getByRole("region", { name: /기술 스택/i });
        this.languagesBadges = this.techStackSection.locator("[data-category='languages'], .languages").locator("[role='badge'], .badge");
        this.frameworksBadges = this.techStackSection.locator("[data-category='frameworks'], .frameworks").locator("[role='badge'], .badge");
        this.toolsBadges = this.techStackSection.locator("[data-category='tools'], .tools").locator("[role='badge'], .badge");

        // Claude Usage Section
        this.claudeUsageSection = page.getByRole("region", { name: /클로드 코드 활용 방식/i });
        this.modesSubSection = this.claudeUsageSection.locator("[data-subsection='modes'], .modes-subsection");
        this.featuresSubSection = this.claudeUsageSection.locator("[data-subsection='features'], .features-subsection");
        this.delegationStyleSubSection = this.claudeUsageSection.locator("[data-subsection='delegation'], .delegation-subsection");
        this.progressBars = this.claudeUsageSection.locator("[role='progressbar'], .progress-bar");

        // Prompt Patterns Section
        this.promptPatternsSection = page.getByRole("region", { name: /프롬프트 패턴/i });
        this.effectivePromptsSubSection = this.promptPatternsSection.locator("[data-subsection='effective'], .effective-prompts");
        this.conversationFlowSubSection = this.promptPatternsSection.locator("[data-subsection='flow'], .conversation-flow");

        // Tool Stats Table
        this.toolStatsTable = page.getByRole("table", { name: /도구 활용 통계/i });
        this.toolStatsRows = this.toolStatsTable.locator("tbody tr");

        // Task Type Grid
        this.taskTypeSection = page.getByRole("region", { name: /작업 유형/i });
        this.taskTypeCards = this.taskTypeSection.locator("[role='article'], .task-type-card");

        // Session Details Accordion
        this.sessionAccordion = page.locator("[role='region'][aria-label*='세션'], .session-accordion");
        this.accordionItems = this.sessionAccordion.locator("[data-accordion-item], .accordion-item");
        this.firstAccordionItem = this.accordionItems.first();

        // Learning Insights
        this.learningInsightsSection = page.getByRole("region", { name: /학습 인사이트/i });
        this.insightItems = this.learningInsightsSection.locator("li, .insight-item");

        // Workflow Patterns
        this.workflowPatternsSection = page.getByRole("region", { name: /워크플로우 패턴/i });
        this.patternItems = this.workflowPatternsSection.locator("li, .pattern-item");

        // Loading States
        this.skeletonCards = page.locator(".skeleton, [aria-busy='true']");

        // Error States
        this.errorAlert = page.getByRole("alert");
        this.notFoundMessage = page.getByText(/해당 주차의 일지가 없습니다/i);
    }

    async navigateToWeeklyDetail(filename: string) {
        await this.navigate(`/weekly/${filename}`);
    }

    async expectPageHeaderVisible() {
        await expect(this.dateTitle).toBeVisible();
        await expect(this.identifierBadge).toBeVisible();
        await expect(this.generatedDate).toBeVisible();
        await expect(this.backToListLink).toBeVisible();
    }

    async expectNavigationButtonsVisible() {
        await expect(this.prevWeeklyButton).toBeVisible();
        await expect(this.nextWeeklyButton).toBeVisible();
    }

    async expectPrevButtonDisabled() {
        await expect(this.prevWeeklyButton).toBeDisabled();
    }

    async expectNextButtonDisabled() {
        await expect(this.nextWeeklyButton).toBeDisabled();
    }

    async clickPrevWeekly() {
        await this.prevWeeklyButton.click();
    }

    async clickNextWeekly() {
        await this.nextWeeklyButton.click();
    }

    async clickBackToList() {
        await this.backToListLink.click();
    }

    async expectStatsCardsVisible() {
        await expect(this.totalSessionsCard).toBeVisible();
        await expect(this.totalToolCallsCard).toBeVisible();
        await expect(this.workingHoursCard).toBeVisible();
        await expect(this.projectCountCard).toBeVisible();
    }

    async expectProjectSessionsTableVisible() {
        await expect(this.projectSessionsTable).toBeVisible();
    }

    async expectTechStackSectionVisible() {
        await expect(this.techStackSection).toBeVisible();
        await expect(this.languagesBadges.first()).toBeVisible();
        await expect(this.frameworksBadges.first()).toBeVisible();
        await expect(this.toolsBadges.first()).toBeVisible();
    }

    async expectClaudeUsageSectionVisible() {
        await expect(this.claudeUsageSection).toBeVisible();
        await expect(this.modesSubSection).toBeVisible();
        await expect(this.featuresSubSection).toBeVisible();
        await expect(this.delegationStyleSubSection).toBeVisible();
    }

    async expectProgressBarsVisible() {
        await expect(this.progressBars.first()).toBeVisible();
    }

    async expectPromptPatternsSectionVisible() {
        await expect(this.promptPatternsSection).toBeVisible();
        await expect(this.effectivePromptsSubSection).toBeVisible();
        await expect(this.conversationFlowSubSection).toBeVisible();
    }

    async expectToolStatsTableVisible() {
        await expect(this.toolStatsTable).toBeVisible();
        await expect(this.toolStatsRows.first()).toBeVisible();
    }

    async expectTaskTypeSectionVisible() {
        await expect(this.taskTypeSection).toBeVisible();
        await expect(this.taskTypeCards.first()).toBeVisible();
    }

    async expectSessionAccordionVisible() {
        await expect(this.sessionAccordion).toBeVisible();
        await expect(this.accordionItems.first()).toBeVisible();
    }

    async expectFirstAccordionExpanded() {
        await expect(this.firstAccordionItem).toHaveAttribute("data-state", "open");
    }

    async clickAccordionItem(index: number) {
        await this.accordionItems.nth(index).click();
    }

    async expectLearningInsightsSectionVisible() {
        await expect(this.learningInsightsSection).toBeVisible();
        await expect(this.insightItems.first()).toBeVisible();
    }

    async expectWorkflowPatternsSectionVisible() {
        await expect(this.workflowPatternsSection).toBeVisible();
        await expect(this.patternItems.first()).toBeVisible();
    }

    async expectLoadingState() {
        await expect(this.skeletonCards.first()).toBeVisible();
    }

    async expectErrorState() {
        await expect(this.errorAlert).toBeVisible();
    }

    async expectNotFoundState() {
        await expect(this.notFoundMessage).toBeVisible();
    }

    async getDateTitle(): Promise<string> {
        return await this.dateTitle.textContent() || "";
    }

    async getIdentifier(): Promise<string> {
        return await this.identifierBadge.textContent() || "";
    }

    async getToolStatsRowCount(): Promise<number> {
        return await this.toolStatsRows.count();
    }

    async getTaskTypeCardCount(): Promise<number> {
        return await this.taskTypeCards.count();
    }

    async getAccordionItemCount(): Promise<number> {
        return await this.accordionItems.count();
    }
}
