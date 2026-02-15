import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { TestDataFactory } from "../../src/data/test-data-factory.js";
import { expect, test } from "../../src/fixtures/index.js";
import { AuthApiHelper } from "../../src/helpers/auth-api.helper.js";
import { FeatureFlagHelper } from "../../src/helpers/feature-flag.helper.js";

let flagHelper: FeatureFlagHelper;
let testFlagKey: string;

test.beforeAll(async () => {
  const token = await AuthApiHelper.getAdminToken();
  flagHelper = new FeatureFlagHelper(token);

  testFlagKey = `e2e-audit-${crypto.randomUUID().slice(0, 8)}`;
  await flagHelper.createFlag({
    key: testFlagKey,
    name: `E2E Audit ${TestDataFactory.randomName()}`,
    enabled: false,
    rolloutPercentage: 100,
  });
});

test.afterAll(async () => {
  await flagHelper.cleanup();
});

test.describe("Feature flag audit log (centralized)", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    test.skip(!Config.isAuthEnabled(), "Admin tests require authentication");
  });

  test("should have audit log link on feature flag detail page", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();

    await featureFlagsListPage.clickEditFlag(testFlagKey);
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    // Detail page should have a link to centralized audit logs
    const auditLink = adminPage.getByRole("link", {
      name: /audit log|журнал змін/i,
    });
    await expect(auditLink).toBeVisible();
  });

  test("should navigate to centralized audit page filtered by feature flag", async ({
    featureFlagsListPage,
    adminPage,
  }) => {
    await featureFlagsListPage.goto();

    await featureFlagsListPage.clickEditFlag(testFlagKey);
    await adminPage.waitForURL(/\/admin\/feature-flags\/[^/]+$/, { timeout: 15000 });

    const auditLink = adminPage.getByRole("link", {
      name: /audit log|журнал змін/i,
    });
    await auditLink.click({ force: true });

    await adminPage.waitForURL(/\/admin\/audit-logs\?/, { timeout: 15000 });
    expect(adminPage.url()).toContain("entityType=FEATURE_FLAG");
  });
});
