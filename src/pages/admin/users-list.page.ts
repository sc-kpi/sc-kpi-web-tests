import type { Locator, Page } from "@playwright/test";
import { Route } from "../../config/routes.js";
import { BasePage } from "../base.page.js";

export class UsersListPage extends BasePage {
  readonly path = `${Route.ADMIN}/users`;

  readonly createButton: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    super(page);
    this.createButton = page.getByRole("button", { name: /create|створити/i });
    this.table = page.getByRole("table");
    this.tableRows = this.table.getByRole("row");
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }

  getUserRow(name: string): Locator {
    return this.table.getByRole("row", { name: new RegExp(name, "i") });
  }

  async clickEditUser(name: string): Promise<void> {
    const row = this.getUserRow(name);
    await row.getByRole("link", { name: /edit|редагувати|details|деталі/i }).click();
  }

  async getUserCount(): Promise<number> {
    // Subtract 1 for the header row
    const count = await this.tableRows.count();
    return Math.max(0, count - 1);
  }
}
