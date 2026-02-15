import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Feature flag audit log", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    test.skip(!Config.isAuthEnabled(), "Admin tests require authentication");
  });

  test("should display audit log section on detail page", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    // Audit log heading should be visible
    const auditHeading = adminPage.getByRole("heading", {
      name: /audit log|журнал змін/i,
    });
    await expect(auditHeading).toBeVisible();
  });

  test("should show toggle action in audit log after toggling", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available to toggle");

    // Toggle a flag from the list first
    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    const toggleButton = firstFlagRow.getByRole("button", { name: /on|off/i });
    await toggleButton.click();
    await featureFlagsListPage.page.waitForTimeout(1000);

    // Navigate to detail page
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    // Audit log should contain a TOGGLED entry
    await expect(adminPage.getByText("TOGGLED")).toBeVisible();
  });

  test("should show audit log entries with correct columns", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    // Verify audit log table headers are present
    const auditTable = adminPage.getByRole("table").last();
    await expect(auditTable.getByText(/action|дія/i).first()).toBeVisible();
  });
});
