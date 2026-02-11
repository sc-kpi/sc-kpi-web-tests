import { Route } from "../../src/config/routes.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Documents page", { tag: [Tag.REGRESSION] }, () => {
  test.skip("should display documents listing", async ({ page }) => {
    // Skip: documents page not built yet
    await page.goto(Route.DOCUMENTS);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
