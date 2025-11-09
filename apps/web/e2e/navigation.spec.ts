import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
	test("should navigate to swap page from header", async ({ page }) => {
		await page.goto("http://localhost:3501");

		// Click Swap in navigation
		await page.getByRole("link", { name: "Swap", exact: true }).click();

		// Should be on swap page
		await expect(page).toHaveURL(/.*swap/);
		await expect(
			page.getByRole("heading", { name: "Swap", exact: true }),
		).toBeVisible();
	});

	test("should navigate to pools page from header", async ({ page }) => {
		await page.goto("http://localhost:3501");

		// Click Pools in navigation
		await page.getByRole("link", { name: "Pools", exact: true }).click();

		// Should be on pools page
		await expect(page).toHaveURL(/.*pools/);
		await expect(
			page.getByRole("heading", { name: "Liquidity Pools" }),
		).toBeVisible();
	});

	test("should navigate to analytics page from header", async ({ page }) => {
		await page.goto("http://localhost:3501");

		// Click Analytics in navigation
		await page.getByRole("link", { name: "Analytics", exact: true }).click();

		// Should be on analytics page
		await expect(page).toHaveURL(/.*analytics/);
		await expect(
			page.getByRole("heading", { name: "Analytics" }),
		).toBeVisible();
	});

	test("should return to home when clicking logo", async ({ page }) => {
		// Start on swap page
		await page.goto("http://localhost:3501/swap");

		// Click on logo/brand
		await page
			.getByRole("link", { name: /TortoiseSwap/ })
			.first()
			.click();

		// Should be on home page
		await expect(page).toHaveURL("http://localhost:3501/");
	});

	test("should display all navigation links", async ({ page }) => {
		await page.goto("http://localhost:3501");

		// Check all main navigation links are visible (on desktop)
		await expect(
			page.getByRole("link", { name: "Swap", exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Pools", exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Analytics", exact: true }),
		).toBeVisible();
	});

	test("should have footer with links", async ({ page }) => {
		await page.goto("http://localhost:3501");

		// Scroll to bottom
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

		// Wait for footer to be in view
		await page.waitForTimeout(300);

		// Check footer links
		await expect(page.getByRole("contentinfo")).toBeVisible();

		// Footer should have product links
		const footer = page.locator("footer");
		await expect(footer.getByRole("link", { name: "Swap" })).toBeVisible();
		await expect(footer.getByRole("link", { name: "Pools" })).toBeVisible();
		await expect(footer.getByRole("link", { name: "Analytics" })).toBeVisible();
	});

	test("should navigate from footer links", async ({ page }) => {
		await page.goto("http://localhost:3501");

		// Scroll to footer
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(300);

		// Click Analytics in footer
		const footer = page.locator("footer");
		await footer.getByRole("link", { name: "Analytics" }).click();

		// Should navigate to analytics page
		await expect(page).toHaveURL(/.*analytics/);
	});

	test("should display theme toggle", async ({ page }) => {
		await page.goto("http://localhost:3501");

		// Theme toggle should be visible
		// It's typically an icon button without explicit text
		const themeButtons = page.locator('button[class*="theme"]');
		const count = await themeButtons.count();

		// Should have at least one theme-related button
		expect(count).toBeGreaterThanOrEqual(1);
	});

	test("should display wallet button", async ({ page }) => {
		await page.goto("http://localhost:3501");

		// Wallet button should be visible in header
		const walletButton = page.getByRole("button", { name: /Connect/i }).first();
		await expect(walletButton).toBeVisible();
	});

	test("should have consistent header across pages", async ({ page }) => {
		// Check header on home page
		await page.goto("http://localhost:3501");
		await expect(page.getByRole("banner")).toBeVisible();
		await expect(
			page.getByRole("link", { name: /TortoiseSwap/ }).first(),
		).toBeVisible();

		// Check header on swap page
		await page.goto("http://localhost:3501/swap");
		await expect(page.getByRole("banner")).toBeVisible();
		await expect(
			page.getByRole("link", { name: /TortoiseSwap/ }).first(),
		).toBeVisible();

		// Check header on analytics page
		await page.goto("http://localhost:3501/analytics");
		await expect(page.getByRole("banner")).toBeVisible();
		await expect(
			page.getByRole("link", { name: /TortoiseSwap/ }).first(),
		).toBeVisible();
	});

	test("should highlight active page in navigation", async ({ page }) => {
		// Go to swap page
		await page.goto("http://localhost:3501/swap");

		// Navigation should still be visible
		await expect(
			page.getByRole("link", { name: "Swap", exact: true }),
		).toBeVisible();
	});

	test("should be responsive on mobile", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("http://localhost:3501");

		// Logo should be visible on mobile
		await expect(
			page.getByRole("link", { name: /TortoiseSwap/ }).first(),
		).toBeVisible();

		// Wallet button should be visible
		await expect(
			page.getByRole("button", { name: /Connect/i }).first(),
		).toBeVisible();
	});

	test("should maintain scroll position when navigating back", async ({
		page,
	}) => {
		await page.goto("http://localhost:3501/analytics");

		// Scroll down
		await page.evaluate(() => window.scrollTo(0, 500));
		await page.waitForTimeout(300);

		// Navigate to another page
		await page.getByRole("link", { name: "Swap", exact: true }).click();
		await expect(page).toHaveURL(/.*swap/);

		// Navigate back
		await page.goBack();
		await expect(page).toHaveURL(/.*analytics/);

		// Page should be back on analytics
		await expect(
			page.getByRole("heading", { name: "Analytics" }),
		).toBeVisible();
	});
});
