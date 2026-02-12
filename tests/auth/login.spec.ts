import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { TestDataFactory } from "../../src/data/test-data-factory.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Login page", { tag: [Tag.REGRESSION] }, () => {
  test("should display login form elements", { tag: [Tag.SMOKE] }, async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
  });

  test("should login with valid credentials", async ({ loginPage, page }) => {
    // Register a user via API, then clear cookies to avoid auth state leaking
    const regData = TestDataFactory.validRegisterData();
    await page.request.post(`${Config.apiBaseUrl()}/api/v1/auth/register`, {
      data: {
        email: regData.email,
        password: regData.password,
        firstName: regData.firstName,
        lastName: regData.lastName,
      },
    });
    await page.context().clearCookies();

    await loginPage.goto();
    await loginPage.login(regData.email, regData.password);
    await expect(page).toHaveURL("/");
  });

  test("should show error with invalid credentials", async ({ loginPage }) => {
    const data = TestDataFactory.invalidLoginData();
    await loginPage.goto();
    await loginPage.login(data.email, data.password);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test("should show validation error for empty form", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitButton.click();
    // Form validation should prevent submission and show error
    await expect(loginPage.page.getByText(/invalid email/i)).toBeVisible();
  });
});
