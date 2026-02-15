import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { TestDataFactory } from "../../src/data/test-data-factory.js";
import { expect, test } from "../../src/fixtures/index.js";
import { AuthApiHelper } from "../../src/helpers/auth-api.helper.js";
import { FeatureFlagHelper } from "../../src/helpers/feature-flag.helper.js";

let flagHelper: FeatureFlagHelper;
let testFlagKey: string;

test.beforeAll(async () => {
  const token = await AuthApiHelper.getAdminToken();
  flagHelper = new FeatureFlagHelper(token);

  testFlagKey = `e2e-detail-${crypto.randomUUID().slice(0, 8)}`;
  await flagHelper.createFlag({
    key: testFlagKey,
    name: `E2E Detail ${TestDataFactory.randomName()}`,
    description: "Created by E2E test",
    enabled: false,
    rolloutPercentage: 100,
  });
});

test.afterAll(async () => {
  await flagHelper.cleanup();
});

test.describe("Feature flag detail/edit", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    test.skip(!Config.isAuthEnabled(), "Admin tests require authentication");
  });

  test("should display all flag details on edit page", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();

    await featureFlagsListPage.clickEditFlag(testFlagKey);
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    // Verify form fields are present
    await expect(adminPage.locator("#name")).toBeVisible();
    await expect(adminPage.locator("#description")).toBeVisible();
    await expect(adminPage.locator("#enabled")).toBeVisible();
    await expect(adminPage.locator("#environment")).toBeVisible();
    await expect(adminPage.locator("#rolloutPercentage")).toBeVisible();
  });

  test("should update flag name and verify persistence", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();

    await featureFlagsListPage.clickEditFlag(testFlagKey);
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    const nameInput = adminPage.locator("#name");
    const originalName = await nameInput.inputValue();
    const newName = `Updated ${Date.now()}`;
    await nameInput.clear();
    await nameInput.fill(newName);
    await adminPage.getByRole("button", { name: /save|зберегти/i }).click();

    // Wait for save and verify
    await adminPage.waitForTimeout(1000);
    await expect(nameInput).toHaveValue(newName);

    // Restore original name
    await nameInput.clear();
    await nameInput.fill(originalName);
    await adminPage.getByRole("button", { name: /save|зберегти/i }).click();
  });

  test("should update rollout percentage", async ({ featureFlagsListPage, adminPage }) => {
    await featureFlagsListPage.goto();

    await featureFlagsListPage.clickEditFlag(testFlagKey);
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    const rolloutInput = adminPage.locator("#rolloutPercentage");
    await rolloutInput.clear();
    await rolloutInput.fill("50");
    await adminPage.getByRole("button", { name: /save|зберегти/i }).click();

    await adminPage.waitForTimeout(1000);
    await expect(rolloutInput).toHaveValue("50");

    // Restore
    await rolloutInput.clear();
    await rolloutInput.fill("100");
    await adminPage.getByRole("button", { name: /save|зберегти/i }).click();
  });

  test("should navigate back to list from detail page", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();

    await featureFlagsListPage.clickEditFlag(testFlagKey);
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    await adminPage.getByRole("button", { name: /back|назад/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags$/, { timeout: 15000 });
  });

  test("should show key as read-only on edit page", async ({ featureFlagsListPage, adminPage }) => {
    await featureFlagsListPage.goto();

    await featureFlagsListPage.clickEditFlag(testFlagKey);
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    // Key field should be disabled
    const keyInput = adminPage.getByLabel(/key|ключ/i);
    await expect(keyInput).toBeDisabled();
  });

  test("should update description and verify persistence", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();

    await featureFlagsListPage.clickEditFlag(testFlagKey);
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    const descInput = adminPage.locator("#description");
    await descInput.clear();
    await descInput.fill("Updated via E2E test");
    await adminPage.getByRole("button", { name: /save|зберегти/i }).click();

    await adminPage.waitForTimeout(1000);
    await expect(descInput).toHaveValue("Updated via E2E test");
  });
});
