import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Home page", { tag: [Tag.SMOKE, Tag.POSITIVE] }, () => {
  test("should display the main heading", async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.title).toBeVisible();
  });

  test("should stay on root URL (no locale prefix)", async ({ homePage, page }) => {
    await homePage.goto();
    await expect(page).toHaveURL("/");
  });

  test("should display Ukrainian content by default", async ({ homePage }) => {
    await homePage.goto();
    await expect(
      homePage.page.getByRole("heading", { name: "Студентська Рада КПІ" }),
    ).toBeVisible();
  });
});
