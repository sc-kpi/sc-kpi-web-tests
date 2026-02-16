import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Admin notifications", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    test.skip(!Config.isAuthEnabled(), "Admin tests require authentication");
  });

  test("should display admin notifications page", { tag: [Tag.SMOKE] }, async ({ adminPage }) => {
    await adminPage.goto("/admin/notifications");
    await adminPage.waitForLoadState("domcontentloaded");
    const heading = adminPage.locator("h1");
    await expect(heading).toBeVisible();
  });

  test("should show tab controls", async ({ adminPage }) => {
    await adminPage.goto("/admin/notifications");
    await adminPage.waitForLoadState("domcontentloaded");
    const tabs = adminPage.getByRole("tablist");
    await expect(tabs).toBeVisible();
  });

  test("should switch to broadcast tab", async ({ adminPage }) => {
    await adminPage.goto("/admin/notifications");
    await adminPage.waitForLoadState("domcontentloaded");
    const broadcastTab = adminPage.getByRole("tab", {
      name: /broadcast|розсилка/i,
    });
    await broadcastTab.click();
    const sendButton = adminPage.getByRole("button", {
      name: /send|надіслати/i,
    });
    await expect(sendButton).toBeVisible();
  });

  test("should switch to stats tab", async ({ adminPage }) => {
    await adminPage.goto("/admin/notifications");
    await adminPage.waitForLoadState("domcontentloaded");
    const statsTab = adminPage.getByRole("tab", {
      name: /stats|статистика/i,
    });
    await statsTab.click();
    const totalText = adminPage.getByText(/total|всього/i);
    await expect(totalText).toBeVisible();
  });
});
