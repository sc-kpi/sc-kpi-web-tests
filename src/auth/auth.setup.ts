import { test as setup } from "@playwright/test";
import { Config } from "../config/config.js";
import { ADMIN_STORAGE_STATE, BASIC_STORAGE_STATE } from "./storage-state.js";

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

setup("authenticate as admin user", async ({ page }) => {
  if (!Config.isAuthEnabled()) {
    await page.context().storageState({ path: ADMIN_STORAGE_STATE });
    return;
  }

  const credentials = Config.auth().tierCredentials.admin;
  if (!credentials) {
    throw new Error("Admin tier credentials not configured");
  }

  await page.goto(Config.baseUrl() + Config.auth().loginEndpoint);
  await page.getByLabel(/email|пошта/i).fill(credentials.email);
  await page.getByLabel(/password|пароль/i).fill(credentials.password);
  await page.getByRole("button", { name: /log in|sign in|увійти/i }).click();
  await page.waitForURL("**/");

  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});
