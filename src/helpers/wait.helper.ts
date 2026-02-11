import type { Page } from "@playwright/test";

export async function waitForNetworkIdle(page: Page, timeout?: number): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout });
}

export async function waitForNavigation(page: Page, url: string | RegExp): Promise<void> {
  await page.waitForURL(url);
}
