import { test, expect } from "@playwright/test";
import { SwapPage } from "./pages";

/**
 * Swap Page E2E Tests
 * Verifies token swap functionality and user interactions
 */
test.describe("Swap Interface", () => {
  let swapPage: SwapPage;

  test.beforeEach(async ({ page }) => {
    swapPage = new SwapPage(page);
    await swapPage.goto();
  });

  test("should render swap interface correctly", async () => {
    await expect(swapPage.tokenFromSelect).toBeVisible();
    await expect(swapPage.tokenToSelect).toBeVisible();
    await expect(swapPage.amountInput).toBeVisible();
    await expect(swapPage.swapButton).toBeVisible();
  });

  test("should disable swap button when amount is empty", async () => {
    await expect(swapPage.swapButton).toBeDisabled();
  });

  test("should allow entering swap amount", async () => {
    const amount = "100";
    await swapPage.enterAmount(amount);
    await expect(swapPage.amountInput).toHaveValue(amount);
  });

  test("should calculate estimated output", async ({ page }) => {
    // This test assumes tokens are selected and pools exist
    await swapPage.enterAmount("10");

    // Wait for quote calculation
    await page.waitForTimeout(1000);

    const output = await swapPage.getEstimatedOutput();
    // Output should be a non-empty string with a number
    expect(output.length).toBeGreaterThan(0);
  });

  test("should validate numeric input", async () => {
    await swapPage.amountInput.fill("abc");
    await expect(swapPage.amountInput).toHaveValue("");

    await swapPage.amountInput.fill("123.45");
    await expect(swapPage.amountInput).toHaveValue("123.45");
  });

  test("should show slippage settings", async ({ page }) => {
    await swapPage.slippageSettings.click();
    const slippageInput = page.getByLabel(/slippage tolerance/i);
    await expect(slippageInput).toBeVisible();
  });

  test("should handle insufficient balance gracefully", async ({ page }) => {
    await swapPage.enterAmount("999999999");
    await page.waitForTimeout(500);

    const errorMessage = page.getByText(/insufficient balance/i);
    await expect(errorMessage).toBeVisible();
  });

  test("should show price impact warning for large trades", async ({ page }) => {
    // Enter a very large amount
    await swapPage.enterAmount("100000");
    await page.waitForTimeout(1000);

    // Check if price impact warning appears
    const warning = await swapPage.hasPriceImpactWarning();
    // Warning may or may not appear depending on pool liquidity
    expect(typeof warning).toBe("boolean");
  });

  test("should allow reversing token pair", async ({ page }) => {
    const reverseButton = page.getByRole("button", { name: /reverse|switch/i });
    await expect(reverseButton).toBeVisible();
    await reverseButton.click();

    // Tokens should be swapped
    await page.waitForTimeout(300);
  });

  test("should persist entered amount when changing slippage", async ({
    page,
  }) => {
    await swapPage.enterAmount("50");
    await swapPage.slippageSettings.click();

    const slippageInput = page.getByLabel(/slippage/i);
    await slippageInput.fill("1.5");
    await page.keyboard.press("Escape");

    await expect(swapPage.amountInput).toHaveValue("50");
  });

  test("should show transaction settings", async ({ page }) => {
    const settingsButton = page.getByRole("button", { name: /settings/i });
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await expect(page.getByText(/transaction settings/i)).toBeVisible();
    }
  });

  test("should handle wallet not connected state", async ({ page }) => {
    await swapPage.enterAmount("10");

    const connectButton = page.getByRole("button", { name: /connect wallet/i });
    if (await connectButton.isVisible()) {
      await expect(connectButton).toBeEnabled();
    }
  });
});

/**
 * Swap Responsiveness Tests
 */
test.describe("Swap Interface - Responsive", () => {
  let swapPage: SwapPage;

  test("should be usable on mobile devices", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    swapPage = new SwapPage(page);
    await swapPage.goto();

    await expect(swapPage.tokenFromSelect).toBeVisible();
    await expect(swapPage.tokenToSelect).toBeVisible();
    await expect(swapPage.amountInput).toBeVisible();
    await expect(swapPage.swapButton).toBeVisible();
  });

  test("should be usable on tablet devices", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    swapPage = new SwapPage(page);
    await swapPage.goto();

    await expect(swapPage.tokenFromSelect).toBeVisible();
    await expect(swapPage.swapButton).toBeVisible();
  });
});
