import { Route } from "../../src/config/routes.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Auth redirects", { tag: [Tag.REGRESSION, Tag.SECURITY] }, () => {
  test.skip("should redirect unauthenticated user from protected route to login", async ({
    page,
  }) => {
    // Skip: protected routes not implemented yet
    await page.goto(Route.PROFILE);
    await expect(page).toHaveURL(new RegExp(Route.LOGIN));
  });

  test("should allow access to public home page", async ({ page }) => {
    await page.goto(Route.HOME);
    await expect(page).toHaveURL("/");
  });
});
