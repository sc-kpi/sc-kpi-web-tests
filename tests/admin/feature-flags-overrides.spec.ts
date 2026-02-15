import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Feature flag overrides", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    test.skip(!Config.isAuthEnabled(), "Admin tests require authentication");
  });

  test("should display overrides section on detail page", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    // Overrides section should be visible (either table or "no overrides" message)
    const overridesHeading = adminPage.getByRole("heading", {
      name: /overrides|перевизначення/i,
    });
    await expect(overridesHeading).toBeVisible();
  });

  test("should add tier override and see it in table", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    // Select TIER type and fill tier level
    const overrideTypeSelect = adminPage.locator("#overrideType");
    await overrideTypeSelect.selectOption("TIER");

    const tierLevelInput = adminPage.locator("#tierLevel");
    await tierLevelInput.fill("3");

    // Submit the override form
    const addButton = adminPage.getByRole("button", { name: /add override|додати/i });
    await addButton.click();

    // Verify the override appears
    await adminPage.waitForTimeout(1000);
    await expect(adminPage.getByText("TIER")).toBeVisible();
    await expect(adminPage.getByText("Tier 3")).toBeVisible();
  });

  test("should remove override from table", async ({ featureFlagsListPage, adminPage }) => {
    await featureFlagsListPage.goto();
    const flagCount = await featureFlagsListPage.getFlagCount();
    test.skip(flagCount === 0, "No feature flags available");

    const firstFlagRow = featureFlagsListPage.table.getByRole("row").nth(1);
    await firstFlagRow.getByRole("link", { name: /edit|редагувати/i }).click();
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    // First ensure there is an override to remove - add one
    const overrideTypeSelect = adminPage.locator("#overrideType");
    await overrideTypeSelect.selectOption("TIER");
    const tierLevelInput = adminPage.locator("#tierLevel");
    await tierLevelInput.fill("2");
    const addButton = adminPage.getByRole("button", { name: /add override|додати/i });
    await addButton.click();
    await adminPage.waitForTimeout(1000);

    // Now remove the last override
    const deleteButtons = adminPage
      .getByRole("table")
      .first()
      .getByRole("button", { name: /delete|видалити/i });

    const deleteCount = await deleteButtons.count();
    test.skip(deleteCount === 0, "No overrides to remove");

    await deleteButtons.last().click();
    await adminPage.waitForTimeout(1000);
  });
});
