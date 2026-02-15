import type { Locator, Page } from "@playwright/test";
import { Route } from "../../config/routes.js";
import { BasePage } from "../base.page.js";

export class FeatureFlagCreatePage extends BasePage {
  readonly path = `${Route.ADMIN_FEATURE_FLAGS}/new`;

  readonly keyInput: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly enabledCheckbox: Locator;
  readonly environmentSelect: Locator;
  readonly rolloutInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.keyInput = page.getByLabel(/key|ключ/i);
    this.nameInput = page.getByLabel(/^name$|^назва$/i);
    this.descriptionInput = page.getByLabel(/description|опис/i);
    this.enabledCheckbox = page.getByLabel(/enabled|увімкнено/i);
    this.environmentSelect = page.getByLabel(/environment|середовище/i);
    this.rolloutInput = page.getByLabel(/rollout|розгортання/i);
    this.submitButton = page.getByRole("button", { name: /create|створити/i });
    this.cancelButton = page.getByRole("button", { name: /cancel|скасувати/i });
  }

  async fillForm(data: {
    key: string;
    name: string;
    description?: string;
    enabled?: boolean;
    environment?: string;
    rolloutPercentage?: number;
  }): Promise<void> {
    await this.keyInput.fill(data.key);
    await this.nameInput.fill(data.name);
    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }
    if (data.enabled !== undefined && data.enabled) {
      const isChecked = await this.enabledCheckbox.isChecked();
      if (!isChecked) await this.enabledCheckbox.check();
    }
    if (data.environment) {
      await this.environmentSelect.selectOption(data.environment);
    }
    if (data.rolloutPercentage !== undefined) {
      await this.rolloutInput.fill(String(data.rolloutPercentage));
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async getValidationError(): Promise<string | null> {
    // HTML5 validation message on the key input
    const validity = await this.keyInput.evaluate(
      (el) => (el as { validationMessage?: string }).validationMessage ?? "",
    );
    return validity || null;
  }
}
