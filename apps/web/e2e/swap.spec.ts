import { test, expect } from '@playwright/test';

test.describe('Swap Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3501/swap');
  });

  test('should display swap interface', async ({ page }) => {
    // Check that swap heading is visible
    await expect(page.getByRole('heading', { name: 'Swap', exact: true })).toBeVisible();

    // Check token selectors are visible
    await expect(page.getByRole('button', { name: /SUI/ }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /USDC/ }).first()).toBeVisible();
  });

  test('should open settings dialog when clicking settings button', async ({ page }) => {
    // Click settings button using aria-label
    await page.getByRole('button', { name: 'Swap settings' }).click();

    // Check settings dialog appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Swap Settings' })).toBeVisible();

    // Check settings options are visible
    await expect(page.getByText('Slippage Tolerance', { exact: true })).toBeVisible();
    await expect(page.getByText('RPC Endpoint', { exact: true })).toBeVisible();
    await expect(page.getByText('Block Explorer', { exact: true })).toBeVisible();
    await expect(page.getByText('Gas Budget (Optional)', { exact: true })).toBeVisible();
    await expect(page.getByText('Using a Ledger', { exact: true })).toBeVisible();
  });

  test('should open token selector when clicking token button', async ({ page }) => {
    // Click on SUI token button
    const suiButton = page.getByRole('button', { name: /SUI/ }).first();
    await suiButton.click();

    // Check token selector dialog appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Select a token' })).toBeVisible();

    // Check search is visible
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    // Check some tokens are listed
    await expect(page.getByText('USD Coin')).toBeVisible();
  });

  test('should allow searching tokens in selector', async ({ page }) => {
    // Open token selector
    await page.getByRole('button', { name: /SUI/ }).first().click();

    // Search for USDC
    await page.getByPlaceholder(/search/i).fill('USDC');

    // Should show USDC
    await expect(page.getByText('USD Coin')).toBeVisible();

    // Should not show SUI
    await expect(page.getByText('Sui', { exact: true })).not.toBeVisible();
  });

  test('should show Connect Wallet button when not connected', async ({ page }) => {
    // Look for Connect Wallet button in the swap interface, not the header
    const swapButton = page.locator('button:has-text("Connect Wallet")').last();
    await expect(swapButton).toBeVisible();
  });

  test('should calculate swap quote when amount entered', async ({ page }) => {
    // Enter amount
    await page.getByPlaceholder('0').first().fill('10');

    // Wait for quote to load
    await page.waitForTimeout(1000);

    // Check that output amount is calculated
    const outputInput = page.getByPlaceholder('0').nth(1);
    const outputValue = await outputInput.inputValue();

    // Should have a non-zero value
    expect(parseFloat(outputValue)).toBeGreaterThan(0);
  });

  test('should toggle swap details', async ({ page }) => {
    // Enter amount to enable details
    await page.getByPlaceholder('0').first().fill('10');

    // Wait for quote
    await page.waitForTimeout(1000);

    // Details should be visible inline
    const detailsSection = page.getByText(/1 SUI =/);
    await expect(detailsSection).toBeVisible();

    // Click to expand details
    await detailsSection.click();

    // Should show expanded details
    await expect(page.getByText('Price impact')).toBeVisible();
    await expect(page.getByText('Fee', { exact: true }).first()).toBeVisible();
  });
});
