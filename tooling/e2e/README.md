# Carapace E2E Testing Suite

End-to-end testing suite for the Carapace DEX using Playwright.

## Overview

This package contains comprehensive E2E tests for the Carapace web application, covering:

- **Navigation**: Page routing, menu interactions, deep linking
- **Swap Interface**: Token swaps, slippage settings, input validation
- **Pools Management**: Pool listing, search, filtering, creation
- **Analytics Dashboard**: Metrics display, charts, timeframe selection
- **Error Handling**: Build errors, runtime errors, transaction errors, validation errors
- **Responsive Design**: Mobile and tablet viewport testing

## Structure

```
tooling/e2e/
├── e2e/                    # Test files
│   ├── pages/             # Page Object Models
│   │   ├── BasePage.ts
│   │   ├── SwapPage.ts
│   │   ├── PoolsPage.ts
│   │   └── AnalyticsPage.ts
│   ├── fixtures/          # Test fixtures and helpers
│   ├── navigation.spec.ts
│   ├── swap.spec.ts
│   ├── pools.spec.ts
│   ├── analytics.spec.ts
│   └── error-handling.spec.ts
├── playwright.config.ts   # Playwright configuration
├── package.json
└── README.md             # This file
```

## Prerequisites

- Bun >= 1.1.0
- Web app running on http://localhost:3601
- Playwright browsers installed

## Installation

```bash
cd tooling/e2e
bun install
```

Install Playwright browsers:

```bash
bunx playwright install
```

## Running Tests

### Run all tests

```bash
bun run test
```

or via Task:

```bash
task test:e2e
```

### Run tests in UI mode

```bash
bun run test:ui
```

### Run tests in headed mode (see browser)

```bash
bun run test:headed
```

### Run tests in debug mode

```bash
bun run test:debug
```

### Run specific browser

```bash
bun run test:chromium    # Chrome only
bun run test:firefox     # Firefox only
bun run test:webkit      # Safari only
```

### Run specific test file

```bash
bunx playwright test navigation.spec.ts
```

### Run specific test

```bash
bunx playwright test navigation.spec.ts -g "should load homepage"
```

## View Test Results

After tests complete, view the HTML report:

```bash
bun run report
```

## Writing Tests

### Using Page Object Models

```typescript
import { test, expect } from "@playwright/test";
import { SwapPage } from "./pages";

test("example test", async ({ page }) => {
  const swapPage = new SwapPage(page);
  await swapPage.goto();
  await swapPage.enterAmount("100");
  await expect(swapPage.swapButton).toBeEnabled();
});
```

### Adding New Page Objects

1. Create new file in `e2e/pages/`
2. Extend `BasePage` class
3. Define locators and methods
4. Export from `e2e/pages/index.ts`

Example:

```typescript
import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class MyPage extends BasePage {
  readonly myElement: Locator;

  constructor(page: Page) {
    super(page);
    this.myElement = page.getByTestId("my-element");
  }

  async goto() {
    await super.goto("/my-path");
    await this.waitForLoad();
  }

  async doSomething() {
    await this.myElement.click();
  }
}
```

## Configuration

Tests are configured in `playwright.config.ts`:

- **Base URL**: http://localhost:3601
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 13
- **Timeout**: 30s per test
- **Retries**: 2 in CI, 0 locally
- **Screenshots**: On failure
- **Video**: On failure
- **Trace**: On first retry

## CI/CD Integration

Tests automatically run in GitHub Actions when configured. The test server starts automatically via `webServer` config.

### Environment Variables

- `CI=true` - Enables CI mode (retries, single worker)
- `PWDEBUG=1` - Enables debug mode

## Best Practices

1. **Use Page Object Models** - Keep selectors and actions in page objects
2. **Wait for Elements** - Use `waitFor*` methods, avoid fixed timeouts
3. **Isolate Tests** - Each test should be independent
4. **Use Data Attributes** - Prefer `data-testid` over CSS selectors
5. **Test User Flows** - Focus on actual user scenarios
6. **Keep Tests Fast** - Mock external APIs when possible
7. **Handle Loading States** - Wait for content to load
8. **Test Responsiveness** - Include mobile/tablet viewport tests

## Debugging

### Debug specific test

```bash
bunx playwright test --debug navigation.spec.ts
```

### Generate test code

```bash
bun run codegen
```

This opens the browser and records your actions as test code.

### View trace

```bash
bunx playwright show-trace trace.zip
```

## Common Issues

### Port already in use

Make sure the web app is not running separately. The test suite starts its own server on port 3601.

### Browser not installed

Run:

```bash
bunx playwright install chromium
```

### Tests timing out

- Increase timeout in `playwright.config.ts`
- Check if web app is building correctly
- Verify network connectivity

## Test Suites

### Navigation Tests (`navigation.spec.ts`)
Tests page routing, navigation menu, deep linking, and theme toggle.

### Swap Tests (`swap.spec.ts`)
Tests token swaps, slippage settings, price impact warnings, and input validation.

### Pools Tests (`pools.spec.ts`)
Tests pool listing, filtering, search, sorting, and pool creation flows.

### Analytics Tests (`analytics.spec.ts`)
Tests dashboard metrics, charts, timeframe selection, and data display.

### Error Handling Tests (`error-handling.spec.ts`)
Tests error detection and handling across the application:

#### Build Error Display
- Detects Next.js error overlay when compilation errors occur
- Verifies incremental error count display (e.g., "1 of 903 errors")
- Checks for TypeScript/build errors with file paths and line numbers
- Tests error overlay dismissal

#### Runtime Error Handling
- Catches and displays runtime errors gracefully
- Tests error boundary components
- Handles network errors when offline

#### Transaction Error Handling
- Displays transaction errors with clear messaging
- Shows validation errors for invalid inputs
- Handles insufficient balance errors

#### Error Recovery
- Tests retry functionality for failed operations
- Verifies errors clear after successful operations
- Ensures app state is maintained after error recovery

The error handling tests are designed to verify that:
1. Build/compilation errors are displayed to developers with proper context
2. Runtime errors don't crash the application
3. User-facing errors are clear and actionable
4. Error states can be recovered from gracefully

## Contributing

When adding new tests:

1. Follow existing test structure
2. Use Page Object Models
3. Add descriptive test names
4. Include mobile/tablet tests
5. Update this README

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

---

**Last Updated:** 2025-11-12
**Maintainer:** Carapace Team
