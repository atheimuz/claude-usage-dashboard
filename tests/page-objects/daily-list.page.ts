import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class DailyListPage extends BasePage {
    // Page Header
    readonly pageTitle: Locator;
    readonly pageSubtitle: Locator;
    readonly viewToggle: Locator;
    readonly listViewButton: Locator;
    readonly calendarViewButton: Locator;

    // List View
    readonly listView: Locator;
    readonly listCards: Locator;
    readonly dateHeadings: Locator;

    // Calendar View
    readonly calendarView: Locator;
    readonly monthNavigation: Locator;
    readonly prevMonthButton: Locator;
    readonly nextMonthButton: Locator;
    readonly currentMonth: Locator;
    readonly calendarGrid: Locator;
    readonly calendarDates: Locator;
    readonly highlightedDates: Locator;
    readonly todayDate: Locator;

    // Loading States
    readonly skeletonCards: Locator;
    readonly skeletonGrid: Locator;

    // Empty State
    readonly emptyStateMessage: Locator;

    constructor(page: Page) {
        super(page);

        // Page Header
        this.pageTitle = page.getByRole("heading", { name: "Daily Logs", level: 1 });
        this.pageSubtitle = page.getByText(/날짜별 클로드 코드 사용 일지/i);
        this.viewToggle = page.getByRole("group", { name: /view toggle|뷰 전환/i });
        this.listViewButton = page.getByRole("button", { name: /list|리스트/i });
        this.calendarViewButton = page.getByRole("button", { name: /calendar|달력/i });

        // List View
        this.listView = page.locator("[data-view='list'], .list-view");
        this.listCards = page.locator("[role='article'][data-type='daily-log'], .daily-log-card");
        this.dateHeadings = page.getByRole("heading", { name: /2026-\d{2}-\d{2}/i });

        // Calendar View
        this.calendarView = page.locator("[data-view='calendar'], .calendar-view");
        this.monthNavigation = page.locator("[role='navigation'][aria-label*='month'], .month-nav");
        this.prevMonthButton = page.getByRole("button", { name: /previous|이전/i });
        this.nextMonthButton = page.getByRole("button", { name: /next|다음/i });
        this.currentMonth = page.locator("[aria-label*='current month'], .current-month");
        this.calendarGrid = page.locator("[role='grid'], .calendar-grid");
        this.calendarDates = this.calendarGrid.locator("[role='gridcell'], .calendar-date");
        this.highlightedDates = this.calendarGrid.locator("[data-has-data='true'], .has-data");
        this.todayDate = this.calendarGrid.locator("[data-today='true'], .today");

        // Loading States
        this.skeletonCards = page.locator(".skeleton, [aria-busy='true']");
        this.skeletonGrid = page.locator(".skeleton-grid, [aria-busy='true'][role='grid']");

        // Empty State
        this.emptyStateMessage = page.getByText(/기록된 사용 일지가 없습니다/i);
    }

    async navigateToDailyList() {
        await this.navigate("/daily");
    }

    async expectPageHeaderVisible() {
        await expect(this.pageTitle).toBeVisible();
        await expect(this.pageSubtitle).toBeVisible();
        await expect(this.viewToggle).toBeVisible();
    }

    async expectListViewVisible() {
        await expect(this.listView).toBeVisible();
        await expect(this.listCards.first()).toBeVisible();
    }

    async expectCalendarViewVisible() {
        await expect(this.calendarView).toBeVisible();
        await expect(this.monthNavigation).toBeVisible();
        await expect(this.calendarGrid).toBeVisible();
    }

    async switchToCalendarView() {
        await this.calendarViewButton.click();
    }

    async switchToListView() {
        await this.listViewButton.click();
    }

    async clickListCard(index: number = 0) {
        await this.listCards.nth(index).click();
    }

    async clickDateInCalendar(date: string) {
        const dateCell = this.calendarGrid.locator(`[data-date='${date}']`);
        await dateCell.click();
    }

    async navigateToNextMonth() {
        await this.nextMonthButton.click();
    }

    async navigateToPrevMonth() {
        await this.prevMonthButton.click();
    }

    async expectDateGrouping(date: string) {
        const heading = this.page.getByRole("heading", { name: new RegExp(date, "i") });
        await expect(heading).toBeVisible();
    }

    async expectHighlightedDatesCount(count: number) {
        await expect(this.highlightedDates).toHaveCount(count);
    }

    async expectTodayHighlighted() {
        await expect(this.todayDate).toBeVisible();
    }

    async expectLoadingState() {
        await expect(this.skeletonCards.first()).toBeVisible();
    }

    async expectEmptyState() {
        await expect(this.emptyStateMessage).toBeVisible();
    }

    async getCardInfo(index: number) {
        const card = this.listCards.nth(index);
        const date = await card.locator("[data-date]").textContent();
        const identifier = await card.locator("[data-identifier]").textContent();
        const sessions = await card.locator("[data-sessions]").textContent();
        return { date, identifier, sessions };
    }
}
