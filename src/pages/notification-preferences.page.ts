import type { Locator, Page } from "@playwright/test";
import { Route } from "../config/routes.js";
import { BasePage } from "./base.page.js";

export class NotificationPreferencesPage extends BasePage {
  readonly path = Route.NOTIFICATION_PREFERENCES;

  readonly saveButton: Locator;
  readonly switches: Locator;

  constructor(page: Page) {
    super(page);
    this.saveButton = page.getByRole("button", {
      name: /save|зберегти/i,
    });
    this.switches = page.getByRole("switch");
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async toggleSwitch(index: number): Promise<void> {
    const sw = this.switches.nth(index);
    await sw.click();
  }
}
