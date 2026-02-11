import type { Locator } from "@playwright/test";
import { expect, type Page, test } from "@playwright/test";

export async function assertPageTitle(page: Page, title: string | RegExp): Promise<void> {
  await test.step(`Assert page title matches: ${title}`, async () => {
    await expect(page).toHaveTitle(title);
  });
}

export async function assertUrl(page: Page, url: string | RegExp): Promise<void> {
  await test.step(`Assert URL matches: ${url}`, async () => {
    await expect(page).toHaveURL(url);
  });
}

export async function assertVisible(locator: Locator, description?: string): Promise<void> {
  await test.step(`Assert visible: ${description ?? locator.toString()}`, async () => {
    await expect(locator).toBeVisible();
  });
}

export async function assertTextContent(
  locator: Locator,
  text: string | RegExp,
  description?: string,
): Promise<void> {
  await test.step(`Assert text: ${description ?? locator.toString()}`, async () => {
    await expect(locator).toHaveText(text);
  });
}
