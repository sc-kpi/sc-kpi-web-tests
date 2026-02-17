import type { Locator, Page } from "@playwright/test";
import { Route } from "../config/routes.js";
import { BasePage } from "./base.page.js";

export class Verify2faPage extends BasePage {
  readonly path = Route.VERIFY_2FA;

  readonly codeInput: Locator;
  readonly submitButton: Locator;
  readonly recoveryCodeLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.codeInput = page.getByLabel(/code|код/i);
    this.submitButton = page.getByRole("button", { name: /verify|підтвердити/i });
    this.recoveryCodeLink = page.getByRole("link", {
      name: /recovery|відновлення|backup|резервн/i,
    });
    this.errorMessage = page.locator('[role="alert"]:not(#__next-route-announcer__)');
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async enterCode(code: string): Promise<void> {
    await this.codeInput.fill(code);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
