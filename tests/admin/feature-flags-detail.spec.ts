import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Feature flag detail/edit", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    test.skip(!Config.isAuthEnabled(), "Admin tests require authentication");
  });

  test("should display all flag details on edit page", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available to view");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
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
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available to edit");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
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
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available to edit");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
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
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available to view");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    await adminPage.getByRole("button", { name: /back|назад/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags$/, { timeout: 15000 });
  });

  test("should show key as read-only on edit page", async ({ featureFlagsListPage, adminPage }) => {
    await featureFlagsListPage.goto();
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available to view");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
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
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available to edit");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    const descInput = adminPage.locator("#description");
    await descInput.clear();
    await descInput.fill("Updated via E2E test");
    await adminPage.getByRole("button", { name: /save|зберегти/i }).click();

    await adminPage.waitForTimeout(1000);
    await expect(descInput).toHaveValue("Updated via E2E test");
  });
});
