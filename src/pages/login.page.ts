import type { Locator, Page } from "@playwright/test";
import { Route } from "../config/routes.js";
import { BasePage } from "./base.page.js";

export class LoginPage extends BasePage {
  readonly path = Route.LOGIN;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(/email|пошта/i);
    this.passwordInput = page.getByLabel(/password|пароль/i);
    this.submitButton = page.getByRole("button", { name: /log in|увійти/i });
    this.errorMessage = page.getByRole("alert");
    this.registerLink = page.getByRole("link", { name: /sign up|реєстрація/i });
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
