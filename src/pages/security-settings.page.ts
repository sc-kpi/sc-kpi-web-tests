import type { Locator, Page } from "@playwright/test";
import { Route } from "../config/routes.js";
import { BasePage } from "./base.page.js";

export class SecuritySettingsPage extends BasePage {
  readonly path = Route.SECURITY;

  readonly enableButton: Locator;
  readonly disableButton: Locator;
  readonly status: Locator;
  readonly qrCode: Locator;
  readonly secretKey: Locator;
  readonly confirmButton: Locator;
  readonly codeInput: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.enableButton = page.getByRole("button", { name: /enable.*2fa|увімкнути.*2fa/i });
    this.disableButton = page.getByRole("button", { name: /disable.*2fa|вимкнути.*2fa/i });
    this.status = page.getByTestId("2fa-status");
    this.qrCode = page.locator('[data-testid="2fa-qr-code"], canvas, img[alt*="QR"]');
    this.secretKey = page.getByTestId("2fa-secret-key");
    this.confirmButton = page.getByRole("button", { name: /confirm|підтвердити/i });
    this.codeInput = page.getByLabel(/code|код/i);
    this.successMessage = page.getByText(
      /2fa.*enabled|2fa.*disabled|2fa.*увімкнено|2fa.*вимкнено/i,
    );
    this.errorMessage = page.locator('[role="alert"]:not(#__next-route-announcer__)');
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async getSecretKeyText(): Promise<string> {
    const text = await this.secretKey.textContent();
    if (!text) {
      throw new Error("Secret key not found on page");
    }
    return text.trim();
  }

  async enableTwoFactor(code: string): Promise<void> {
    await this.codeInput.fill(code);
    await this.confirmButton.click();
  }

  async disableTwoFactor(code: string): Promise<void> {
    await this.codeInput.fill(code);
    await this.confirmButton.click();
  }
}
