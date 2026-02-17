import type { Locator, Page } from "@playwright/test";
import { Route } from "../../config/routes.js";
import { BasePage } from "../base.page.js";

export class RateLimitsListPage extends BasePage {
  readonly path = Route.ADMIN_RATE_LIMITS;

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

  getRuleRow(name: string): Locator {
    return this.table.getByRole("row", { name: new RegExp(name, "i") });
  }

  async clickEditRule(name: string): Promise<void> {
    const row = this.getRuleRow(name);
    await row.getByRole("link", { name: /edit|редагувати/i }).click({ force: true });
  }

  async clickToggleRule(name: string): Promise<void> {
    const row = this.getRuleRow(name);
    await row.getByRole("button", { name: /on|off/i }).click({ force: true });
  }

  async clickDeleteRule(name: string): Promise<void> {
    const row = this.getRuleRow(name);
    await row.getByRole("button", { name: /delete|видалити/i }).click({ force: true });
  }

  async getRuleCount(): Promise<number> {
    await this.table.waitFor({ state: "visible", timeout: 15000 });
    const count = await this.tableRows.count();
    return Math.max(0, count - 1); // Subtract 1 for header
  }
}
