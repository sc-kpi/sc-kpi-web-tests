import type { Locator, Page } from "@playwright/test";
import { Route } from "../../config/routes.js";
import { BasePage } from "../base.page.js";

export class UserDetailPage extends BasePage {
  readonly path: string;

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly saveButton: Locator;
  readonly tierSelect: Locator;
  readonly statusBadge: Locator;
  readonly toggleStatusButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page, userId?: string) {
    super(page);
    this.path = `${Route.ADMIN}/users/${userId ?? ""}`;
    this.firstNameInput = page.getByLabel(/first name|ім'я/i);
    this.lastNameInput = page.getByLabel(/last name|прізвище/i);
    this.saveButton = page.getByRole("button", { name: /save|зберегти/i });
    this.tierSelect = page.getByLabel(/tier|рівень/i);
    this.statusBadge = page.locator('[data-testid="status-badge"]');
    this.toggleStatusButton = page.getByRole("button", {
      name: /activate|deactivate|активувати|деактивувати/i,
    });
    this.deleteButton = page.getByRole("button", { name: /delete|видалити/i });
  }

  async updateProfile(firstName: string, lastName: string): Promise<void> {
    await this.firstNameInput.clear();
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.clear();
    await this.lastNameInput.fill(lastName);
    await this.saveButton.click();
  }

  async changeTier(tier: string): Promise<void> {
    await this.tierSelect.selectOption(tier);
  }

  async toggleStatus(): Promise<void> {
    await this.toggleStatusButton.click();
  }

  async getCurrentTier(): Promise<string> {
    return (await this.tierSelect.inputValue()) ?? "";
  }

  async isActive(): Promise<boolean> {
    const text = (await this.statusBadge.textContent()) ?? "";
    return /active|активний/i.test(text);
  }
}
