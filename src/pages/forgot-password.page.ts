import type { Locator, Page } from "@playwright/test";
import { Route } from "../config/routes.js";
import { BasePage } from "./base.page.js";

export class ForgotPasswordPage extends BasePage {
  readonly path = Route.FORGOT_PASSWORD;

  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly successAlert: Locator;
  readonly errorMessage: Locator;
  readonly backToLoginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(/email|пошта/i);
    this.submitButton = page.getByRole("button", { name: /send|надіслати|reset|відновити/i });
    this.successAlert = page.locator('[class*="bg-primary/"]');
    this.errorMessage = page.locator('[role="alert"]:not(#__next-route-announcer__)');
    this.backToLoginLink = page.getByRole("link", {
      name: /log in|увійти|back|назад|повернутися/i,
    });
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async submitForgotPassword(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }
}
