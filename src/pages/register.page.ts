import type { Locator, Page } from "@playwright/test";
import { Route } from "../config/routes.js";
import { BasePage } from "./base.page.js";

export class RegisterPage extends BasePage {
  readonly path = Route.REGISTER;

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByLabel(/first name|ім'я/i);
    this.lastNameInput = page.getByLabel(/last name|прізвище/i);
    this.emailInput = page.getByLabel(/email|пошта/i);
    this.passwordInput = page.getByLabel(/password|пароль/i);
    this.submitButton = page.getByRole("button", { name: /sign up|реєстрація/i });
    this.errorMessage = page.getByRole("alert");
    this.loginLink = page.getByRole("link", { name: /log in|увійти/i });
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
