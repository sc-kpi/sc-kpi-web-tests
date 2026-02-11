import { Tag } from "../../src/config/test-tag.js";
import { TestDataFactory } from "../../src/data/test-data-factory.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Register page", { tag: [Tag.REGRESSION] }, () => {
  test.skip("should display registration form elements", async ({ registerPage }) => {
    // Skip: register page not built yet
    await registerPage.goto();
    await expect(registerPage.nameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
  });

  test.skip("should register with valid data", async ({ registerPage, page }) => {
    // Skip: register page not built yet
    const data = TestDataFactory.validRegisterData();
    await registerPage.goto();
    await registerPage.register(data.name, data.email, data.password);
    await expect(page).toHaveURL("/");
  });
});
