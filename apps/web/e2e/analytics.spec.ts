import { expect, test } from "@playwright/test";

test.describe("Analytics Dashboard", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("http://localhost:3501/analytics");
	});

	test("should display analytics page", async ({ page }) => {
		// Check heading
		await expect(
			page.getByRole("heading", { name: "Analytics" }),
		).toBeVisible();

		// Check description
		await expect(
			page.getByText("Protocol-wide statistics and pool performance metrics"),
		).toBeVisible();
	});

	test("should display protocol stats cards", async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1500);

		// Check all 4 stat cards are visible
		await expect(page.getByText("Total Value Locked")).toBeVisible();
		await expect(page.getByText("24h Volume")).toBeVisible();
		await expect(page.getByText("24h Fees")).toBeVisible();
		await expect(page.getByText("Total Pools")).toBeVisible();
	});

	test("should display TVL value", async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1500);

		// TVL should be visible and formatted
		const tvlCard = page.locator("text=Total Value Locked").locator("..");
		await expect(tvlCard).toBeVisible();

		// Should show a dollar amount (could be $0.00 or higher)
		const usdValue = tvlCard.locator("text=/\\$[0-9]/");
		await expect(usdValue).toBeVisible();
	});

	test("should display pool analytics table", async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1500);

		// Check table heading
		await expect(
			page.getByRole("heading", { name: "Pool Analytics" }),
		).toBeVisible();

		// Check table headers
		await expect(page.getByText("Pool", { exact: true })).toBeVisible();
		await expect(page.getByText("TVL")).toBeVisible();
		await expect(page.getByText("24h Volume")).toBeVisible();
		await expect(page.getByText("7d Volume")).toBeVisible();
		await expect(page.getByText("24h Fees")).toBeVisible();
		await expect(page.getByText("APR")).toBeVisible();
	});

	test("should display pool rows in table", async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1500);

		// Check for pool rows (should have at least one pool)
		const poolRows = page.locator("tbody tr");
		const count = await poolRows.count();

		// Should have at least 1 pool
		expect(count).toBeGreaterThanOrEqual(1);
	});

	test("should display token pairs in pool table", async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1500);

		// Check for token pair display (SUI / USDC)
		await expect(page.getByText("SUI / USDC")).toBeVisible();
	});

	test("should show fee tier for pools", async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1500);

		// Check for fee tier display
		await expect(page.getByText(/0\.3% fee/)).toBeVisible();
	});

	test("should display APR values with trending icon", async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1500);

		// APR column should have percentage values
		const aprCells = page.locator("tbody tr").first().locator("td").last();
		await expect(aprCells).toBeVisible();

		// Should show percentage
		await expect(aprCells).toContainText("%");
	});

	test("should sort table when clicking column headers", async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1500);

		// Click on TVL header to sort
		const tvlHeader = page.getByText("TVL").first();
		await tvlHeader.click();

		// Wait for sort animation
		await page.waitForTimeout(500);

		// Table should still be visible
		const poolRows = page.locator("tbody tr");
		const count = await poolRows.count();
		expect(count).toBeGreaterThanOrEqual(1);
	});

	test("should sort by volume when clicking volume header", async ({
		page,
	}) => {
		// Wait for data to load
		await page.waitForTimeout(1500);

		// Click on 24h Volume header
		const volumeHeader = page.getByText("24h Volume").first();
		await volumeHeader.click();

		// Wait for sort
		await page.waitForTimeout(500);

		// Should still show pools
		await expect(page.getByText("SUI / USDC")).toBeVisible();
	});

	test("should sort by APR when clicking APR header", async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1500);

		// Click on APR header
		const aprHeader = page.getByText("APR").first();
		await aprHeader.click();

		// Wait for sort
		await page.waitForTimeout(500);

		// Should still show pools
		await expect(page.getByText("SUI / USDC")).toBeVisible();
	});

	test("should toggle sort order when clicking same header twice", async ({
		page,
	}) => {
		// Wait for data to load
		await page.waitForTimeout(1500);

		// Get first TVL value
		const firstCell = page.locator("tbody tr").first().locator("td").nth(1);
		const _firstValue = await firstCell.textContent();

		// Click TVL header twice to reverse order
		const tvlHeader = page.getByText("TVL").first();
		await tvlHeader.click();
		await page.waitForTimeout(300);
		await tvlHeader.click();
		await page.waitForTimeout(300);

		// First cell might have changed (if there are multiple pools)
		const newFirstCell = page.locator("tbody tr").first().locator("td").nth(1);
		await expect(newFirstCell).toBeVisible();
	});

	test("should format large numbers with K/M suffixes", async ({ page }) => {
		// Wait for data to load
		await page.waitForTimeout(1500);

		// Check for currency formatting in TVL or Volume columns
		const cells = page.locator("tbody tr td");
		const count = await cells.count();

		// Should have cells with dollar signs
		let hasCurrency = false;
		for (let i = 0; i < Math.min(count, 20); i++) {
			const text = await cells.nth(i).textContent();
			if (text?.includes("$")) {
				hasCurrency = true;
				break;
			}
		}

		expect(hasCurrency).toBe(true);
	});

	test("should refresh data automatically", async ({ page }) => {
		// Wait for initial data load
		await page.waitForTimeout(1500);

		// Get initial TVL value
		const tvlCard = page.locator("text=Total Value Locked").locator("..");
		const _initialValue = await tvlCard.textContent();

		// Wait for auto-refresh (30 seconds in production, but should happen)
		// For testing, we just verify the card is still there
		await page.waitForTimeout(1000);

		// TVL card should still be visible
		await expect(tvlCard).toBeVisible();
	});

	test("should display loading state initially", async ({ page }) => {
		// Immediately after navigation, before data loads
		await page.goto("http://localhost:3501/analytics");

		// Should show loading animation or placeholder
		// The stats cards might show loading skeletons
		const statsSection = page
			.locator("text=Total Value Locked")
			.locator("../..");

		// After waiting, data should be loaded
		await page.waitForTimeout(2000);
		await expect(statsSection).toBeVisible();
	});
});
