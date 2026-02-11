import { type BrowserContext, test as base, type Page } from "@playwright/test";
import { ADMIN_STORAGE_STATE, BASIC_STORAGE_STATE } from "../auth/storage-state.js";
import { HomePage } from "../pages/home.page.js";
import { LoginPage } from "../pages/login.page.js";
import { NavigationComponent } from "../pages/navigation.component.js";
import { RegisterPage } from "../pages/register.page.js";

interface PageFixtures {
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  navigation: NavigationComponent;
}

interface AuthFixtures {
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
  adminPage: Page;
  adminContext: BrowserContext;
}

export const test = base.extend<PageFixtures & AuthFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  navigation: async ({ page }, use) => {
    await use(new NavigationComponent(page));
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
