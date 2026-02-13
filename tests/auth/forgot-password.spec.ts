import { Config } from "../../src/config/config.js";
import { Route } from "../../src/config/routes.js";
import { Tag } from "../../src/config/test-tag.js";
import { TestDataFactory } from "../../src/data/test-data-factory.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Forgot password page", { tag: [Tag.REGRESSION] }, () => {
  test(
    "should display forgot password form elements",
    { tag: [Tag.SMOKE] },
    async ({ forgotPasswordPage }) => {
      await forgotPasswordPage.goto();
      await expect(forgotPasswordPage.emailInput).toBeVisible();
      await expect(forgotPasswordPage.submitButton).toBeVisible();
    },
  );

  test("should allow access to forgot password page", async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.goto();
    await expect(forgotPasswordPage.page).toHaveURL(Route.FORGOT_PASSWORD);
  });

  test("should show success state after submitting valid email", async ({
    forgotPasswordPage,
    request,
  }) => {
    test.skip(!Config.apiBaseUrl(), "Requires backend API");
    const regData = TestDataFactory.validRegisterData();

    // Register user via standalone API context (avoids storing auth cookies in page)
    await request.post(`${Config.apiBaseUrl()}/api/v1/auth/register`, {
      data: {
        email: regData.email,
        password: regData.password,
        firstName: regData.firstName,
        lastName: regData.lastName,
      },
    });

    await forgotPasswordPage.goto();
    await forgotPasswordPage.submitForgotPassword(regData.email);
    await expect(forgotPasswordPage.successAlert).toBeVisible();
  });

  test(
    "should show success state even for non-existent email (enumeration prevention)",
    { tag: [Tag.SECURITY] },
    async ({ forgotPasswordPage }) => {
      test.skip(!Config.apiBaseUrl(), "Requires backend API");
      await forgotPasswordPage.goto();
      await forgotPasswordPage.submitForgotPassword(TestDataFactory.randomEmail());
      await expect(forgotPasswordPage.successAlert).toBeVisible();
    },
  );

  test(
    "should show validation error for empty email submission",
    { tag: [Tag.NEGATIVE] },
    async ({ forgotPasswordPage }) => {
      await forgotPasswordPage.goto();
      await forgotPasswordPage.submitButton.click();
      await expect(
        forgotPasswordPage.page.getByText(/invalid email|email.*required/i),
      ).toBeVisible();
    },
  );

  test(
    "should show validation error for invalid email format",
    { tag: [Tag.NEGATIVE] },
    async ({ forgotPasswordPage }) => {
      await forgotPasswordPage.goto();
      // Disable native HTML5 validation so Zod validation errors appear in the DOM
      await forgotPasswordPage.page.locator("form").evaluate((el) => {
        el.setAttribute("novalidate", "");
      });
      await forgotPasswordPage.submitForgotPassword("not-an-email");
      await expect(forgotPasswordPage.page.getByText(/invalid email/i)).toBeVisible();
    },
  );

  test("should have link back to login page and navigate to it", async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.goto();
    await expect(forgotPasswordPage.backToLoginLink).toBeVisible();
    await forgotPasswordPage.backToLoginLink.click();
    await expect(forgotPasswordPage.page).toHaveURL(Route.LOGIN);
  });
});
