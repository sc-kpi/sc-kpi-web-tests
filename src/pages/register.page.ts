import type { Locator, Page } from "@playwright/test";
import { Route } from "../config/routes.js";
import { BasePage } from "./base.page.js";

export class RegisterPage extends BasePage {
  readonly path = Route.REGISTER;

  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByLabel(/name|ім'я/i);
    this.emailInput = page.getByLabel(/email|пошта/i);
    this.passwordInput = page.getByLabel(/^password$|^пароль$/i);
    this.confirmPasswordInput = page.getByLabel(/confirm|підтвердження/i);
    this.submitButton = page.getByRole("button", { name: /register|зареєструватися/i });
    this.errorMessage = page.getByRole("alert");
    this.loginLink = page.getByRole("link", { name: /login|увійти/i });
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async register(name: string, email: string, password: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.submitButton.click();
  }
}
