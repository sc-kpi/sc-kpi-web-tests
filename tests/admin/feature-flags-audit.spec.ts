import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Feature flag audit log (centralized)", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    test.skip(!Config.isAuthEnabled(), "Admin tests require authentication");
  });

  test("should have audit log link on feature flag detail page", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    // Detail page should have a link to centralized audit logs
    const auditLink = adminPage.getByRole("link", {
      name: /audit log|журнал змін/i,
    });
    await expect(auditLink).toBeVisible();
  });

  test("should navigate to centralized audit page filtered by feature flag", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    const auditLink = adminPage.getByRole("link", {
      name: /audit log|журнал змін/i,
    });
    await auditLink.click();

    await adminPage.waitForURL(/\/admin\/audit-logs\?/, { timeout: 15000 });
    expect(adminPage.url()).toContain("entityType=FEATURE_FLAG");
  });
});
