import { faker } from "@faker-js/faker";
import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Feature flag creation", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    test.skip(!Config.isAuthEnabled(), "Admin tests require authentication");
  });

  test("should create flag with all fields filled", async ({
    featureFlagCreatePage,
    adminPage,
  }) => {
    await featureFlagCreatePage.goto();

    const flagKey = `test.e2e.${faker.string.alpha({ length: 8, casing: "lower" })}`;
    await featureFlagCreatePage.fillForm({
      key: flagKey,
      name: `E2E Test Flag ${faker.lorem.word()}`,
      description: "Created by E2E test",
      enabled: true,
      environment: "dev",
    });

    await featureFlagCreatePage.submit();

    // Should redirect to list after creation
    await adminPage.waitForURL(/\/admin\/feature-flags$/, { timeout: 15000 });
  });

  test("should show validation error for invalid key format", async ({ featureFlagCreatePage }) => {
    await featureFlagCreatePage.goto();

    // Fill with uppercase key (invalid per pattern ^[a-z][a-z0-9.\-]*$)
    await featureFlagCreatePage.keyInput.fill("INVALID.KEY");
    await featureFlagCreatePage.nameInput.fill("Test Name");

    await featureFlagCreatePage.submit();

    // HTML5 validation should prevent submission
    const error = await featureFlagCreatePage.getValidationError();
    expect(error).toBeTruthy();
  });

  test("should create flag with minimum required fields only", async ({
    featureFlagCreatePage,
    adminPage,
  }) => {
    await featureFlagCreatePage.goto();

    const flagKey = `test.min.${faker.string.alpha({ length: 8, casing: "lower" })}`;
    await featureFlagCreatePage.keyInput.fill(flagKey);
    await featureFlagCreatePage.nameInput.fill("Minimal Flag");

    await featureFlagCreatePage.submit();

    await adminPage.waitForURL(/\/admin\/feature-flags$/, { timeout: 15000 });
  });

  test("should cancel creation and return to list", async ({
    featureFlagCreatePage,
    adminPage,
  }) => {
    await featureFlagCreatePage.goto();

    await featureFlagCreatePage.cancel();

    await adminPage.waitForURL(/\/admin\/feature-flags$/, { timeout: 15000 });
  });

  test("should display all form fields", async ({ featureFlagCreatePage }) => {
    await featureFlagCreatePage.goto();

    await expect(featureFlagCreatePage.keyInput).toBeVisible();
    await expect(featureFlagCreatePage.nameInput).toBeVisible();
    await expect(featureFlagCreatePage.descriptionInput).toBeVisible();
    await expect(featureFlagCreatePage.enabledCheckbox).toBeVisible();
    await expect(featureFlagCreatePage.environmentSelect).toBeVisible();
    await expect(featureFlagCreatePage.submitButton).toBeVisible();
    await expect(featureFlagCreatePage.cancelButton).toBeVisible();
  });

  test("should show validation for blank name", async ({ featureFlagCreatePage }) => {
    await featureFlagCreatePage.goto();

    await featureFlagCreatePage.keyInput.fill("valid.key");
    // Leave name empty

    await featureFlagCreatePage.submit();

    // HTML5 required validation should prevent submission
    const nameValidity = await featureFlagCreatePage.nameInput.evaluate(
      (el) => (el as { validationMessage?: string }).validationMessage ?? "",
    );
    expect(nameValidity).toBeTruthy();
  });
});
