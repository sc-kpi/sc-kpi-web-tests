import type { Locator, Page } from "@playwright/test";
import { Route } from "../config/routes.js";
import { BasePage } from "./base.page.js";

export class HomePage extends BasePage {
  readonly path = Route.HOME;

  readonly title: Locator;
  readonly subtitle: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole("heading", { level: 1 });
    this.subtitle = page.getByRole("heading", { level: 2 });
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }
}
