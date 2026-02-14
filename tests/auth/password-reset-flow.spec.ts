import { Config } from "../../src/config/config.js";
import { Route } from "../../src/config/routes.js";
import { Tag } from "../../src/config/test-tag.js";
import { TestDataFactory } from "../../src/data/test-data-factory.js";
import { expect, test } from "../../src/fixtures/index.js";
import {
  deleteAllMessages,
  extractResetToken,
  getMessageBody,
  waitForEmail,
} from "../../src/helpers/mailpit.helper.js";

function skipIfNoApiOrMailpit() {
  test.skip(!Config.apiBaseUrl(), "Requires backend API");
  test.skip(!Config.mailpitBaseUrl(), "Requires MailPit");
}

test.describe("Password reset flow (E2E)", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    if (Config.mailpitBaseUrl()) {
      await deleteAllMessages();
    }
  });

  test(
    "should complete full password reset flow (forgot -> email -> reset -> login)",
    { tag: [Tag.SMOKE] },
    async ({ forgotPasswordPage, resetPasswordPage, loginPage, request }) => {
      skipIfNoApiOrMailpit();

      // Register user via standalone API context
      const regData = TestDataFactory.validRegisterData();
      await request.post(`${Config.apiBaseUrl()}/api/v1/auth/register`, {
        data: {
          email: regData.email,
          password: regData.password,
          firstName: regData.firstName,
          lastName: regData.lastName,
        },
      });

      // Submit forgot password
      await forgotPasswordPage.goto();
      await forgotPasswordPage.submitForgotPassword(regData.email);
      await expect(forgotPasswordPage.successAlert).toBeVisible();

      // Extract token from MailPit
      const mailResponse = await waitForEmail(regData.email);
      const body = await getMessageBody(mailResponse.messages[0].ID);
      const token = extractResetToken(body);

      // Reset password
      const newPassword = "E2ENewPass123!";
      await resetPasswordPage.goto(token);
      await resetPasswordPage.resetPassword(newPassword, newPassword);
      await expect(resetPasswordPage.successMessage).toBeVisible();

      // Login with new password
      await loginPage.goto();
      await loginPage.login(regData.email, newPassword);
      await expect(loginPage.page).toHaveURL(Route.HOME);
    },
  );

  test(
    "should not be able to login with old password after reset",
    { tag: [Tag.SECURITY] },
    async ({ forgotPasswordPage, resetPasswordPage, loginPage, request }) => {
      skipIfNoApiOrMailpit();

      const regData = TestDataFactory.validRegisterData();
      await request.post(`${Config.apiBaseUrl()}/api/v1/auth/register`, {
        data: {
          email: regData.email,
          password: regData.password,
          firstName: regData.firstName,
          lastName: regData.lastName,
        },
      });

      // Forgot password flow
      await forgotPasswordPage.goto();
      await forgotPasswordPage.submitForgotPassword(regData.email);

      const mailResponse = await waitForEmail(regData.email);
      const body = await getMessageBody(mailResponse.messages[0].ID);
      const token = extractResetToken(body);

      const newPassword = "E2EResetPass123!";
      await resetPasswordPage.goto(token);
      await resetPasswordPage.resetPassword(newPassword, newPassword);
      await expect(resetPasswordPage.successMessage).toBeVisible();

      // Try old password
      await loginPage.goto();
      await loginPage.login(regData.email, regData.password);
      await expect(loginPage.errorMessage).toBeVisible();
    },
  );

  test(
    "should show error when reusing an already-used token",
    { tag: [Tag.NEGATIVE] },
    async ({ forgotPasswordPage, resetPasswordPage, request }) => {
      skipIfNoApiOrMailpit();

      const regData = TestDataFactory.validRegisterData();
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

      const mailResponse = await waitForEmail(regData.email);
      const body = await getMessageBody(mailResponse.messages[0].ID);
      const token = extractResetToken(body);

      // Use token once
      const newPassword = "E2EFirstPass123!";
      await resetPasswordPage.goto(token);
      await resetPasswordPage.resetPassword(newPassword, newPassword);

      // Try reusing the same token
      await resetPasswordPage.goto(token);
      await resetPasswordPage.resetPassword("E2ESecondPass123!", "E2ESecondPass123!");
      await expect(resetPasswordPage.errorMessage).toBeVisible();
    },
  );

  test("should send email to registered user", async ({ forgotPasswordPage, request }) => {
    skipIfNoApiOrMailpit();

    const regData = TestDataFactory.validRegisterData();
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

    const mailResponse = await waitForEmail(regData.email);
    expect(mailResponse.messages_count).toBeGreaterThan(0);
  });

  test(
    "should not send email for non-existent user",
    { tag: [Tag.SECURITY] },
    async ({ forgotPasswordPage }) => {
      skipIfNoApiOrMailpit();

      const randomEmail = TestDataFactory.randomEmail();
      await forgotPasswordPage.goto();
      await forgotPasswordPage.submitForgotPassword(randomEmail);

      // Wait briefly
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify no email arrived
      try {
        await waitForEmail(randomEmail, 2000);
        // If we get here, an email was sent (unexpected)
        throw new Error("Email was sent for non-existent user");
      } catch (error) {
        // Expected: no email should arrive
        expect((error as Error).message).toContain("No email received");
      }
    },
  );
});
