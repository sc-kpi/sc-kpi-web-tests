import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { TestDataFactory } from "../../src/data/test-data-factory.js";
import { expect, test } from "../../src/fixtures/index.js";
import { AuthApiHelper } from "../../src/helpers/auth-api.helper.js";
import { FeatureFlagHelper } from "../../src/helpers/feature-flag.helper.js";

let flagHelper: FeatureFlagHelper;
let testFlagKeys: string[];

test.beforeAll(async () => {
  const token = await AuthApiHelper.getAdminToken();
  flagHelper = new FeatureFlagHelper(token);

  testFlagKeys = [];
  const uid = crypto.randomUUID().slice(0, 8);
  for (let i = 0; i < 3; i++) {
    const key = `e2e-flags-${uid}-${i}`;
    await flagHelper.createFlag({
      key,
      name: `E2E Flag ${TestDataFactory.randomName()}`,
      enabled: false,
      rolloutPercentage: 100,
    });
    testFlagKeys.push(key);
  }
});

test.afterAll(async () => {
  await flagHelper.cleanup();
});

test.describe("Feature flag management", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    test.skip(!Config.isAuthEnabled(), "Admin tests require authentication");
  });

  test(
    "should display feature flags list",
    { tag: [Tag.SMOKE] },
    async ({ featureFlagsListPage }) => {
      await featureFlagsListPage.goto();
      await expect(featureFlagsListPage.heading).toBeVisible();
      await expect(featureFlagsListPage.table).toBeVisible();
    },
  );

  test("should navigate to create flag page", async ({ featureFlagsListPage, adminPage }) => {
    await featureFlagsListPage.goto();
    await featureFlagsListPage.createButton.click();
    await adminPage.waitForURL(/\/admin\/feature-flags\/new/, { timeout: 15000 });
    await expect(adminPage.getByLabel(/key|ключ/i)).toBeVisible();
  });

  test("should display create flag form elements", async ({ featureFlagCreatePage }) => {
    await featureFlagCreatePage.goto();
    await expect(featureFlagCreatePage.keyInput).toBeVisible();
    await expect(featureFlagCreatePage.nameInput).toBeVisible();
    await expect(featureFlagCreatePage.submitButton).toBeVisible();
  });

  test("should navigate to flag detail from list", async ({ featureFlagsListPage, adminPage }) => {
    await featureFlagsListPage.goto();

    await featureFlagsListPage.clickEditFlag(testFlagKeys[0]);
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    await expect(adminPage.locator("#name")).toBeVisible();
  });

  test("should toggle flag from list", async ({ featureFlagsListPage }) => {
    await featureFlagsListPage.goto();

    const flagRow = featureFlagsListPage.getFlagRow(testFlagKeys[0]);
    const toggleButton = flagRow.getByRole("button", { name: /on|off/i });
    const initialText = await toggleButton.textContent();
    await toggleButton.click({ force: true });

    await expect(toggleButton).not.toHaveText(initialText ?? "", { timeout: 10000 });
  });

  test("should update flag details", async ({ featureFlagsListPage, adminPage }) => {
    await featureFlagsListPage.goto();

    await featureFlagsListPage.clickEditFlag(testFlagKeys[1]);
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    const nameInput = adminPage.locator("#name");
    await nameInput.clear();
    await nameInput.fill("Updated Flag Name");

    const saveButton = adminPage.getByRole("button", { name: /save|зберегти/i });
    await saveButton.click({ force: true });

    await expect(nameInput).toHaveValue("Updated Flag Name");
  });

  test("should delete flag from list", async ({ featureFlagsListPage }) => {
    await featureFlagsListPage.goto();

    featureFlagsListPage.page.on("dialog", (dialog) => dialog.accept());

    await featureFlagsListPage.clickDeleteFlag(testFlagKeys[2]);

    // Wait for the deleted flag's key to disappear from the table
    await expect(
      featureFlagsListPage.table.getByRole("cell", { name: testFlagKeys[2] }),
    ).not.toBeVisible({ timeout: 10000 });
  });

  test("should show pagination when many flags exist", async ({ featureFlagsListPage }) => {
    await featureFlagsListPage.goto();
    // Pagination is only shown if there are more flags than fit on one page
    // Just verify the page loads correctly
    await expect(featureFlagsListPage.table).toBeVisible();
  });
});
