import { Route } from "../../src/config/routes.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Projects page", { tag: [Tag.REGRESSION] }, () => {
  test.skip("should display projects listing", async ({ page }) => {
    // Skip: projects page not built yet
    await page.goto(Route.PROJECTS);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
