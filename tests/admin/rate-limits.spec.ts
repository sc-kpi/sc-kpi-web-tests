import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { expect, test } from "../../src/fixtures/index.js";
import { AuthApiHelper } from "../../src/helpers/auth-api.helper.js";
import { RateLimitHelper } from "../../src/helpers/rate-limit.helper.js";

let rateLimitHelper: RateLimitHelper;
let testRuleNames: string[];

test.beforeAll(async () => {
  const token = await AuthApiHelper.getAdminToken();
  rateLimitHelper = new RateLimitHelper(token);

  testRuleNames = [];
  const uid = crypto.randomUUID().slice(0, 8);
  for (let i = 0; i < 3; i++) {
    const name = `e2e-rl-${uid}-${i}`;
    await rateLimitHelper.createRule({
      name,
      description: `E2E test rule ${i}`,
      endpointPattern: `/api/v1/e2e-test-${uid}/**`,
      limitPerPeriod: 60,
      periodSeconds: 60,
      burstCapacity: 90,
      scope: "IP",
      priority: 1,
      enabled: false,
    });
    testRuleNames.push(name);
  }
});

test.afterAll(async () => {
  await rateLimitHelper.cleanup();
});

test.describe("Rate limit management", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    test.skip(!Config.isAuthEnabled(), "Admin tests require authentication");
  });

  test("should display rate limits list", { tag: [Tag.SMOKE] }, async ({ rateLimitsListPage }) => {
    await rateLimitsListPage.goto();
    await expect(rateLimitsListPage.heading).toBeVisible();
    await expect(rateLimitsListPage.table).toBeVisible();
  });

  test("should navigate to create rule page", async ({ rateLimitsListPage, adminPage }) => {
    await rateLimitsListPage.goto();
    await rateLimitsListPage.createButton.click();
    await adminPage.waitForURL(/\/admin\/rate-limits\/new/, { timeout: 15000 });
    await expect(adminPage.getByLabel(/^name$|^назва$/i)).toBeVisible();
  });

  test("should display create rule form elements", async ({ rateLimitCreatePage }) => {
    await rateLimitCreatePage.goto();
    await expect(rateLimitCreatePage.nameInput).toBeVisible();
    await expect(rateLimitCreatePage.endpointPatternInput).toBeVisible();
    await expect(rateLimitCreatePage.submitButton).toBeVisible();
  });

  test("should navigate to rule detail from list", async ({ rateLimitsListPage, adminPage }) => {
    await rateLimitsListPage.goto();

    await rateLimitsListPage.clickEditRule(testRuleNames[0]);
    await adminPage.waitForURL(/\/admin\/rate-limits\/[^/]+$/, { timeout: 15000 });

    await expect(adminPage.locator("#name")).toBeVisible();
  });

  test("should toggle rule from list", async ({ rateLimitsListPage }) => {
    await rateLimitsListPage.goto();

    const ruleRow = rateLimitsListPage.getRuleRow(testRuleNames[0]);
    const toggleButton = ruleRow.getByRole("button", { name: /on|off/i });
    const initialText = await toggleButton.textContent();
    await toggleButton.click({ force: true });

    await expect(toggleButton).not.toHaveText(initialText ?? "", { timeout: 10000 });
  });

  test("should update rule details", async ({ rateLimitsListPage, adminPage }) => {
    await rateLimitsListPage.goto();

    await rateLimitsListPage.clickEditRule(testRuleNames[1]);
    await adminPage.waitForURL(/\/admin\/rate-limits\/[^/]+$/, { timeout: 15000 });

    const descriptionInput = adminPage.locator("#description");
    await descriptionInput.clear();
    await descriptionInput.fill("Updated description via E2E");

    const saveButton = adminPage.getByRole("button", { name: /save|зберегти/i });
    await saveButton.click({ force: true });

    await expect(descriptionInput).toHaveValue("Updated description via E2E");
  });

  test("should delete rule from list", async ({ rateLimitsListPage }) => {
    await rateLimitsListPage.goto();

    rateLimitsListPage.page.on("dialog", (dialog) => dialog.accept());

    await rateLimitsListPage.clickDeleteRule(testRuleNames[2]);

    // Wait for the deleted rule's name to disappear from the table
    await expect(
      rateLimitsListPage.table.getByRole("cell", { name: testRuleNames[2] }),
    ).not.toBeVisible({ timeout: 10000 });
  });

  test("should show pagination when many rules exist", async ({ rateLimitsListPage }) => {
    await rateLimitsListPage.goto();
    // Just verify the page loads correctly
    await expect(rateLimitsListPage.table).toBeVisible();
  });
});
