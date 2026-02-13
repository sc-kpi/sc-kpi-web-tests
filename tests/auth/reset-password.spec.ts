import { Config } from "../../src/config/config.js";
import { Route } from "../../src/config/routes.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Reset password page", { tag: [Tag.REGRESSION] }, () => {
  test(
    "should show error when no token in URL",
    { tag: [Tag.SMOKE] },
    async ({ resetPasswordPage }) => {
      await resetPasswordPage.goto();
      await expect(resetPasswordPage.errorMessage).toBeVisible();
    },
  );

  test("should show forgot password link when no token", async ({ resetPasswordPage }) => {
    await resetPasswordPage.goto();
    await expect(resetPasswordPage.forgotPasswordLink).toBeVisible();
  });

  test("should display reset password form with token in URL", async ({ resetPasswordPage }) => {
    await resetPasswordPage.goto("test-token-placeholder");
    await expect(resetPasswordPage.newPasswordInput).toBeVisible();
    await expect(resetPasswordPage.confirmPasswordInput).toBeVisible();
    await expect(resetPasswordPage.submitButton).toBeVisible();
  });

  test(
    "should show validation error for empty password fields",
    { tag: [Tag.NEGATIVE] },
    async ({ resetPasswordPage }) => {
      await resetPasswordPage.goto("test-token-placeholder");
      await resetPasswordPage.submitButton.click();
      await expect(
        resetPasswordPage.page.getByText(/at least 8 characters|please confirm/i).first(),
      ).toBeVisible();
    },
  );

  test(
    "should show validation error for mismatched passwords",
    { tag: [Tag.NEGATIVE] },
    async ({ resetPasswordPage }) => {
      await resetPasswordPage.goto("test-token-placeholder");
      await resetPasswordPage.resetPassword("NewPassword123!", "DifferentPassword123!");
      await expect(
        resetPasswordPage.page.getByText(/passwords.*match|паролі.*збіг/i),
      ).toBeVisible();
    },
  );

  test(
    "should show validation error for short password",
    { tag: [Tag.NEGATIVE] },
    async ({ resetPasswordPage }) => {
      await resetPasswordPage.goto("test-token-placeholder");
      await resetPasswordPage.resetPassword("short", "short");
      await expect(
        resetPasswordPage.page.getByText(/at least 8|мінімум 8|too short|закоротк/i),
      ).toBeVisible();
    },
  );

  test(
    "should show error for invalid token on submit",
    { tag: [Tag.NEGATIVE] },
    async ({ resetPasswordPage }) => {
      test.skip(!Config.apiBaseUrl(), "Requires backend API");
      await resetPasswordPage.goto("invalid-token-value");
      await resetPasswordPage.resetPassword("NewPassword123!", "NewPassword123!");
      await expect(resetPasswordPage.errorMessage).toBeVisible();
    },
  );

  test("should have navigation link when no token", async ({ resetPasswordPage }) => {
    await resetPasswordPage.goto();
    await expect(resetPasswordPage.forgotPasswordLink).toBeVisible();
    await resetPasswordPage.forgotPasswordLink.click();
    await expect(resetPasswordPage.page).toHaveURL(Route.FORGOT_PASSWORD);
  });
});
