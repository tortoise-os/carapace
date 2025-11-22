import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Analytics Page Object Model
 * Represents the analytics dashboard
 */
export class AnalyticsPage extends BasePage {
  readonly volumeChart: Locator;
  readonly liquidityChart: Locator;
  readonly tvlMetric: Locator;
  readonly volumeMetric: Locator;
  readonly feesMetric: Locator;
  readonly timeframeSelector: Locator;
  readonly topPoolsTable: Locator;
  readonly topTokensTable: Locator;

  constructor(page: Page) {
    super(page);
    this.volumeChart = page.locator('[data-testid="volume-chart"]');
    this.liquidityChart = page.locator('[data-testid="liquidity-chart"]');
    this.tvlMetric = page.locator('[data-testid="tvl-metric"]');
    this.volumeMetric = page.locator('[data-testid="volume-metric"]');
    this.feesMetric = page.locator('[data-testid="fees-metric"]');
    this.timeframeSelector = page.locator('[data-testid="timeframe-selector"]');
    this.topPoolsTable = page.locator('[data-testid="top-pools-table"]');
    this.topTokensTable = page.locator('[data-testid="top-tokens-table"]');
  }

  /**
   * Navigate to analytics page
   */
  async goto() {
    await super.goto("/analytics");
    await this.waitForLoad();
  }

  /**
   * Select timeframe
   */
  async selectTimeframe(timeframe: "24h" | "7d" | "30d" | "1y") {
    await this.timeframeSelector.click();
    await this.page.getByText(timeframe).click();
    await this.page.waitForTimeout(500); // Wait for chart update
  }

  /**
   * Get TVL value
   */
  async getTVL(): Promise<string> {
    return (await this.tvlMetric.textContent()) || "";
  }

  /**
   * Get 24h volume value
   */
  async getVolume(): Promise<string> {
    return (await this.volumeMetric.textContent()) || "";
  }

  /**
   * Get fees collected value
   */
  async getFees(): Promise<string> {
    return (await this.feesMetric.textContent()) || "";
  }

  /**
   * Check if charts are visible
   */
  async areChartsVisible(): Promise<boolean> {
    const volumeVisible = await this.volumeChart.isVisible();
    const liquidityVisible = await this.liquidityChart.isVisible();
    return volumeVisible && liquidityVisible;
  }

  /**
   * Get top pools count
   */
  async getTopPoolsCount(): Promise<number> {
    return this.topPoolsTable.locator("tr").count();
  }

  /**
   * Get top tokens count
   */
  async getTopTokensCount(): Promise<number> {
    return this.topTokensTable.locator("tr").count();
  }
}
