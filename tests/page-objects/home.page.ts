import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class HomePage extends BasePage {
    // Header
    readonly serviceName: Locator;
    readonly darkModeToggle: Locator;
    readonly dashboardLink: Locator;
    readonly weeklyLogsLink: Locator;

    // Stats Cards
    readonly statsCards: Locator;
    readonly activeDaysCard: Locator;
    readonly totalSessionsCard: Locator;
    readonly totalToolCallsCard: Locator;
    readonly totalProjectsCard: Locator;

    // Charts
    readonly toolUsageChart: Locator;
    readonly taskTypeChart: Locator;
    readonly trendChart: Locator;

    // Tech Stack
    readonly techStackSection: Locator;
    readonly techStackBadges: Locator;

    // Recent Activity
    readonly recentActivitySection: Locator;
    readonly recentActivityCards: Locator;
    readonly viewAllLink: Locator;

    // Loading States
    readonly skeletonCards: Locator;

    // Error States
    readonly errorAlert: Locator;
    readonly retryButton: Locator;

    // Empty State
    readonly emptyStateMessage: Locator;

    constructor(page: Page) {
        super(page);

        // Header
        this.serviceName = page.getByRole("link", { name: /Claude Usage Dashboard/i });
        this.darkModeToggle = page.getByRole("button", { name: /dark mode|light mode/i });
        this.dashboardLink = page.getByRole("link", { name: "Dashboard" });
        this.weeklyLogsLink = page.getByRole("link", { name: "Weekly Logs" });

        // Stats Cards - role 기반 접근
        this.statsCards = page.getByRole("region", { name: /stats|통계/i }).locator("[role='article']");
        this.activeDaysCard = page.getByText(/활동 일수/i).locator("..");
        this.totalSessionsCard = page.getByText(/총 세션 수/i).locator("..");
        this.totalToolCallsCard = page.getByText(/총 도구 호출/i).locator("..");
        this.totalProjectsCard = page.getByText(/프로젝트 수/i).locator("..");

        // Charts
        this.toolUsageChart = page.locator("[data-slot='card']").filter({ hasText: "도구 활용 통계" });
        this.taskTypeChart = page.locator("[data-slot='card']").filter({ hasText: "작업 유형" });
        this.trendChart = page.getByRole("region", { name: /일별 활동 추이/i });

        // Tech Stack
        this.techStackSection = page.getByRole("region", { name: /기술 스택/i });
        this.techStackBadges = this.techStackSection.locator("[role='badge'], .badge");

        // Recent Activity
        this.recentActivitySection = page.getByRole("region", { name: /최근 활동/i });
        this.recentActivityCards = this.recentActivitySection.locator("[role='article']");
        this.viewAllLink = page.getByRole("link", { name: /전체 보기/i });

        // Loading States
        this.skeletonCards = page.locator(".skeleton, [aria-busy='true']");

        // Error States
        this.errorAlert = page.getByRole("alert");
        this.retryButton = page.getByRole("button", { name: /다시 시도/i });

        // Empty State
        this.emptyStateMessage = page.getByText(/아직 기록된 사용 일지가 없습니다/i);
    }

    async navigateToHome() {
        await this.navigate("/");
    }

    async expectHeaderVisible() {
        await expect(this.serviceName).toBeVisible();
        await expect(this.darkModeToggle).toBeVisible();
        await expect(this.dashboardLink).toBeVisible();
        await expect(this.weeklyLogsLink).toBeVisible();
    }

    async expectStatsCardsVisible() {
        await expect(this.statsCards.first()).toBeVisible();
        await expect(this.activeDaysCard).toBeVisible();
        await expect(this.totalSessionsCard).toBeVisible();
        await expect(this.totalToolCallsCard).toBeVisible();
        await expect(this.totalProjectsCard).toBeVisible();
    }

    async expectChartsVisible() {
        await expect(this.toolUsageChart).toBeVisible();
        await expect(this.taskTypeChart).toBeVisible();
        await expect(this.trendChart).toBeVisible();
    }

    async expectTechStackVisible() {
        await expect(this.techStackSection).toBeVisible();
        await expect(this.techStackBadges.first()).toBeVisible();
    }

    async expectRecentActivityVisible() {
        await expect(this.recentActivitySection).toBeVisible();
        await expect(this.recentActivityCards.first()).toBeVisible();
        await expect(this.viewAllLink).toBeVisible();
    }

    async expectLoadingState() {
        await expect(this.skeletonCards.first()).toBeVisible();
    }

    async expectErrorState() {
        await expect(this.errorAlert).toBeVisible();
        await expect(this.retryButton).toBeVisible();
    }

    async expectEmptyState() {
        await expect(this.emptyStateMessage).toBeVisible();
    }

    async clickViewAll() {
        await this.viewAllLink.click();
    }

    async clickRecentActivityCard(index: number = 0) {
        await this.recentActivityCards.nth(index).click();
    }

    async toggleDarkMode() {
        await this.darkModeToggle.click();
    }

    async getStatValue(cardName: string): Promise<string> {
        const card = this.page.getByText(cardName).locator("..");
        return await card.locator("text=/\\d+/").first().textContent() || "";
    }
}
