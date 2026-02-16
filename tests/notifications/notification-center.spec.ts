import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Notification center", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/notifications");
    await authenticatedPage.waitForLoadState("domcontentloaded");
  });

  test(
    "should display notifications page heading",
    { tag: [Tag.SMOKE] },
    async ({ authenticatedPage }) => {
      const heading = authenticatedPage.locator("h1");
      await expect(heading).toBeVisible();
    },
  );

  test("should show category filter tabs", async ({ authenticatedPage }) => {
    const tabs = authenticatedPage.getByRole("tablist");
    await expect(tabs).toBeVisible();
  });

  test("should show read/unread filter buttons", async ({ authenticatedPage }) => {
    const allButton = authenticatedPage.getByRole("button", {
      name: /all|усі/i,
    });
    const unreadButton = authenticatedPage.getByRole("button", {
      name: /unread|непрочитані/i,
    });
    await expect(allButton).toBeVisible();
    await expect(unreadButton).toBeVisible();
  });

  test("should show empty state or notifications", async ({ authenticatedPage }) => {
    const empty = authenticatedPage.getByText(/no notification|немає сповіщень/i);
    const items = authenticatedPage.locator("[class*='border'][class*='rounded']");
    const emptyVisible = await empty.isVisible().catch(() => false);
    const itemsCount = await items.count();
    expect(emptyVisible || itemsCount > 0).toBeTruthy();
  });
});
