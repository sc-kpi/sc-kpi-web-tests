import type { Locator, Page } from "@playwright/test";
import { Route } from "../../config/routes.js";
import { BasePage } from "../base.page.js";

export class AuditLogsPage extends BasePage {
  readonly path = Route.ADMIN_AUDIT_LOGS;

  readonly table: Locator;
  readonly tableRows: Locator;
  readonly entityTypeFilter: Locator;
  readonly actionFilter: Locator;
  readonly sourceModuleFilter: Locator;
  readonly searchInput: Locator;
  readonly applyButton: Locator;
  readonly resetButton: Locator;
  readonly exportButton: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    super(page);
    this.table = page.getByRole("table");
    this.tableRows = this.table.getByRole("row");
    this.entityTypeFilter = page.getByLabel(/entity type|тип сутності/i);
    this.actionFilter = page.getByLabel(/action|дія/i);
    this.sourceModuleFilter = page.getByLabel(/module|модуль/i);
    this.searchInput = page.getByPlaceholder(/search|пошук/i);
    this.applyButton = page.getByRole("button", { name: /apply|застосувати/i });
    this.resetButton = page.getByRole("button", { name: /reset|скинути/i });
    this.exportButton = page.getByRole("button", { name: /export|експорт/i });
    this.previousButton = page.getByRole("button", { name: /previous|попередня/i });
    this.nextButton = page.getByRole("button", { name: /next|наступна/i });
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
    await this.table.waitFor({ state: "visible", timeout: 15000 });
  }

  async getRowCount(): Promise<number> {
    await this.table.waitFor({ state: "visible", timeout: 15000 });
    const count = await this.tableRows.count();
    return Math.max(0, count - 1); // Subtract 1 for header
  }

  async selectEntityType(value: string): Promise<void> {
    await this.entityTypeFilter.selectOption(value);
  }

  async selectAction(value: string): Promise<void> {
    await this.actionFilter.selectOption(value);
  }

  async search(text: string): Promise<void> {
    await this.searchInput.fill(text);
  }
}
