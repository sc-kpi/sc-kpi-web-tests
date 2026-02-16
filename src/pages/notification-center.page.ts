import type { Locator, Page } from "@playwright/test";
import { Route } from "../config/routes.js";
import { BasePage } from "./base.page.js";

export class NotificationCenterPage extends BasePage {
  readonly path = Route.NOTIFICATIONS;

  readonly markAllReadButton: Locator;
  readonly categoryTabs: Locator;
  readonly notificationItems: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.markAllReadButton = page.getByRole("button", {
      name: /mark all|позначити всі/i,
    });
    this.categoryTabs = page.getByRole("tablist");
    this.notificationItems = page.locator("[class*='border'][class*='rounded']");
    this.previousButton = page.getByRole("button", {
      name: /previous|попередня/i,
    });
    this.nextButton = page.getByRole("button", { name: /next|наступна/i });
    this.emptyState = page.getByText(/no notification|немає сповіщень/i);
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async selectCategory(name: string): Promise<void> {
    await this.page.getByRole("tab", { name }).click();
  }
}
