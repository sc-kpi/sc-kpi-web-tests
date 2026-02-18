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
 * Registers a user, enables 2FA via API, and returns the TOTP secret.
 * This helper encapsulates the setup steps so individual tests stay clean.
 */
async function registerUserWith2fa(
  request: import("@playwright/test").APIRequestContext,
): Promise<{ email: string; password: string; totpSecret: string }> {
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
  };
}

test.describe("TOTP 2FA login", { tag: [Tag.REGRESSION] }, () => {
  test(
    "should redirect to 2FA verification after login when 2FA is enabled",
    { tag: [Tag.SMOKE] },
    async ({ loginPage, request }) => {
      skipIfNoApi();

      const user = await registerUserWith2fa(request);

      await loginPage.goto();
      await loginPage.login(user.email, user.password);

      // Should redirect to 2FA verification page
      await expect(loginPage.page).toHaveURL(Route.VERIFY_2FA);
    },
  );

  test(
    "should complete login with valid TOTP code after 2FA redirect",
    { tag: [Tag.SMOKE] },
    async ({ loginPage, verify2faPage, request }) => {
      skipIfNoApi();

      const user = await registerUserWith2fa(request);

      // Login with credentials
      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await expect(loginPage.page).toHaveURL(Route.VERIFY_2FA);

      // Enter valid TOTP code
      const code = TotpHelper.generateCode(user.totpSecret);
      await verify2faPage.enterCode(code);
      await verify2faPage.submit();

      // Should redirect to home page
      await expect(verify2faPage.page).toHaveURL(Route.HOME);
    },
  );

  test("should display verify 2FA page elements", async ({ loginPage, verify2faPage, request }) => {
    skipIfNoApi();

    const user = await registerUserWith2fa(request);

    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await expect(loginPage.page).toHaveURL(Route.VERIFY_2FA);

    await expect(verify2faPage.codeInput).toBeVisible();
    await expect(verify2faPage.submitButton).toBeVisible();
    await expect(verify2faPage.recoveryCodeLink).toBeVisible();
  });

  test(
    "should show error with invalid TOTP code",
    { tag: [Tag.NEGATIVE] },
    async ({ loginPage, verify2faPage, request }) => {
      skipIfNoApi();

      const user = await registerUserWith2fa(request);

      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await expect(loginPage.page).toHaveURL(Route.VERIFY_2FA);

      // Enter invalid code
      await verify2faPage.enterCode("000000");
      await verify2faPage.submit();
      await expect(verify2faPage.errorMessage).toBeVisible();
    },
  );

  test(
    "should show error with expired TOTP code format",
    { tag: [Tag.NEGATIVE] },
    async ({ loginPage, verify2faPage, request }) => {
      skipIfNoApi();

      const user = await registerUserWith2fa(request);

      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await expect(loginPage.page).toHaveURL(Route.VERIFY_2FA);

      // Enter a valid-format but expired/wrong code
      await verify2faPage.enterCode("999999");
      await verify2faPage.submit();
      await expect(verify2faPage.errorMessage).toBeVisible();
    },
  );

  test(
    "should not allow access to protected pages without completing 2FA",
    { tag: [Tag.SECURITY] },
    async ({ loginPage, request }) => {
      skipIfNoApi();

      const user = await registerUserWith2fa(request);

      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await expect(loginPage.page).toHaveURL(Route.VERIFY_2FA);

      // Try navigating to a protected (non-public) page without completing 2FA
      await loginPage.page.goto(Config.baseUrl() + Route.PROFILE);
      await expect(loginPage.page).not.toHaveURL(new RegExp(Route.PROFILE));
    },
  );
});
