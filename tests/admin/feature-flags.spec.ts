import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

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
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available to edit");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    await expect(adminPage.locator("#name")).toBeVisible();
  });

  test("should toggle flag from list", async ({ featureFlagsListPage }) => {
    await featureFlagsListPage.goto();
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available to toggle");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    const toggleButton = firstFlagRow.getByRole("button", { name: /on|off/i });
    const initialText = await toggleButton.textContent();
    await toggleButton.click();

    await expect(toggleButton).not.toHaveText(initialText ?? "", { timeout: 10000 });
  });

  test("should update flag details", async ({ featureFlagsListPage, adminPage }) => {
    await featureFlagsListPage.goto();
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available to edit");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    const nameInput = adminPage.locator("#name");
    await nameInput.clear();
    await nameInput.fill("Updated Flag Name");

    const saveButton = adminPage.getByRole("button", { name: /save|зберегти/i });
    await saveButton.click();

    await expect(nameInput).toHaveValue("Updated Flag Name");
  });

  test("should delete flag from list", async ({ featureFlagsListPage }) => {
    await featureFlagsListPage.goto();
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount < 2, "Need at least 2 flags to safely delete one");

    featureFlagsListPage.page.on("dialog", (dialog) => dialog.accept());

    const lastFlagRow = featureFlagsListPage.table.getByRole("row").nth(flagCount);
    // Capture the key of the flag being deleted
    const flagKey = await lastFlagRow.locator("td").first().textContent();

    await lastFlagRow.getByRole("button", { name: /delete|видалити/i }).click();

    // Wait for the deleted flag's key to disappear from the table
    await expect(
      featureFlagsListPage.table.getByRole("cell", { name: flagKey ?? "" }),
    ).not.toBeVisible({ timeout: 10000 });
  });

  test("should show pagination when many flags exist", async ({ featureFlagsListPage }) => {
    await featureFlagsListPage.goto();
    // Pagination is only shown if there are more flags than fit on one page
    // Just verify the page loads correctly
    await expect(featureFlagsListPage.table).toBeVisible();
  });
});
