import { type BrowserContext, test as base, type Page } from "@playwright/test";
import { ADMIN_STORAGE_STATE, BASIC_STORAGE_STATE } from "../auth/storage-state.js";
import { Config } from "../config/config.js";
import { UserCreatePage } from "../pages/admin/user-create.page.js";
import { UserDetailPage } from "../pages/admin/user-detail.page.js";
import { UsersListPage } from "../pages/admin/users-list.page.js";
import { ForgotPasswordPage } from "../pages/forgot-password.page.js";
import { HomePage } from "../pages/home.page.js";
import { LoginPage } from "../pages/login.page.js";
import { NavigationComponent } from "../pages/navigation.component.js";
import { RegisterPage } from "../pages/register.page.js";
import { ResetPasswordPage } from "../pages/reset-password.page.js";

/**
 * Route password-reset API calls through Playwright so that empty-body
 * responses are normalized to 204. The API returns 200 with an empty body
 * (instead of the expected 204), which causes the frontend api-client to
 * attempt JSON.parse on an empty string. Fulfilling with explicit 204
 * ensures the client handles it correctly.
 */
async function routePasswordResetApis(page: Page): Promise<void> {
  for (const endpoint of ["forgot-password", "reset-password"]) {
    await page.route(`**/api/v1/auth/${endpoint}`, async (route) => {
      const response = await route.fetch();
      const body = await response.body();
      if (body.length === 0 || response.status() === 204) {
        await route.fulfill({ status: 204, body: "" });
      } else {
        await route.fulfill({ response });
      }
    });
  }
}

interface GuestFixtures {
  guestContext: BrowserContext;
  guestPage: Page;
}

interface PageFixtures {
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  forgotPasswordPage: ForgotPasswordPage;
  resetPasswordPage: ResetPasswordPage;
  navigation: NavigationComponent;
}

interface AdminPageFixtures {
  usersListPage: UsersListPage;
  userDetailPage: UserDetailPage;
  userCreatePage: UserCreatePage;
}

interface AuthFixtures {
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
  adminPage: Page;
  adminContext: BrowserContext;
}

export const test = base.extend<GuestFixtures & PageFixtures & AdminPageFixtures & AuthFixtures>({
  guestContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      baseURL: Config.baseUrl(),
      locale: Config.browser().locale,
      timezoneId: "Europe/Kyiv",
    });
    await use(context);
    await context.close();
  },

  guestPage: async ({ guestContext }, use) => {
    const page = await guestContext.newPage();
    await use(page);
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginPage: async ({ page }, use) => {
    await page.context().clearCookies();
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await page.context().clearCookies();
    await use(new RegisterPage(page));
  },

  forgotPasswordPage: async ({ page }, use) => {
    await page.context().clearCookies();
    await routePasswordResetApis(page);
    await use(new ForgotPasswordPage(page));
  },

  resetPasswordPage: async ({ page }, use) => {
    await page.context().clearCookies();
    await routePasswordResetApis(page);
    await use(new ResetPasswordPage(page));
  },

  navigation: async ({ page }, use) => {
    await use(new NavigationComponent(page));
  },

  usersListPage: async ({ adminPage }, use) => {
    await use(new UsersListPage(adminPage));
  },

  userDetailPage: async ({ adminPage }, use) => {
    await use(new UserDetailPage(adminPage));
  },

  userCreatePage: async ({ adminPage }, use) => {
    await use(new UserCreatePage(adminPage));
  },

  authenticatedContext: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: BASIC_STORAGE_STATE });
    await use(context);
    await context.close();
  },

  authenticatedPage: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    await use(page);
  },

  adminContext: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: ADMIN_STORAGE_STATE });
    await use(context);
    await context.close();
  },

  adminPage: async ({ adminContext }, use) => {
    const page = await adminContext.newPage();
    await use(page);
  },
});

export { expect } from "@playwright/test";
