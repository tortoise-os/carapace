import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Pools Page Object Model
 * Represents the liquidity pools interface
 */
export class PoolsPage extends BasePage {
  readonly createPoolButton: Locator;
  readonly poolsList: Locator;
  readonly searchInput: Locator;
  readonly sortDropdown: Locator;
  readonly filterButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.createPoolButton = page.getByRole("button", { name: /create pool/i });
    this.poolsList = page.locator('[data-testid="pools-list"]').or(
      page.locator(".pool-card").first()
    );
    this.searchInput = page.getByPlaceholder(/search pools/i);
    this.sortDropdown = page.locator('[data-testid="sort-dropdown"]');
    this.filterButtons = page.locator('[data-testid="filter-buttons"]');
  }

  /**
   * Navigate to pools page
   */
  async goto() {
    await super.goto("/pools");
    await this.waitForLoad();
  }

  /**
   * Navigate to create pool page
   */
  async gotoCreatePool() {
    await this.createPoolButton.click();
    await this.page.waitForURL("**/pools/create");
  }

  /**
   * Search for a pool
   */
  async searchPool(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300); // Debounce
  }

  /**
   * Get pool card by token pair
   */
  getPoolCard(tokenA: string, tokenB: string): Locator {
    return this.page.locator(".pool-card", {
      has: this.page.locator(`text=${tokenA}`),
    }).and(this.page.locator(".pool-card", {
      has: this.page.locator(`text=${tokenB}`),
    }));
  }

  /**
   * Click on a pool card
   */
  async selectPool(tokenA: string, tokenB: string) {
    await this.getPoolCard(tokenA, tokenB).click();
  }

  /**
   * Get pool count
   */
  async getPoolCount(): Promise<number> {
    return this.page.locator(".pool-card").count();
  }

  /**
   * Check if pools are loading
   */
  async isLoading(): Promise<boolean> {
    return this.page.locator('[data-testid="loading-spinner"]').isVisible();
  }

  /**
   * Sort pools
   */
  async sortBy(option: string) {
    await this.sortDropdown.click();
    await this.page.getByText(option).click();
  }
}
