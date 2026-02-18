import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { test as setup } from "@playwright/test";
import { Config } from "../config/config.js";
import { Route } from "../config/routes.js";
import { TotpHelper } from "../helpers/totp.helper.js";
import { ADMIN_STORAGE_STATE, BASIC_STORAGE_STATE } from "./storage-state.js";

const ADMIN_TOTP_SECRET_PATH = resolve(
  import.meta.dirname,
  "../../playwright/.auth/.admin-totp-secret",
);

setup("authenticate as basic user", async ({ page }) => {
  if (!Config.isAuthEnabled()) {
    await page.context().storageState({ path: BASIC_STORAGE_STATE });
    return;
  }

  const credentials = Config.auth().tierCredentials.basic;
  if (!credentials) {
    throw new Error("Basic tier credentials not configured");
  }

  await page.goto(Config.baseUrl() + Config.auth().loginEndpoint);
  await page.getByLabel(/email|пошта/i).fill(credentials.email);
  await page.getByLabel(/password|пароль/i).fill(credentials.password);
  await page.getByRole("button", { name: /log in|sign in|увійти/i }).click();
  await page.waitForURL("**/");

  await page.context().storageState({ path: BASIC_STORAGE_STATE });
});

setup("authenticate as admin user", async ({ page, request }) => {
  if (!Config.isAuthEnabled()) {
    await page.context().storageState({ path: ADMIN_STORAGE_STATE });
    return;
  }

  const credentials = Config.auth().tierCredentials.admin;
  if (!credentials) {
    throw new Error("Admin tier credentials not configured");
  }

  const apiBase = Config.apiBaseUrl();

  // Step 1: Setup 2FA for admin via API
  const loginResponse = await request.post(`${apiBase}/api/v1/auth/login`, {
    data: { email: credentials.email, password: credentials.password },
  });
  const loginStatus = loginResponse.status();
  const loginHeaders = loginResponse.headers();
  const loginBody = await loginResponse.text();
  const loginCookies = loginHeaders["set-cookie"] ?? "";
  console.log(`[DEBUG] Login status: ${loginStatus}`);
  console.log(`[DEBUG] Login set-cookie: ${loginCookies.substring(0, 200)}`);
  console.log(`[DEBUG] Login body: ${loginBody.substring(0, 200)}`);
  console.log(`[DEBUG] All header keys: ${Object.keys(loginHeaders).join(", ")}`);
  const tokenMatch = loginCookies.match(/access_token=([^;]+)/);
  const accessToken = tokenMatch?.[1];
  if (!accessToken) {
    throw new Error(
      `No access_token cookie in admin login response (status=${loginStatus}, set-cookie=${loginCookies.substring(0, 300)}, body=${loginBody.substring(0, 200)})`,
    );
  }

  // Step 2: Setup TOTP — use explicit Bearer auth, suppress auto-cookies
  const setupResponse = await request.fetch(`${apiBase}/api/v1/auth/2fa/setup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Cookie: "",
    },
  });
  if (!setupResponse.ok()) {
    const body = await setupResponse.text();
    throw new Error(`2FA setup failed: ${setupResponse.status()} | body: ${body}`);
  }
  const setupData = (await setupResponse.json()) as { manualEntryKey: string };
  const totpSecret = setupData.manualEntryKey;

  // Step 3: Verify TOTP setup — use fetch() to avoid cookie interference
  const setupCode = TotpHelper.generateCode(totpSecret);
  const verifyResponse = await request.fetch(`${apiBase}/api/v1/auth/2fa/verify-setup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Cookie: "",
    },
    data: { code: setupCode },
  });
  if (!verifyResponse.ok()) {
    const body = await verifyResponse.text();
    throw new Error(`2FA verify-setup failed: ${verifyResponse.status()} | body: ${body}`);
  }

  // Save TOTP secret for reuse by other helpers
  writeFileSync(ADMIN_TOTP_SECRET_PATH, totpSecret, "utf-8");

  // Step 4: Browser login — will redirect to 2FA verification
  await page.goto(Config.baseUrl() + Config.auth().loginEndpoint);
  await page.getByLabel(/email|пошта/i).fill(credentials.email);
  await page.getByLabel(/password|пароль/i).fill(credentials.password);
  await page.getByRole("button", { name: /log in|sign in|увійти/i }).click();

  // Step 5: Handle 2FA verification page
  await page.waitForURL(`**${Route.VERIFY_2FA}`);
  const mfaCode = TotpHelper.generateCode(totpSecret);
  await page.getByLabel(/code|код/i).fill(mfaCode);
  await page.getByRole("button", { name: /verify|підтвердити/i }).click();

  // Step 6: Wait for redirect to home
  await page.waitForURL("**/");

  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});
