import type { Page } from "@playwright/test";

export class NotificationBellComponent {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get bellButton() {
    return this.page.getByRole("button", {
      name: /bell|notification|сповіщення/i,
    });
  }

  get unreadBadge() {
    return this.bellButton.locator("span");
  }

  get popover() {
    return this.page
      .getByRole("dialog")
      .or(this.page.locator("[data-radix-popper-content-wrapper]"));
  }

  get markAllReadButton() {
    return this.popover.getByRole("button", {
      name: /mark all|позначити всі/i,
    });
  }

  get viewAllLink() {
    return this.popover.getByRole("button", {
      name: /view all|переглянути/i,
    });
  }

  get notificationItems() {
    return this.popover.locator("[class*='border']");
  }

  async open() {
    await this.bellButton.click();
    await this.popover.waitFor({ state: "visible", timeout: 5000 });
  }
}
