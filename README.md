# sc-kpi-web-tests

Standalone Playwright E2E test framework for the [sc-kpi-web](https://github.com/sc-kpi/sc-kpi-web) frontend application.

## Prerequisites

- **Node.js** 22+
- **pnpm** 10+
- **sc-kpi-web** running on `localhost:3000` (for local test execution)

## Quick Start

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm exec playwright install chromium

# Run smoke tests (default suite)
pnpm test
```

## Configuration

The framework uses YAML-based configuration profiles, mirroring the API test framework pattern.

### Profiles

| Profile | File | Description |
|---------|------|-------------|
| default | `src/config/application.yml` | Local development (localhost) |
| ci | `src/config/application-ci.yml` | CI environment |
| staging | `src/config/application-staging.yml` | Staging environment |

### Switching Profiles

```bash
# Use CI profile
TEST_ENV=ci pnpm test

# Use staging profile
TEST_ENV=staging pnpm test:regression
```

### Environment Variable Overrides

| Variable | Description | Default |
|----------|-------------|---------|
| `TEST_ENV` | Configuration profile | _(default)_ |
| `BASE_URL` | Application base URL | `http://localhost:3000` |
| `API_BASE_URL` | API base URL | `http://localhost:8080` |
| `AUTH_ENABLED` | Enable authentication | `false` |
| `WORKERS` | Parallel workers | `1` |
| `HEADLESS` | Run headless | `true` |
| `RETRIES` | Retry failed tests | `0` |
| `LOCALE` | Browser locale | `uk` |

## Running Tests

```bash
# Smoke tests (default)
pnpm test

# Smoke + regression
pnpm test:regression

# All tests (including skipped framework tests)
pnpm test:all

# Framework/config validation tests
pnpm test:framework

# Run specific test file
pnpm exec playwright test tests/smoke/home.spec.ts

# Run by tag
pnpm exec playwright test --grep @security

# Run in headed mode
HEADLESS=false pnpm exec playwright test --headed

# Run specific project
pnpm exec playwright test --project=chromium
pnpm exec playwright test --project=mobile-chrome
```

## Reports

### Playwright HTML Report

```bash
pnpm report
```

### Allure Report

```bash
# Generate report
pnpm report:allure:generate

# Generate and open in browser
pnpm report:allure:serve
```

## Project Structure

```
src/
├── config/          # YAML configuration system (profiles, env overrides)
├── auth/            # Authentication setup (storageState management, handles 2FA when enabled)
├── pages/           # Page Object Models
│   ├── base.page.ts             # BasePage with common navigation helpers
│   ├── home.page.ts             # Home page
│   ├── login.page.ts            # Login page
│   ├── register.page.ts         # Registration page
│   ├── forgot-password.page.ts  # Forgot password page
│   ├── reset-password.page.ts   # Reset password page
│   ├── security-settings.page.ts # 2FA/security settings page
│   ├── verify-2fa.page.ts       # TOTP verification page
│   ├── notification-center.page.ts      # Notification center
│   ├── notification-preferences.page.ts # Notification preferences
│   ├── notification-bell.component.ts   # Notification bell component
│   ├── navigation.component.ts          # Navigation component
│   └── admin/                   # Admin page objects
│       ├── users-list.page.ts
│       ├── user-create.page.ts
│       ├── user-detail.page.ts
│       ├── feature-flags-list.page.ts
│       ├── feature-flag-create.page.ts
│       ├── feature-flag-detail.page.ts
│       ├── rate-limits-list.page.ts
│       ├── rate-limit-create.page.ts
│       ├── rate-limit-detail.page.ts
│       ├── audit-logs.page.ts
│       └── admin-notifications.page.ts
├── data/            # Test data factories (@faker-js/faker)
├── fixtures/        # Custom Playwright fixtures (POMs + auth contexts)
└── helpers/         # Utility helpers
    ├── allure.helper.ts         # Allure reporting integration
    ├── assertion.helper.ts      # Custom assertion helpers
    ├── auth-api.helper.ts       # Auth API helper
    ├── feature-flag.helper.ts   # Feature flag API helper
    ├── mailpit.helper.ts        # Mailpit mail server integration
    ├── notification.helper.ts   # Notification API helper
    ├── rate-limit.helper.ts     # Rate limit API helper
    ├── totp.helper.ts           # TOTP 2FA helper
    ├── user.helper.ts           # User management helper
    └── wait.helper.ts           # Wait/polling utilities
tests/
├── smoke/           # @smoke — critical path tests
├── auth/            # @regression — authentication flow tests (login, register, OAuth, TOTP, password reset)
├── admin/           # @regression — admin panel tests (users, feature flags, rate limits, audit, notifications)
├── notifications/   # @regression — notification center and preferences tests
└── framework/       # @framework — config validation tests
```

## Writing New Tests

1. Create a spec file in the appropriate `tests/` subdirectory
2. Import from custom fixtures: `import { test, expect } from "../../src/fixtures/index.js"`
3. Tag tests using `test.describe("...", { tag: [Tag.SMOKE] }, () => { ... })`
4. Use Page Object Models from fixtures: `async ({ homePage, loginPage }) => { ... }`
5. Use `test.skip` for tests targeting pages not yet built

### Example

```typescript
import { expect, test } from "../../src/fixtures/index.js";
import { Tag } from "../../src/config/test-tag.js";

test.describe("Feature", { tag: [Tag.REGRESSION] }, () => {
  test("should do something", async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.title).toBeVisible();
  });
});
```

## Auth Tiers

The framework supports two authentication tiers (mirroring the API test framework):

- **BASIC** — standard user with basic permissions
- **ADMIN** — administrator with full permissions

Auth is disabled by default. Enable via `AUTH_ENABLED=true` or in a profile YAML. When disabled, empty storageState files are created so test projects don't break.

## CI

The GitHub Actions workflow (`.github/workflows/regression.yml`) supports manual dispatch (`workflow_dispatch`) with suite and environment selection.

## Code Quality

```bash
# Biome lint + format check
pnpm check

# TypeScript type check
pnpm typecheck

# Auto-fix lint/format
pnpm lint:fix
pnpm format
```
