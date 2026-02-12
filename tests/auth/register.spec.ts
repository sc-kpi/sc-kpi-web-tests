import { Tag } from "../../src/config/test-tag.js";
import { TestDataFactory } from "../../src/data/test-data-factory.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Register page", { tag: [Tag.REGRESSION] }, () => {
  test("should display registration form elements", async ({ registerPage }) => {
    await registerPage.goto();
    await expect(registerPage.firstNameInput).toBeVisible();
    await expect(registerPage.lastNameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
    await expect(registerPage.loginLink).toBeVisible();
  });

  test("should register with valid data", async ({ registerPage, page }) => {
    const data = TestDataFactory.validRegisterData();
    await registerPage.goto();
    await registerPage.register(data.firstName, data.lastName, data.email, data.password);
    await expect(page).toHaveURL("/");
  });

  test("should show error for duplicate email", async ({ registerPage }) => {
    const data = TestDataFactory.validRegisterData();

    // Register first time via API
    await registerPage.page.request.post("/api/v1/auth/register", {
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    // Try to register again via UI
    await registerPage.goto();
    await registerPage.register(data.firstName, data.lastName, data.email, data.password);
    await expect(registerPage.errorMessage).toBeVisible();
  });

  test("should show validation errors for empty form", async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.submitButton.click();
    await expect(registerPage.page.getByText(/first name is required/i)).toBeVisible();
  });
});
