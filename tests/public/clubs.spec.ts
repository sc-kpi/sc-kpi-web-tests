import { Route } from "../../src/config/routes.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Clubs page", { tag: [Tag.REGRESSION] }, () => {
  test.skip("should display clubs listing", async ({ page }) => {
    // Skip: clubs page not built yet
    await page.goto(Route.CLUBS);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
