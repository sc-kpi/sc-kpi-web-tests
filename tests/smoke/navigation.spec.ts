import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Navigation", { tag: [Tag.SMOKE] }, () => {
  test.skip("should display the navigation bar", async ({ page, navigation }) => {
    // Skip: navigation component not built yet
    await page.goto("/");
    await expect(navigation.nav).toBeVisible();
  });
});
