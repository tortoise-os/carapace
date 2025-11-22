import { type Page, type Locator } from "@playwright/test";

/**
 * Base Page Object Model
 * Contains common elements and methods shared across all pages
 */
export class BasePage {
  readonly page: Page;
  readonly connectWalletButton: Locator;
  readonly navigationMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.connectWalletButton = page.getByRole("button", {
      name: /connect wallet/i,
    });
    this.navigationMenu = page.locator("nav");
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string = "/") {
    await this.page.goto(path);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Navigate using the main navigation menu
   */
  async navigateTo(pageName: string) {
    await this.page.getByRole("link", { name: new RegExp(pageName, "i") }).click();
  }

  /**
   * Check if wallet is connected
   */
  async isWalletConnected(): Promise<boolean> {
    return !(await this.connectWalletButton.isVisible());
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Take a screenshot
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}
