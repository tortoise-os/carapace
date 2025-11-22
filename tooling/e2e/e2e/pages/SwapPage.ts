import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Swap Page Object Model
 * Represents the token swap interface
 */
export class SwapPage extends BasePage {
  readonly tokenFromSelect: Locator;
  readonly tokenToSelect: Locator;
  readonly amountInput: Locator;
  readonly swapButton: Locator;
  readonly slippageSettings: Locator;
  readonly priceImpactWarning: Locator;
  readonly estimatedOutput: Locator;

  constructor(page: Page) {
    super(page);
    this.tokenFromSelect = page.locator('[data-testid="token-from-select"]').or(
      page.getByLabel(/from token/i)
    );
    this.tokenToSelect = page.locator('[data-testid="token-to-select"]').or(
      page.getByLabel(/to token/i)
    );
    this.amountInput = page.locator('[data-testid="amount-input"]').or(
      page.getByPlaceholder(/amount/i)
    );
    this.swapButton = page.getByRole("button", { name: /swap/i });
    this.slippageSettings = page.locator('[data-testid="slippage-settings"]').or(
      page.getByLabel(/slippage/i)
    );
    this.priceImpactWarning = page.locator('[data-testid="price-impact-warning"]');
    this.estimatedOutput = page.locator('[data-testid="estimated-output"]');
  }

  /**
   * Navigate to swap page
   */
  async goto() {
    await super.goto("/swap");
    await this.waitForLoad();
  }

  /**
   * Select token from dropdown
   */
  async selectFromToken(tokenSymbol: string) {
    await this.tokenFromSelect.click();
    await this.page.getByText(tokenSymbol, { exact: true }).click();
  }

  /**
   * Select token to dropdown
   */
  async selectToToken(tokenSymbol: string) {
    await this.tokenToSelect.click();
    await this.page.getByText(tokenSymbol, { exact: true }).click();
  }

  /**
   * Enter amount to swap
   */
  async enterAmount(amount: string) {
    await this.amountInput.fill(amount);
    await this.page.waitForTimeout(500); // Wait for calculation
  }

  /**
   * Execute swap
   */
  async executeSwap() {
    await this.swapButton.click();
  }

  /**
   * Set slippage tolerance
   */
  async setSlippage(percentage: string) {
    await this.slippageSettings.click();
    await this.page.getByLabel(/slippage/i).fill(percentage);
  }

  /**
   * Get estimated output amount
   */
  async getEstimatedOutput(): Promise<string> {
    return this.estimatedOutput.textContent() || "";
  }

  /**
   * Check if swap button is enabled
   */
  async isSwapEnabled(): Promise<boolean> {
    return this.swapButton.isEnabled();
  }

  /**
   * Check if price impact warning is visible
   */
  async hasPriceImpactWarning(): Promise<boolean> {
    return this.priceImpactWarning.isVisible();
  }
}
