import type { Locator, Page } from "@playwright/test";
import { Route } from "../../config/routes.js";
import { BasePage } from "../base.page.js";

export class RateLimitDetailPage extends BasePage {
  readonly path: string;

  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly endpointPatternInput: Locator;
  readonly httpMethodSelect: Locator;
  readonly limitPerPeriodInput: Locator;
  readonly periodSecondsInput: Locator;
  readonly burstCapacityInput: Locator;
  readonly scopeSelect: Locator;
  readonly priorityInput: Locator;
  readonly enabledCheckbox: Locator;
  readonly saveButton: Locator;
  readonly backButton: Locator;
  readonly auditLogLink: Locator;

  constructor(page: Page, ruleId?: string) {
    super(page);
    this.path = `${Route.ADMIN_RATE_LIMITS}/${ruleId ?? ""}`;
    this.nameInput = page.locator("#name");
    this.descriptionInput = page.locator("#description");
    this.endpointPatternInput = page.locator("#endpointPattern");
    this.httpMethodSelect = page.locator("#httpMethod");
    this.limitPerPeriodInput = page.locator("#limitPerPeriod");
    this.periodSecondsInput = page.locator("#periodSeconds");
    this.burstCapacityInput = page.locator("#burstCapacity");
    this.scopeSelect = page.locator("#scope");
    this.priorityInput = page.locator("#priority");
    this.enabledCheckbox = page.locator("#enabled");
    this.saveButton = page.getByRole("button", { name: /save|зберегти/i });
    this.backButton = page.getByRole("button", { name: /back|назад/i });
    this.auditLogLink = page.getByRole("link", { name: /audit|журнал/i });
  }

  async updateDescription(description: string): Promise<void> {
    await this.descriptionInput.clear();
    await this.descriptionInput.fill(description);
    await this.saveButton.click();
  }

  async getCurrentName(): Promise<string> {
    return (await this.nameInput.inputValue()) ?? "";
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }
}
