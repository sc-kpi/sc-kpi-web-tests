import type { Locator, Page } from "@playwright/test";
import { Route } from "../config/routes.js";
import { BasePage } from "./base.page.js";

export class ResetPasswordPage extends BasePage {
  readonly path = Route.RESET_PASSWORD;

  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly backToLoginLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    this.newPasswordInput = page.getByLabel(/^new password$|^новий пароль$/i);
    this.confirmPasswordInput = page.getByLabel(/confirm.*password|підтвердити.*пароль/i);
    this.submitButton = page.getByRole("button", {
      name: /reset|скинути|відновити|save|зберегти/i,
    });
    this.successMessage = page.locator('[class*="bg-primary/"]');
    this.errorMessage = page.locator('[role="alert"]:not(#__next-route-announcer__)');
    this.backToLoginLink = page.getByRole("link", {
      name: /log in|увійти|back|назад|повернутися/i,
    });
    this.forgotPasswordLink = page.getByRole("link", {
      name: /forgot|забули|request.*new|запросити/i,
    });
  }

  async goto(token?: string): Promise<void> {
    const url = token ? `${this.path}?token=${token}` : this.path;
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  async resetPassword(newPassword: string, confirmPassword: string): Promise<void> {
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.submitButton.click();
  }
}
