import { Page, Locator } from "@playwright/test";

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigate(path: string) {
        await this.page.goto(path);
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState("networkidle");
    }

    async waitForSelector(selector: string) {
        await this.page.waitForSelector(selector);
    }
}
