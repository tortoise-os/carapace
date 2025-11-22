import { test, expect } from "@playwright/test";
import { BasePage } from "./pages";

/**
 * Navigation E2E Tests
 * Verifies all main navigation flows and page accessibility
 */
test.describe("Navigation", () => {
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    await basePage.goto("/");
  });

  test("should load homepage successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/Carapace/i);
    await expect(basePage.navigationMenu).toBeVisible();
  });

  test("should navigate to all main pages", async ({ page }) => {
    const pages = [
      { name: "Swap", path: "/swap" },
      { name: "Pools", path: "/pools" },
      { name: "Analytics", path: "/analytics" },
      { name: "Portfolio", path: "/portfolio" },
    ];

    for (const { name, path } of pages) {
      await basePage.navigateTo(name);
      await expect(page).toHaveURL(new RegExp(path));
      await basePage.waitForLoad();
    }
  });

  test("should show connect wallet button when not connected", async () => {
    await expect(basePage.connectWalletButton).toBeVisible();
  });

  test("should have responsive navigation menu", async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(basePage.navigationMenu).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(basePage.navigationMenu).toBeVisible();
  });

  test("should maintain navigation state across page transitions", async ({
    page,
  }) => {
    await basePage.navigateTo("Swap");
    await expect(page).toHaveURL(/\/swap/);

    await basePage.navigateTo("Pools");
    await expect(page).toHaveURL(/\/pools/);

    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/swap/);

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/\/pools/);
  });

  test("should handle deep linking", async ({ page }) => {
    await basePage.goto("/swap");
    await expect(page).toHaveURL(/\/swap/);
    await basePage.waitForLoad();

    await basePage.goto("/pools/create");
    await expect(page).toHaveURL(/\/pools\/create/);
    await basePage.waitForLoad();
  });

  test("should display theme toggle", async ({ page }) => {
    const themeToggle = page.getByRole("button", { name: /theme/i });
    await expect(themeToggle).toBeVisible();
  });
});
