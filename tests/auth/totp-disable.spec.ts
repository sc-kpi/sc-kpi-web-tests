import { Config } from "../../src/config/config.js";
import { Route } from "../../src/config/routes.js";
import { Tag } from "../../src/config/test-tag.js";
import { TestDataFactory } from "../../src/data/test-data-factory.js";
import { expect, test } from "../../src/fixtures/index.js";
import { TotpHelper } from "../../src/helpers/totp.helper.js";

function skipIfNoApi() {
  test.skip(!Config.apiBaseUrl(), "Requires backend API");
}

/**
 * Registers a user, enables 2FA via API, and returns credentials + TOTP secret.
 */
async function registerUserWith2fa(
  request: import("@playwright/test").APIRequestContext,
): Promise<{ email: string; password: string; totpSecret: string; token: string }> {
  const regData = TestDataFactory.validRegisterData();

  // Register user
  await request.post(`${Config.apiBaseUrl()}/api/v1/auth/register`, {
    data: {
      email: regData.email,
      password: regData.password,
      firstName: regData.firstName,
      lastName: regData.lastName,
    },
  });

  // Login to get auth token
  const loginResponse = await request.post(`${Config.apiBaseUrl()}/api/v1/auth/login`, {
    data: { email: regData.email, password: regData.password },
  });

  // Extract access token from cookies
  const setCookie = loginResponse.headers()["set-cookie"] ?? "";
  const tokenMatch = setCookie.match(/access_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : "";

  // Initiate 2FA setup via API
  const setupResponse = await request.post(`${Config.apiBaseUrl()}/api/v1/auth/2fa/setup`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!setupResponse.ok()) {
    throw new Error(`2FA setup failed: ${setupResponse.status()}`);
  }
  const setupData = (await setupResponse.json()) as { manualEntryKey: string };

  // Verify 2FA setup with a valid TOTP code
  const code = TotpHelper.generateCode(setupData.manualEntryKey);
  const verifyResponse = await request.post(`${Config.apiBaseUrl()}/api/v1/auth/2fa/verify-setup`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { code },
  });
  if (!verifyResponse.ok()) {
    throw new Error(`2FA verify-setup failed: ${verifyResponse.status()}`);
  }

  return {
    email: regData.email,
    password: regData.password,
    totpSecret: setupData.manualEntryKey,
    token,
  };
}

test.describe("TOTP 2FA disable", { tag: [Tag.REGRESSION] }, () => {
  test("should display disable 2FA button when 2FA is enabled", async ({
    securitySettingsPage,
    request,
  }) => {
    skipIfNoApi();

    const user = await registerUserWith2fa(request);

    // Set auth cookies on the page context
    await securitySettingsPage.page
      .context()
      .addCookies([{ name: "access_token", value: user.token, url: Config.baseUrl() }]);

    await securitySettingsPage.goto();
    await expect(securitySettingsPage.disableButton).toBeVisible();
    await expect(securitySettingsPage.status).toBeVisible();
  });

  test(
    "should disable 2FA with valid TOTP code",
    { tag: [Tag.SMOKE] },
    async ({ securitySettingsPage, request }) => {
      skipIfNoApi();

      const user = await registerUserWith2fa(request);

      // Set auth cookies on the page context
      await securitySettingsPage.page
        .context()
        .addCookies([{ name: "access_token", value: user.token, url: Config.baseUrl() }]);

      await securitySettingsPage.goto();
      await securitySettingsPage.disableButton.click();

      // Generate a valid TOTP code and confirm disable
      const code = TotpHelper.generateCode(user.totpSecret);
      await securitySettingsPage.disableTwoFactor(user.password, code);
      await expect(securitySettingsPage.successMessage).toBeVisible();
    },
  );

  test(
    "should reject invalid TOTP code when disabling 2FA",
    { tag: [Tag.NEGATIVE] },
    async ({ securitySettingsPage, request }) => {
      skipIfNoApi();

      const user = await registerUserWith2fa(request);

      // Set auth cookies on the page context
      await securitySettingsPage.page
        .context()
        .addCookies([{ name: "access_token", value: user.token, url: Config.baseUrl() }]);

      await securitySettingsPage.goto();
      await securitySettingsPage.disableButton.click();

      // Try with an invalid code
      await securitySettingsPage.disableTwoFactor(user.password, "000000");
      await expect(securitySettingsPage.errorMessage).toBeVisible();
    },
  );

  test("should show enable button after successfully disabling 2FA", async ({
    securitySettingsPage,
    request,
  }) => {
    skipIfNoApi();

    const user = await registerUserWith2fa(request);

    // Set auth cookies on the page context
    await securitySettingsPage.page
      .context()
      .addCookies([{ name: "access_token", value: user.token, url: Config.baseUrl() }]);

    await securitySettingsPage.goto();
    await securitySettingsPage.disableButton.click();

    // Disable 2FA
    const code = TotpHelper.generateCode(user.totpSecret);
    await securitySettingsPage.disableTwoFactor(user.password, code);
    await expect(securitySettingsPage.successMessage).toBeVisible();

    // Reload and verify enable button is back
    await securitySettingsPage.goto();
    await expect(securitySettingsPage.enableButton).toBeVisible();
  });

  test("should allow normal login without 2FA after disabling it", async ({
    securitySettingsPage,
    loginPage,
    request,
  }) => {
    skipIfNoApi();

    const user = await registerUserWith2fa(request);

    // Set auth cookies on the page context
    await securitySettingsPage.page
      .context()
      .addCookies([{ name: "access_token", value: user.token, url: Config.baseUrl() }]);

    // Disable 2FA
    await securitySettingsPage.goto();
    await securitySettingsPage.disableButton.click();
    const code = TotpHelper.generateCode(user.totpSecret);
    await securitySettingsPage.disableTwoFactor(user.password, code);
    await expect(securitySettingsPage.successMessage).toBeVisible();

    // Clear cookies and login again - should go directly to home
    await loginPage.page.context().clearCookies();
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await expect(loginPage.page).toHaveURL(Route.HOME);
  });
});
