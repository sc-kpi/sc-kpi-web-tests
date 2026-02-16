import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("Notification preferences", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/notifications/preferences");
    await authenticatedPage.waitForLoadState("domcontentloaded");
  });

  test("should display preferences form", async ({ authenticatedPage }) => {
    const saveButton = authenticatedPage.getByRole("button", {
      name: /save|зберегти/i,
    });
    await expect(saveButton).toBeVisible();
  });

  test("should show preference switches", async ({ authenticatedPage }) => {
    const switches = authenticatedPage.getByRole("switch");
    await expect(switches.first()).toBeVisible();
    // 4 categories x 2 channels = 8 switches
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(8);
  });
});
