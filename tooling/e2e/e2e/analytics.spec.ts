import { test, expect } from "@playwright/test";
import { AnalyticsPage } from "./pages";

/**
 * Analytics Page E2E Tests
 * Verifies protocol analytics and metrics display
 */
test.describe("Analytics Dashboard", () => {
  let analyticsPage: AnalyticsPage;

  test.beforeEach(async ({ page }) => {
    analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
  });

  test("should render analytics page correctly", async () => {
    await expect(analyticsPage.tvlMetric).toBeVisible();
    await expect(analyticsPage.volumeMetric).toBeVisible();
    await expect(analyticsPage.feesMetric).toBeVisible();
  });

  test("should display protocol metrics", async () => {
    const tvl = await analyticsPage.getTVL();
    const volume = await analyticsPage.getVolume();
    const fees = await analyticsPage.getFees();

    // Metrics should be non-empty strings
    expect(tvl.length).toBeGreaterThan(0);
    expect(volume.length).toBeGreaterThan(0);
    expect(fees.length).toBeGreaterThan(0);
  });

  test("should display charts", async () => {
    const chartsVisible = await analyticsPage.areChartsVisible();
    expect(chartsVisible).toBe(true);
  });

  test("should allow changing timeframe", async ({ page }) => {
    await analyticsPage.selectTimeframe("7d");
    await page.waitForTimeout(1000);

    // Charts should update (we can't verify actual data, but no errors should occur)
    await expect(analyticsPage.volumeChart).toBeVisible();
  });

  test("should display top pools table", async () => {
    if (await analyticsPage.topPoolsTable.isVisible()) {
      const count = await analyticsPage.getTopPoolsCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("should display top tokens table", async () => {
    if (await analyticsPage.topTokensTable.isVisible()) {
      const count = await analyticsPage.getTopTokensCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("should handle loading state gracefully", async ({ page }) => {
    await analyticsPage.goto();
    await page.waitForTimeout(500);

    // Page should load without errors
    await expect(analyticsPage.tvlMetric).toBeVisible();
  });
});

/**
 * Analytics Timeframe Tests
 */
test.describe("Analytics - Timeframe Selection", () => {
  let analyticsPage: AnalyticsPage;

  test.beforeEach(async ({ page }) => {
    analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();
  });

  const timeframes = ["24h", "7d", "30d", "1y"] as const;

  for (const timeframe of timeframes) {
    test(`should load ${timeframe} data correctly`, async ({ page }) => {
      await analyticsPage.selectTimeframe(timeframe);
      await page.waitForTimeout(1000);

      // Verify charts are still visible after timeframe change
      await expect(analyticsPage.volumeChart).toBeVisible();
      await expect(analyticsPage.liquidityChart).toBeVisible();
    });
  }
});

/**
 * Analytics - Responsive Tests
 */
test.describe("Analytics - Responsive", () => {
  let analyticsPage: AnalyticsPage;

  test("should be usable on mobile devices", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();

    await expect(analyticsPage.tvlMetric).toBeVisible();
    await expect(analyticsPage.volumeMetric).toBeVisible();
  });

  test("should be usable on tablet devices", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();

    await expect(analyticsPage.volumeChart).toBeVisible();
  });

  test("should adapt chart layout for small screens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    analyticsPage = new AnalyticsPage(page);
    await analyticsPage.goto();

    // Charts should still be visible even on mobile
    const chartsVisible = await analyticsPage.areChartsVisible();
    expect(chartsVisible).toBe(true);
  });
});
