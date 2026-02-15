import type { Locator, Page } from "@playwright/test";
import { Route } from "../../config/routes.js";
import { BasePage } from "../base.page.js";

export class FeatureFlagsListPage extends BasePage {
  readonly path = Route.ADMIN_FEATURE_FLAGS;

  readonly createButton: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    super(page);
    this.createButton = page.getByRole("link", { name: /create|створити/i });
    this.table = page.getByRole("table");
    this.tableRows = this.table.getByRole("row");
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
    await this.table.waitFor({ state: "visible", timeout: 15000 });
  }

  getFlagRow(key: string): Locator {
    return this.table.getByRole("row", { name: new RegExp(key, "i") });
  }

  async clickEditFlag(key: string): Promise<void> {
    const row = this.getFlagRow(key);
    await row.getByRole("link", { name: /edit|редагувати/i }).click();
  }

  async clickToggleFlag(key: string): Promise<void> {
    const row = this.getFlagRow(key);
    await row.getByRole("button", { name: /on|off/i }).click();
  }

  async clickDeleteFlag(key: string): Promise<void> {
    const row = this.getFlagRow(key);
    await row.getByRole("button", { name: /delete|видалити/i }).click();
  }

  async getFlagCount(): Promise<number> {
    await this.table.waitFor({ state: "visible", timeout: 15000 });
    const count = await this.tableRows.count();
    return Math.max(0, count - 1); // Subtract 1 for header
  }
}
