import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { TestDataFactory } from "../../src/data/test-data-factory.js";
import { expect, test } from "../../src/fixtures/index.js";
import { TotpHelper } from "../../src/helpers/totp.helper.js";

function skipIfNoApi() {
  test.skip(!Config.apiBaseUrl(), "Requires backend API");
}

test.describe("TOTP 2FA setup", { tag: [Tag.REGRESSION] }, () => {
  test(
    "should display security settings page with enable 2FA button",
    { tag: [Tag.SMOKE] },
    async ({ securitySettingsPage, request }) => {
      skipIfNoApi();

      // Register a dedicated test user via API
      const regData = TestDataFactory.validRegisterData();
      await request.post(`${Config.apiBaseUrl()}/api/v1/auth/register`, {
        data: {
          email: regData.email,
          password: regData.password,
          firstName: regData.firstName,
          lastName: regData.lastName,
        },
      });

      // Login via API and set cookies on the page context
      const loginResponse = await request.post(`${Config.apiBaseUrl()}/api/v1/auth/login`, {
        data: { email: regData.email, password: regData.password },
      });
      const cookies = loginResponse.headers()["set-cookie"];
      if (cookies) {
        const parsed = cookies.split(";").map((c) => c.trim());
        for (const cookie of parsed) {
          const [name, value] = cookie.split("=");
          if (name && value) {
            await securitySettingsPage.page
              .context()
              .addCookies([{ name, value, url: Config.baseUrl() }]);
          }
        }
      }

      await securitySettingsPage.goto();
      await expect(securitySettingsPage.enableButton).toBeVisible();
    },
  );

  test("should enable 2FA and show QR code with secret key", async ({
    securitySettingsPage,
    request,
  }) => {
    skipIfNoApi();

    // Register a dedicated test user via API
    const regData = TestDataFactory.validRegisterData();
    await request.post(`${Config.apiBaseUrl()}/api/v1/auth/register`, {
      data: {
        email: regData.email,
        password: regData.password,
        firstName: regData.firstName,
        lastName: regData.lastName,
      },
    });

    // Login via API and set cookies on the page context
    const loginResponse = await request.post(`${Config.apiBaseUrl()}/api/v1/auth/login`, {
      data: { email: regData.email, password: regData.password },
    });
    const cookies = loginResponse.headers()["set-cookie"];
    if (cookies) {
      const parsed = cookies.split(";").map((c) => c.trim());
      for (const cookie of parsed) {
        const [name, value] = cookie.split("=");
        if (name && value) {
          await securitySettingsPage.page
            .context()
            .addCookies([{ name, value, url: Config.baseUrl() }]);
        }
      }
    }

    await securitySettingsPage.goto();
    await securitySettingsPage.enableButton.click();

    // QR code and secret key should be displayed
    await expect(securitySettingsPage.qrCode).toBeVisible();
    await expect(securitySettingsPage.secretKey).toBeVisible();
  });

  test("should complete 2FA setup with valid TOTP code", async ({
    securitySettingsPage,
    request,
  }) => {
    skipIfNoApi();

    // Register a dedicated test user via API
    const regData = TestDataFactory.validRegisterData();
    await request.post(`${Config.apiBaseUrl()}/api/v1/auth/register`, {
      data: {
        email: regData.email,
        password: regData.password,
        firstName: regData.firstName,
        lastName: regData.lastName,
      },
    });

    // Login via API and set cookies on the page context
    const loginResponse = await request.post(`${Config.apiBaseUrl()}/api/v1/auth/login`, {
      data: { email: regData.email, password: regData.password },
    });
    const cookies = loginResponse.headers()["set-cookie"];
    if (cookies) {
      const parsed = cookies.split(";").map((c) => c.trim());
      for (const cookie of parsed) {
        const [name, value] = cookie.split("=");
        if (name && value) {
          await securitySettingsPage.page
            .context()
            .addCookies([{ name, value, url: Config.baseUrl() }]);
        }
      }
    }

    await securitySettingsPage.goto();
    await securitySettingsPage.enableButton.click();

    // Get the secret key and generate a TOTP code
    await expect(securitySettingsPage.secretKey).toBeVisible();
    const secret = await securitySettingsPage.getSecretKeyText();
    const code = TotpHelper.generateCode(secret);

    // Confirm 2FA with the generated code
    await securitySettingsPage.enableTwoFactor(code);
    await expect(securitySettingsPage.successMessage).toBeVisible();
  });

  test(
    "should reject invalid TOTP code during setup",
    { tag: [Tag.NEGATIVE] },
    async ({ securitySettingsPage, request }) => {
      skipIfNoApi();

      // Register a dedicated test user via API
      const regData = TestDataFactory.validRegisterData();
      await request.post(`${Config.apiBaseUrl()}/api/v1/auth/register`, {
        data: {
          email: regData.email,
          password: regData.password,
          firstName: regData.firstName,
          lastName: regData.lastName,
        },
      });

      // Login via API and set cookies on the page context
      const loginResponse = await request.post(`${Config.apiBaseUrl()}/api/v1/auth/login`, {
        data: { email: regData.email, password: regData.password },
      });
      const cookies = loginResponse.headers()["set-cookie"];
      if (cookies) {
        const parsed = cookies.split(";").map((c) => c.trim());
        for (const cookie of parsed) {
          const [name, value] = cookie.split("=");
          if (name && value) {
            await securitySettingsPage.page
              .context()
              .addCookies([{ name, value, url: Config.baseUrl() }]);
          }
        }
      }

      await securitySettingsPage.goto();
      await securitySettingsPage.enableButton.click();

      // Try with an invalid code
      await securitySettingsPage.enableTwoFactor("000000");
      await expect(securitySettingsPage.errorMessage).toBeVisible();
    },
  );

  test("should show 2FA status after enabling", async ({ securitySettingsPage, request }) => {
    skipIfNoApi();

    // Register a dedicated test user via API
    const regData = TestDataFactory.validRegisterData();
    await request.post(`${Config.apiBaseUrl()}/api/v1/auth/register`, {
      data: {
        email: regData.email,
        password: regData.password,
        firstName: regData.firstName,
        lastName: regData.lastName,
      },
    });

    // Login via API and set cookies on the page context
    const loginResponse = await request.post(`${Config.apiBaseUrl()}/api/v1/auth/login`, {
      data: { email: regData.email, password: regData.password },
    });
    const cookies = loginResponse.headers()["set-cookie"];
    if (cookies) {
      const parsed = cookies.split(";").map((c) => c.trim());
      for (const cookie of parsed) {
        const [name, value] = cookie.split("=");
        if (name && value) {
          await securitySettingsPage.page
            .context()
            .addCookies([{ name, value, url: Config.baseUrl() }]);
        }
      }
    }

    await securitySettingsPage.goto();
    await securitySettingsPage.enableButton.click();

    // Complete setup
    await expect(securitySettingsPage.secretKey).toBeVisible();
    const secret = await securitySettingsPage.getSecretKeyText();
    const code = TotpHelper.generateCode(secret);
    await securitySettingsPage.enableTwoFactor(code);
    await expect(securitySettingsPage.successMessage).toBeVisible();

    // Verify status reflects enabled state
    await securitySettingsPage.goto();
    await expect(securitySettingsPage.status).toBeVisible();
    await expect(securitySettingsPage.disableButton).toBeVisible();
  });
});
