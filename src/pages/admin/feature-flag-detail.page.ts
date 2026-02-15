import type { Locator, Page } from "@playwright/test";
import { Route } from "../../config/routes.js";
import { BasePage } from "../base.page.js";

export class FeatureFlagDetailPage extends BasePage {
  readonly path: string;

  readonly keyInput: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly enabledCheckbox: Locator;
  readonly environmentSelect: Locator;
  readonly rolloutInput: Locator;
  readonly saveButton: Locator;
  readonly backButton: Locator;
  readonly overridesTable: Locator;
  readonly auditLogTable: Locator;
  readonly addOverrideButton: Locator;
  readonly overrideTypeSelect: Locator;
  readonly overrideTierInput: Locator;
  readonly overrideEnabledCheckbox: Locator;

  constructor(page: Page, flagId?: string) {
    super(page);
    this.path = `${Route.ADMIN_FEATURE_FLAGS}/${flagId ?? ""}`;
    this.keyInput = page.getByLabel(/key|ключ/i);
    this.nameInput = page.locator("#name");
    this.descriptionInput = page.locator("#description");
    this.enabledCheckbox = page.locator("#enabled");
    this.environmentSelect = page.locator("#environment");
    this.rolloutInput = page.locator("#rolloutPercentage");
    this.saveButton = page.getByRole("button", { name: /save|зберегти/i });
    this.backButton = page.getByRole("button", { name: /back|назад/i });
    this.overridesTable = page.getByRole("table").first();
    this.auditLogTable = page.getByRole("table").last();
    this.addOverrideButton = page.getByRole("button", { name: /add override|додати/i });
    this.overrideTypeSelect = page.locator("#overrideType");
    this.overrideTierInput = page.locator("#tierLevel");
    this.overrideEnabledCheckbox = page.locator("#overrideEnabled");
  }

  async updateName(name: string): Promise<void> {
    await this.nameInput.clear();
    await this.nameInput.fill(name);
    await this.saveButton.click();
  }

  async getCurrentName(): Promise<string> {
    return (await this.nameInput.inputValue()) ?? "";
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  async addTierOverride(tier: number, enabled: boolean): Promise<void> {
    await this.overrideTypeSelect.selectOption("TIER");
    await this.overrideTierInput.fill(String(tier));
    if (enabled) {
      const isChecked = await this.overrideEnabledCheckbox.isChecked();
      if (!isChecked) await this.overrideEnabledCheckbox.check();
    } else {
      const isChecked = await this.overrideEnabledCheckbox.isChecked();
      if (isChecked) await this.overrideEnabledCheckbox.uncheck();
    }
    await this.addOverrideButton.click();
  }

  async getOverrideCount(): Promise<number> {
    const rows = this.overridesTable.getByRole("row");
    const count = await rows.count();
    return Math.max(0, count - 1); // Subtract header
  }

  async getAuditLogEntryCount(): Promise<number> {
    const rows = this.auditLogTable.getByRole("row");
    const count = await rows.count();
    return Math.max(0, count - 1); // Subtract header
  }
}
