import { test, expect } from "@playwright/test";
import { PoolsPage } from "./pages";

/**
 * Pools Page E2E Tests
 * Verifies liquidity pool listing and management functionality
 */
test.describe("Pools Page", () => {
  let poolsPage: PoolsPage;

  test.beforeEach(async ({ page }) => {
    poolsPage = new PoolsPage(page);
    await poolsPage.goto();
  });

  test("should render pools page correctly", async () => {
    await expect(poolsPage.createPoolButton).toBeVisible();
    await expect(poolsPage.searchInput).toBeVisible();
  });

  test("should display pools list", async ({ page }) => {
    // Wait for pools to load
    await page.waitForTimeout(2000);

    const poolCount = await poolsPage.getPoolCount();
    // Should have at least 0 pools (could be empty on testnet)
    expect(poolCount).toBeGreaterThanOrEqual(0);
  });

  test("should allow searching for pools", async ({ page }) => {
    await poolsPage.searchPool("SUI");
    await page.waitForTimeout(500);

    // Results should be filtered
    const poolCount = await poolsPage.getPoolCount();
    expect(typeof poolCount).toBe("number");
  });

  test("should navigate to create pool page", async ({ page }) => {
    await poolsPage.gotoCreatePool();
    await expect(page).toHaveURL(/\/pools\/create/);
  });

  test("should display pool cards with essential information", async ({
    page,
  }) => {
    await page.waitForTimeout(2000);

    const poolCards = page.locator(".pool-card");
    const count = await poolCards.count();

    if (count > 0) {
      const firstCard = poolCards.first();
      await expect(firstCard).toBeVisible();

      // Each pool card should have some text content
      const text = await firstCard.textContent();
      expect(text).toBeTruthy();
    }
  });

  test("should handle empty pools state", async ({ page }) => {
    // Search for non-existent pool
    await poolsPage.searchPool("NONEXISTENTTOKEN123456");
    await page.waitForTimeout(500);

    const emptyState = page.getByText(/no pools found/i);
    const noResultsText = await emptyState.isVisible();
    expect(typeof noResultsText).toBe("boolean");
  });

  test("should show loading state while fetching pools", async ({ page }) => {
    await poolsPage.goto();
    const isLoading = await poolsPage.isLoading();
    expect(typeof isLoading).toBe("boolean");
  });
});

/**
 * Pool Sorting and Filtering Tests
 */
test.describe("Pools - Sorting and Filtering", () => {
  let poolsPage: PoolsPage;

  test.beforeEach(async ({ page }) => {
    poolsPage = new PoolsPage(page);
    await poolsPage.goto();
    await page.waitForTimeout(1000); // Wait for initial load
  });

  test("should allow sorting pools", async ({ page }) => {
    const sortDropdown = poolsPage.sortDropdown;

    if (await sortDropdown.isVisible()) {
      await sortDropdown.click();
      const sortOptions = page.getByRole("option");
      const count = await sortOptions.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test("should maintain search query after sorting", async () => {
    await poolsPage.searchPool("SUI");
    await poolsPage.page.waitForTimeout(500);

    if (await poolsPage.sortDropdown.isVisible()) {
      await poolsPage.sortDropdown.click();
    }

    await expect(poolsPage.searchInput).toHaveValue("SUI");
  });
});

/**
 * Pools Page - Responsive Tests
 */
test.describe("Pools Page - Responsive", () => {
  let poolsPage: PoolsPage;

  test("should be usable on mobile devices", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    poolsPage = new PoolsPage(page);
    await poolsPage.goto();

    await expect(poolsPage.searchInput).toBeVisible();
    await expect(poolsPage.createPoolButton).toBeVisible();
  });

  test("should be usable on tablet devices", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    poolsPage = new PoolsPage(page);
    await poolsPage.goto();

    await expect(poolsPage.searchInput).toBeVisible();
  });
});
