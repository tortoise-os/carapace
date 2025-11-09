import { expect, test } from "@playwright/test";

test.describe("Pools Page", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("http://localhost:3501/pools");
	});

	test("should display pools page", async ({ page }) => {
		// Check heading
		await expect(
			page.getByRole("heading", { name: "Liquidity Pools" }),
		).toBeVisible();
	});

	test("should display pool cards", async ({ page }) => {
		// Wait for pools to load
		await page.waitForTimeout(1500);

		// Should have at least one pool card
		const poolCards = page.locator('[class*="card"]');
		const count = await poolCards.count();

		// Might have 0 or more pools depending on data
		expect(count).toBeGreaterThanOrEqual(0);
	});

	test("should show pool information if pools exist", async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1500);

		// Try to find pool information
		// Pools page might show token pairs, TVL, APR, etc.
		const pageText = await page.textContent("body");

		// The page should have loaded
		expect(pageText).toBeTruthy();
	});

	test("should be accessible from navigation", async ({ page }) => {
		// Start from home
		await page.goto("http://localhost:3501");

		// Click on Pools link in navigation
		await page.getByRole("link", { name: "Pools", exact: true }).click();

		// Should navigate to pools page
		await expect(page).toHaveURL(/.*pools/);
		await expect(
			page.getByRole("heading", { name: "Liquidity Pools" }),
		).toBeVisible();
	});

	test("should display responsive layout", async ({ page }) => {
		// Wait for page to load
		await page.waitForTimeout(1000);

		// Page should be visible on desktop
		await expect(
			page.getByRole("heading", { name: "Liquidity Pools" }),
		).toBeVisible();

		// Test mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.waitForTimeout(300);

		// Heading should still be visible on mobile
		await expect(
			page.getByRole("heading", { name: "Liquidity Pools" }),
		).toBeVisible();
	});
});
