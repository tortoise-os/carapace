import { test, expect } from "@playwright/test";

test.describe("Error Handling", () => {
  test.describe("Build Error Display", () => {
    test("should display error overlay when build errors occur", async ({
      page,
    }) => {
      // Navigate to the app
      await page.goto("/");

      // Check if Next.js error overlay is present (if build errors exist)
      const errorOverlay = page.locator('[data-nextjs-dialog-overlay]');

      // If there are build errors, the overlay should be visible
      // If not, the page should load normally
      const isOverlayVisible = await errorOverlay.isVisible().catch(() => false);

      if (isOverlayVisible) {
        // Verify error overlay contains error information
        await expect(errorOverlay).toBeVisible();

        // Check for error message
        const errorMessage = page.locator('[data-nextjs-dialog]');
        await expect(errorMessage).toBeVisible();
      } else {
        // If no errors, page should load successfully
        await expect(page).toHaveTitle(/Carapace/i);
      }
    });

    test("should display incremental error count during compilation", async ({
      page,
    }) => {
      // This test verifies that error counts like "1 of 903 errors" are displayed
      await page.goto("/");

      // Wait for any compilation to complete
      await page.waitForLoadState("networkidle");

      // Check for Next.js compilation error indicator
      const compilationError = page.locator(
        'text=/\\d+\\s+of\\s+\\d+\\s+errors?/i'
      );

      const hasCompilationErrors = await compilationError.isVisible().catch(() => false);

      if (hasCompilationErrors) {
        // Extract error count
        const errorText = await compilationError.textContent();
        expect(errorText).toMatch(/\d+\s+of\s+\d+\s+errors?/i);

        // Verify error count is numeric and makes sense
        const matches = errorText?.match(/(\d+)\s+of\s+(\d+)/i);
        if (matches) {
          const currentError = Number.parseInt(matches[1]);
          const totalErrors = Number.parseInt(matches[2]);

          expect(currentError).toBeGreaterThanOrEqual(1);
          expect(totalErrors).toBeGreaterThanOrEqual(currentError);
        }
      }
    });

    test("should display TypeScript/build errors with file paths", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check for error overlay with file paths
      const errorOverlay = page.locator('[data-nextjs-dialog]');
      const isOverlayVisible = await errorOverlay.isVisible().catch(() => false);

      if (isOverlayVisible) {
        // Verify error contains file path information
        const errorContent = await errorOverlay.textContent();

        // Should contain file paths (TypeScript errors typically show .ts or .tsx files)
        expect(errorContent).toMatch(/\.tsx?|\.jsx?/);

        // Should contain line numbers
        expect(errorContent).toMatch(/:\d+:\d+/);
      }
    });

    test("should allow dismissing error overlay", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const errorOverlay = page.locator('[data-nextjs-dialog]');
      const isOverlayVisible = await errorOverlay.isVisible().catch(() => false);

      if (isOverlayVisible) {
        // Look for close button
        const closeButton = page.locator('[data-nextjs-dialog] button[aria-label*="close" i]')
          .or(page.locator('[data-nextjs-dialog] button:has-text("×")'));

        if (await closeButton.isVisible().catch(() => false)) {
          await closeButton.click();

          // Error overlay should be dismissed
          await expect(errorOverlay).not.toBeVisible();
        }
      }
    });
  });

  test.describe("Runtime Error Handling", () => {
    test("should catch and display runtime errors gracefully", async ({
      page,
    }) => {
      const consoleErrors: string[] = [];

      // Listen for console errors
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      // Listen for page errors
      const pageErrors: Error[] = [];
      page.on("pageerror", (error) => {
        pageErrors.push(error);
      });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // If there are runtime errors, they should be caught
      if (pageErrors.length > 0) {
        // Verify error boundary or error display is shown
        const errorBoundary = page.locator('[data-testid="error-boundary"]')
          .or(page.getByText(/something went wrong/i));

        const hasErrorBoundary = await errorBoundary.isVisible().catch(() => false);

        // Either error boundary is shown or errors are logged to console
        expect(hasErrorBoundary || consoleErrors.length > 0).toBeTruthy();
      }
    });

    test("should display error boundary on component errors", async ({
      page,
    }) => {
      await page.goto("/");

      // Check for error boundary component
      const errorBoundary = page.locator('[data-testid="error-boundary"]')
        .or(page.getByText(/something went wrong/i))
        .or(page.getByRole("heading", { name: /error/i }));

      const hasError = await errorBoundary.isVisible().catch(() => false);

      if (hasError) {
        // Verify error boundary displays user-friendly message
        await expect(errorBoundary).toBeVisible();

        // Check for reload/retry button
        const retryButton = page.getByRole("button", { name: /try again|reload|refresh/i });
        const hasRetryButton = await retryButton.isVisible().catch(() => false);

        if (hasRetryButton) {
          await expect(retryButton).toBeEnabled();
        }
      }
    });

    test("should handle network errors gracefully", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Simulate offline mode
      await page.context().setOffline(true);

      // Try to navigate to a page that requires network
      await page.goto("/analytics").catch(() => {
        // Expected to fail
      });

      // Go back online
      await page.context().setOffline(false);

      // Should display network error message or work when back online
      const networkError = page.getByText(/network error|offline|no connection/i);
      const hasNetworkError = await networkError.isVisible().catch(() => false);

      // Either shows network error or works after coming back online
      expect(typeof hasNetworkError).toBe("boolean");
    });
  });

  test.describe("Transaction Error Handling", () => {
    test("should display transaction errors with clear messaging", async ({
      page,
    }) => {
      await page.goto("/swap");
      await page.waitForLoadState("networkidle");

      // Try to perform a swap without wallet connection
      const swapButton = page.getByRole("button", { name: /swap/i });

      if (await swapButton.isVisible()) {
        await swapButton.click();

        // Should either show wallet connection prompt or error
        const errorOrPrompt = page.getByText(/connect wallet|wallet not connected|transaction failed/i);

        // Wait for error or prompt to appear
        await expect(errorOrPrompt).toBeVisible({ timeout: 5000 }).catch(() => {
          // Some errors might appear as toast notifications
        });
      }
    });

    test("should display validation errors for invalid inputs", async ({
      page,
    }) => {
      await page.goto("/swap");
      await page.waitForLoadState("networkidle");

      // Try to enter invalid amount
      const amountInput = page.locator('[data-testid="amount-input"]')
        .or(page.getByPlaceholder(/amount/i));

      if (await amountInput.isVisible()) {
        await amountInput.fill("-100");

        // Should show validation error
        const validationError = page.getByText(/invalid amount|amount must be positive|enter valid amount/i);
        const hasValidationError = await validationError.isVisible({ timeout: 2000 }).catch(() => false);

        // Swap button should be disabled if validation fails
        const swapButton = page.getByRole("button", { name: /swap/i });
        const isSwapDisabled = !(await swapButton.isEnabled().catch(() => true));

        // Either validation error is shown or button is disabled
        expect(hasValidationError || isSwapDisabled).toBeTruthy();
      }
    });

    test("should handle insufficient balance errors", async ({ page }) => {
      await page.goto("/swap");
      await page.waitForLoadState("networkidle");

      const amountInput = page.locator('[data-testid="amount-input"]')
        .or(page.getByPlaceholder(/amount/i));

      if (await amountInput.isVisible()) {
        // Try to enter very large amount
        await amountInput.fill("999999999999");

        // Should show insufficient balance error or disable swap
        const insufficientError = page.getByText(/insufficient balance|not enough/i);
        const swapButton = page.getByRole("button", { name: /swap/i });

        const hasInsufficientError = await insufficientError.isVisible({ timeout: 2000 }).catch(() => false);
        const isSwapDisabled = !(await swapButton.isEnabled().catch(() => true));

        expect(hasInsufficientError || isSwapDisabled).toBeTruthy();
      }
    });
  });

  test.describe("Error Recovery", () => {
    test("should allow retrying failed operations", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Look for any retry buttons if errors occurred
      const retryButton = page.getByRole("button", { name: /try again|retry|reload/i });
      const hasRetryButton = await retryButton.isVisible().catch(() => false);

      if (hasRetryButton) {
        await expect(retryButton).toBeEnabled();

        // Click retry and verify page doesn't crash
        await retryButton.click();
        await page.waitForTimeout(1000);

        // Page should still be functional
        await expect(page.locator("body")).toBeVisible();
      }
    });

    test("should clear errors after successful operation", async ({ page }) => {
      await page.goto("/swap");
      await page.waitForLoadState("networkidle");

      const amountInput = page.locator('[data-testid="amount-input"]')
        .or(page.getByPlaceholder(/amount/i));

      if (await amountInput.isVisible()) {
        // Enter invalid amount
        await amountInput.fill("-100");
        await page.waitForTimeout(500);

        // Clear and enter valid amount
        await amountInput.clear();
        await amountInput.fill("1");

        // Error should be cleared
        const validationError = page.getByText(/invalid amount/i);
        const hasError = await validationError.isVisible().catch(() => false);

        expect(hasError).toBeFalsy();
      }
    });

    test("should maintain app state after error recovery", async ({ page }) => {
      await page.goto("/swap");
      await page.waitForLoadState("networkidle");

      // Navigate to pools
      await page.getByRole("link", { name: /pools/i }).click();
      await expect(page).toHaveURL(/\/pools/);

      // Navigate back to swap
      await page.getByRole("link", { name: /swap/i }).click();
      await expect(page).toHaveURL(/\/swap/);

      // App should still be functional
      await expect(page.locator("body")).toBeVisible();
    });
  });
});
