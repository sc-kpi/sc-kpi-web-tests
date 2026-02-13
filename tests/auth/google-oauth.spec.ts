import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Google OAuth", { tag: [Tag.REGRESSION] }, () => {
  test(
    "should display Google sign-in button on login page",
    { tag: [Tag.SMOKE] },
    async ({ loginPage }) => {
      await loginPage.goto();
      const googleButton = loginPage.page.getByRole("button", { name: /google/i });
      await expect(googleButton).toBeVisible();
    },
  );

  test("should display Google sign-in button on register page", async ({ registerPage }) => {
    await registerPage.goto();
    const googleButton = registerPage.page.getByRole("button", { name: /google/i });
    await expect(googleButton).toBeVisible();
  });

  test("should have Google button as type=button (not submit)", async ({ loginPage }) => {
    await loginPage.goto();
    const googleButton = loginPage.page.getByRole("button", { name: /google/i });
    await expect(googleButton).toHaveAttribute("type", "button");
  });

  test(
    "should navigate to API OAuth endpoint when clicking Google button on login",
    { tag: [Tag.SECURITY] },
    async ({ loginPage }) => {
      test.skip(!Config.apiBaseUrl(), "Requires backend API");
      await loginPage.goto();
      const googleButton = loginPage.page.getByRole("button", { name: /google/i });

      // Listen for navigation to the OAuth endpoint
      const [request] = await Promise.all([
        loginPage.page.waitForRequest((req) => req.url().includes("/oauth2/google")),
        googleButton.click(),
      ]);

      expect(request.url()).toContain("/api/v1/auth/oauth2/google");
    },
  );

  test("should navigate to API OAuth endpoint when clicking Google button on register", async ({
    registerPage,
  }) => {
    test.skip(!Config.apiBaseUrl(), "Requires backend API");
    await registerPage.goto();
    const googleButton = registerPage.page.getByRole("button", { name: /google/i });

    const [request] = await Promise.all([
      registerPage.page.waitForRequest((req) => req.url().includes("/oauth2/google")),
      googleButton.click(),
    ]);

    expect(request.url()).toContain("/api/v1/auth/oauth2/google");
  });
});
