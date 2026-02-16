import type { Locator, Page } from "@playwright/test";
import { Route } from "../../config/routes.js";
import { BasePage } from "../base.page.js";

export class AdminNotificationsPage extends BasePage {
  readonly path = Route.ADMIN_NOTIFICATIONS;

  readonly tabs: Locator;
  readonly listTab: Locator;
  readonly broadcastTab: Locator;
  readonly statsTab: Locator;
  readonly searchInput: Locator;
  readonly cleanupButton: Locator;
  readonly broadcastTitleInput: Locator;
  readonly broadcastBodyInput: Locator;
  readonly sendBroadcastButton: Locator;

  constructor(page: Page) {
    super(page);
    this.tabs = page.getByRole("tablist");
    this.listTab = page.getByRole("tab", { name: /list|all|усі/i });
    this.broadcastTab = page.getByRole("tab", {
      name: /broadcast|розсилка/i,
    });
    this.statsTab = page.getByRole("tab", { name: /stats|статистика/i });
    this.searchInput = page.getByPlaceholder(/search|пошук/i);
    this.cleanupButton = page.getByRole("button", {
      name: /cleanup|очищення/i,
    });
    this.broadcastTitleInput = page.getByLabel(/title key|ключ заголовку/i);
    this.broadcastBodyInput = page.getByLabel(/body key|ключ тексту/i);
    this.sendBroadcastButton = page.getByRole("button", {
      name: /send broadcast|надіслати/i,
    });
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }
}
