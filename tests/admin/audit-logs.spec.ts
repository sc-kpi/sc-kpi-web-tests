import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";
import { AuthApiHelper } from "../../src/helpers/auth-api.helper.js";
import { FeatureFlagHelper } from "../../src/helpers/feature-flag.helper.js";

let flagHelper: FeatureFlagHelper;

test.beforeAll(async () => {
  const token = await AuthApiHelper.getAdminToken();
  flagHelper = new FeatureFlagHelper(token);

  // Create 10 flags and toggle each twice to generate 30+ audit entries
  // (10 creates + 20 toggles = 30 entries, well over the 20 needed for pagination)
  const uid = crypto.randomUUID().slice(0, 8);
  for (let i = 0; i < 10; i++) {
    const flag = await flagHelper.createFlag({
      key: `e2e-audit-log-${uid}-${i}`,
      name: `E2E Audit Log ${i}`,
      enabled: false,
      rolloutPercentage: 100,
    });
    await flagHelper.toggleFlag(flag.id, { enabled: true });
    await flagHelper.toggleFlag(flag.id, { enabled: false });
  }
});

test.afterAll(async () => {
  await flagHelper.cleanup();
});

test.describe("Audit logs", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    test.skip(!Config.isAuthEnabled(), "Admin tests require authentication");
  });

  test("should display audit logs table", { tag: [Tag.SMOKE] }, async ({ auditLogsPage }) => {
    await auditLogsPage.goto();
    await expect(auditLogsPage.heading).toBeVisible();
    await expect(auditLogsPage.table).toBeVisible();
  });

  test("should display correct table columns", async ({ auditLogsPage }) => {
    await auditLogsPage.goto();
    const headerRow = auditLogsPage.table.getByRole("row").first();
    await expect(headerRow.getByText(/timestamp|час/i).first()).toBeVisible();
    await expect(headerRow.getByText(/action|дія/i).first()).toBeVisible();
    await expect(headerRow.getByText(/entity type|тип сутності/i).first()).toBeVisible();
  });

  test("should show filter controls", async ({ auditLogsPage }) => {
    await auditLogsPage.goto();
    await expect(auditLogsPage.entityTypeFilter).toBeVisible();
    await expect(auditLogsPage.actionFilter).toBeVisible();
    await expect(auditLogsPage.searchInput).toBeVisible();
    await expect(auditLogsPage.applyButton).toBeVisible();
  });

  test("should filter by entity type", async ({ auditLogsPage }) => {
    await auditLogsPage.goto();
    await auditLogsPage.selectEntityType("FEATURE_FLAG");
    await auditLogsPage.applyButton.click();
    await auditLogsPage.table.waitFor({ state: "visible", timeout: 15000 });
    await expect(auditLogsPage.table).toBeVisible();
  });

  test("should filter by action", async ({ auditLogsPage }) => {
    await auditLogsPage.goto();
    await auditLogsPage.selectAction("CREATED");
    await auditLogsPage.applyButton.click();
    await auditLogsPage.table.waitFor({ state: "visible", timeout: 15000 });
    await expect(auditLogsPage.table).toBeVisible();
  });

  test("should show pagination controls when multiple pages", async ({ auditLogsPage }) => {
    await auditLogsPage.goto();

    await expect(auditLogsPage.previousButton).toBeVisible();
    await expect(auditLogsPage.nextButton).toBeVisible();
  });

  test("should export CSV", async ({ auditLogsPage }) => {
    await auditLogsPage.goto();
    const downloadPromise = auditLogsPage.page.waitForEvent("download", { timeout: 15000 });
    await auditLogsPage.exportButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/audit-logs.*\.csv$/);
  });

  test("should reset filters", async ({ auditLogsPage }) => {
    await auditLogsPage.goto();
    await auditLogsPage.search("test search term");
    await auditLogsPage.applyButton.click();
    await auditLogsPage.page.waitForTimeout(500);

    await auditLogsPage.resetButton.click();
    await expect(auditLogsPage.searchInput).toHaveValue("");
  });
});
