import { Tag } from "../../src/config/test-tag.js";
import { TestDataFactory } from "../../src/data/test-data-factory.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Login page", { tag: [Tag.REGRESSION] }, () => {
  test.skip("should display login form elements", { tag: [Tag.SMOKE] }, async ({ loginPage }) => {
    // Skip: login page not built yet
    await loginPage.goto();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test.skip("should login with valid credentials", async ({ loginPage, page }) => {
    // Skip: login page not built yet
    const data = TestDataFactory.validLoginData();
    await loginPage.goto();
    await loginPage.login(data.email, data.password);
    await expect(page).toHaveURL("/");
  });

  test.skip("should show error with invalid credentials", async ({ loginPage }) => {
    // Skip: login page not built yet
    const data = TestDataFactory.invalidLoginData();
    await loginPage.goto();
    await loginPage.login(data.email, data.password);
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
