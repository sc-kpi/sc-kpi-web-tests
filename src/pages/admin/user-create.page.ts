import type { Locator, Page } from "@playwright/test";
import { Route } from "../../config/routes.js";
import { BasePage } from "../base.page.js";

export class UserCreatePage extends BasePage {
  readonly path = `${Route.ADMIN}/users/new`;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly tierSelect: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(/email|пошта/i);
    this.passwordInput = page.getByLabel(/password|пароль/i);
    this.firstNameInput = page.getByLabel(/first name|ім'я/i);
    this.lastNameInput = page.getByLabel(/last name|прізвище/i);
    this.tierSelect = page.getByLabel(/tier|рівень/i);
    this.submitButton = page.getByRole("button", { name: /create|створити|submit|додати/i });
  }

  async fillForm(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tier?: string;
  }): Promise<void> {
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    if (data.tier) {
      await this.tierSelect.selectOption(data.tier);
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }
}
