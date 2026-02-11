import type { Locator, Page } from "@playwright/test";

export abstract class BasePage {
  readonly page: Page;
  abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
  }

  get heading(): Locator {
    return this.page.getByRole("heading", { level: 1 });
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.path);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }
}
