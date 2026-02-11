import type { Locator, Page } from "@playwright/test";

export class NavigationComponent {
  readonly page: Page;
  readonly nav: Locator;
  readonly homeLink: Locator;
  readonly clubsLink: Locator;
  readonly projectsLink: Locator;
  readonly departmentsLink: Locator;
  readonly documentsLink: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.getByRole("navigation");
    this.homeLink = this.nav.getByRole("link", { name: /home|головна/i });
    this.clubsLink = this.nav.getByRole("link", { name: /clubs|клуби/i });
    this.projectsLink = this.nav.getByRole("link", { name: /projects|проєкти/i });
    this.departmentsLink = this.nav.getByRole("link", { name: /departments|департаменти/i });
    this.documentsLink = this.nav.getByRole("link", { name: /documents|документи/i });
    this.loginLink = this.nav.getByRole("link", { name: /login|увійти/i });
  }
}
