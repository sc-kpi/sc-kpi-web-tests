import type { Locator, Page } from "@playwright/test";
import { Route } from "../../config/routes.js";
import { BasePage } from "../base.page.js";

export class RateLimitCreatePage extends BasePage {
  readonly path = `${Route.ADMIN_RATE_LIMITS}/new`;

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
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByLabel(/^name$|^назва$/i);
    this.descriptionInput = page.getByLabel(/description|опис/i);
    this.endpointPatternInput = page.getByLabel(/endpoint pattern|шаблон ендпоінту/i);
    this.httpMethodSelect = page.getByLabel(/http method|http метод/i);
    this.limitPerPeriodInput = page.getByLabel(/limit per period|ліміт за період/i);
    this.periodSecondsInput = page.getByLabel(/period.*seconds|період.*секунди/i);
    this.burstCapacityInput = page.getByLabel(/burst capacity|пікова ємність/i);
    this.scopeSelect = page.getByLabel(/^scope$|^область$/i);
    this.priorityInput = page.getByLabel(/priority|пріоритет/i);
    this.enabledCheckbox = page.getByLabel(/enabled|увімкнено/i);
    this.submitButton = page.getByRole("button", { name: /create|створити/i });
    this.cancelButton = page.getByRole("button", { name: /cancel|скасувати/i });
  }

  async fillForm(data: {
    name: string;
    endpointPattern: string;
    limitPerPeriod?: number;
    periodSeconds?: number;
    burstCapacity?: number;
    scope?: string;
    priority?: number;
  }): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.endpointPatternInput.fill(data.endpointPattern);
    if (data.limitPerPeriod !== undefined) {
      await this.limitPerPeriodInput.fill(String(data.limitPerPeriod));
    }
    if (data.periodSeconds !== undefined) {
      await this.periodSecondsInput.fill(String(data.periodSeconds));
    }
    if (data.burstCapacity !== undefined) {
      await this.burstCapacityInput.fill(String(data.burstCapacity));
    }
    if (data.scope) {
      await this.scopeSelect.selectOption(data.scope);
    }
    if (data.priority !== undefined) {
      await this.priorityInput.fill(String(data.priority));
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click({ force: true });
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click({ force: true });
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }
}
