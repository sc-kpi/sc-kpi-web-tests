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

  testFlagKey = `e2e-overrides-${Date.now()}`;
  await flagHelper.createFlag({
    key: testFlagKey,
    name: `E2E Overrides ${TestDataFactory.randomName()}`,
    enabled: false,
    rolloutPercentage: 100,
  });
});

test.afterAll(async () => {
  await flagHelper.cleanup();
});

test.describe("Feature flag overrides", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    test.skip(!Config.isAuthEnabled(), "Admin tests require authentication");
  });

  test("should display overrides section on detail page", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();

    const flagRow = featureFlagsListPage.getFlagRow(testFlagKey);
    await flagRow.getByRole("link", { name: /edit|редагувати/i }).click();
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

    const flagRow = featureFlagsListPage.getFlagRow(testFlagKey);
    await flagRow.getByRole("link", { name: /edit|редагувати/i }).click();
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
    await expect(adminPage.getByRole("cell", { name: "TIER" }).first()).toBeVisible();
    await expect(adminPage.getByRole("cell", { name: "Tier 3" }).first()).toBeVisible();
  });

  test("should remove override from table", async ({ featureFlagsListPage, adminPage }) => {
    await featureFlagsListPage.goto();

    const flagRow = featureFlagsListPage.getFlagRow(testFlagKey);
    await flagRow.getByRole("link", { name: /edit|редагувати/i }).click();
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

    await deleteButtons.last().click();
    await adminPage.waitForTimeout(1000);
  });
});
