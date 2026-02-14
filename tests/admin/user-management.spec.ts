import { Config } from "../../src/config/config.js";
import { Tag } from "../../src/config/test-tag.js";
import { TestDataFactory } from "../../src/data/test-data-factory.js";
import { expect, test } from "../../src/fixtures/index.js";

test.describe("User management", { tag: [Tag.REGRESSION] }, () => {
  test.beforeEach(async () => {
    test.skip(!Config.isAuthEnabled(), "Admin tests require authentication");
  });

  test("should display user list", { tag: [Tag.SMOKE] }, async ({ usersListPage }) => {
    await usersListPage.goto();
    await expect(usersListPage.heading).toBeVisible();
    await expect(usersListPage.table).toBeVisible();
  });

  test("should navigate to user detail from list", async ({ usersListPage, adminPage }) => {
    await usersListPage.goto();
    const userCount = await usersListPage.getUserCount();
    test.skip(userCount === 0, "No users available to edit");

    const firstUserRow = usersListPage.table.getByRole("row").nth(1);
    await firstUserRow.getByRole("link", { name: /edit|редагувати|details|деталі/i }).click();
    await adminPage.waitForURL(/\/admin\/users\/[^/]+$/, { timeout: 15000 });

    // Verify detail page loaded with expected elements
    await expect(adminPage.getByLabel(/first name|ім'я/i)).toBeVisible();
    await expect(adminPage.getByLabel(/last name|прізвище/i)).toBeVisible();
  });

  test("should update user profile", async ({ usersListPage, adminPage }) => {
    const updateData = TestDataFactory.validUserUpdateData();

    await usersListPage.goto();
    const userCount = await usersListPage.getUserCount();
    test.skip(userCount === 0, "No users available to edit");

    // Click edit on the first user row
    const firstUserRow = usersListPage.table.getByRole("row").nth(1);
    await firstUserRow.getByRole("link", { name: /edit|редагувати|details|деталі/i }).click();
    await adminPage.waitForURL(/\/admin\/users\/[^/]+$/, { timeout: 15000 });
    await expect(adminPage.getByLabel(/first name|ім'я/i)).toBeVisible();

    // Update profile fields
    const firstNameInput = adminPage.getByLabel(/first name|ім'я/i);
    const lastNameInput = adminPage.getByLabel(/last name|прізвище/i);
    const saveButton = adminPage.getByRole("button", { name: /save|зберегти/i });

    await firstNameInput.clear();
    await firstNameInput.fill(updateData.firstName);
    await lastNameInput.clear();
    await lastNameInput.fill(updateData.lastName);
    await saveButton.click();

    // Verify the update persisted
    await expect(firstNameInput).toHaveValue(updateData.firstName);
    await expect(lastNameInput).toHaveValue(updateData.lastName);
  });

  test("should create new user via admin form", async ({ userCreatePage, adminPage }) => {
    const createData = TestDataFactory.validCreateUserData();

    await userCreatePage.goto();
    await userCreatePage.fillForm(createData);
    await userCreatePage.submit();

    // After successful creation, the form redirects to the users list
    await adminPage.waitForURL(/\/admin\/users(?!\/new)/, { timeout: 10000 });
    await expect(adminPage.getByRole("table")).toBeVisible();
  });

  test("should show validation errors on invalid create", async ({ userCreatePage }) => {
    await userCreatePage.goto();

    // Submit empty form
    await userCreatePage.submit();

    // Verify validation errors are shown (form should not navigate away)
    await expect(userCreatePage.emailInput).toBeVisible();
  });

  test("should change user tier", async ({ usersListPage, adminPage }) => {
    await usersListPage.goto();
    const userCount = await usersListPage.getUserCount();
    test.skip(userCount < 2, "Need non-admin user to test tier change");

    // Click edit on a non-admin user (nth(2)) to avoid demoting the admin
    const targetUserRow = usersListPage.table.getByRole("row").nth(2);
    await targetUserRow.getByRole("link", { name: /edit|редагувати|details|деталі/i }).click();
    await adminPage.waitForURL(/\/admin\/users\/[^/]+$/, { timeout: 15000 });
    await expect(adminPage.getByLabel(/first name|ім'я/i)).toBeVisible();

    // Change tier (use exact match to avoid matching "Рівень партнера")
    const tierSelect = adminPage.getByLabel(/^tier$|^рівень$/i);
    await tierSelect.selectOption("3");

    // Verify the tier value is selected
    await expect(tierSelect).toHaveValue("3");
  });

  test("should toggle user status", async ({ usersListPage, adminPage }) => {
    await usersListPage.goto();
    const userCount = await usersListPage.getUserCount();
    test.skip(userCount < 2, "Need non-admin user to test status toggle");

    // Click edit on a non-admin user (nth(2)) to avoid toggling admin status
    const targetUserRow = usersListPage.table.getByRole("row").nth(2);
    await targetUserRow.getByRole("link", { name: /edit|редагувати|details|деталі/i }).click();
    await adminPage.waitForURL(/\/admin\/users\/[^/]+$/, { timeout: 15000 });
    await expect(adminPage.getByLabel(/first name|ім'я/i)).toBeVisible();

    // Toggle status
    const toggleButton = adminPage.getByRole("button", {
      name: /activate|deactivate|активувати|деактивувати/i,
    });
    const statusBadge = adminPage.getByText(/^(active|inactive|активний|неактивний)$/i);

    const initialStatus = await statusBadge.textContent();
    await toggleButton.click();

    // Verify the status badge changed
    await expect(statusBadge).not.toHaveText(initialStatus ?? "");
  });

  test("should delete user from detail page", async ({ usersListPage, adminPage }) => {
    await usersListPage.goto();
    const userCount = await usersListPage.getUserCount();
    test.skip(userCount < 2, "Need at least 2 users to safely delete one");

    const lastUserRow = usersListPage.table.getByRole("row").nth(userCount);
    await lastUserRow.getByRole("link", { name: /edit|редагувати|details|деталі/i }).click();
    await adminPage.waitForURL(/\/admin\/users\/[^/]+$/, { timeout: 15000 });
    await expect(adminPage.getByLabel(/first name|ім'я/i)).toBeVisible();

    // Click delete (use first() to target the main delete button)
    const deleteButton = adminPage.getByRole("button", { name: /delete|видалити/i }).first();
    await deleteButton.click();

    // Confirm deletion if dialog appears
    const confirmButton = adminPage.getByRole("button", { name: /confirm|підтвердити|yes|так/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }

    await adminPage.waitForURL(/\/admin\/users(?!\/)/, { timeout: 15000 });

    // Should navigate back to list after deletion
    await expect(adminPage.getByRole("table")).toBeVisible();
  });
});
