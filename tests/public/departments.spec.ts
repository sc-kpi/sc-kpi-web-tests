import { Route } from "../../src/config/routes.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Departments page", { tag: [Tag.REGRESSION] }, () => {
  test.skip("should display departments listing", async ({ page }) => {
    // Skip: departments page not built yet
    await page.goto(Route.DEPARTMENTS);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
