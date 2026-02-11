import type { Page } from "@playwright/test";
import { test } from "@playwright/test";

export async function attachScreenshot(page: Page, name = "screenshot"): Promise<void> {
  await test.step(`Attach screenshot: ${name}`, async () => {
    const buffer = await page.screenshot();
    await test.info().attach(name, { body: buffer, contentType: "image/png" });
  });
}

export async function attachText(name: string, content: string): Promise<void> {
  await test.info().attach(name, { body: content, contentType: "text/plain" });
}

export async function attachJson(name: string, data: unknown): Promise<void> {
  await test.info().attach(name, {
    body: JSON.stringify(data, null, 2),
    contentType: "application/json",
  });
}

export async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return test.step(name, fn);
}
