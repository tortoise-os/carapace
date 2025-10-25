import {
  LimitOrder,
  CreateLimitOrderParams,
  OrderStatus,
  LimitOrdersFilter,
} from '../types/limit-orders';

// In-memory storage for demo (in production, this would be on-chain)
const ordersStorage = new Map<string, LimitOrder>();

export class LimitOrdersService {
  /**
   * Create a new limit order
   */
  createOrder(
    params: CreateLimitOrderParams,
    userAddress: string,
    currentPrice: string
  ): LimitOrder {
    const orderId = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    const expiresInMs =
      (params.expiresInHours || 24) * 60 * 60 * 1000;

    const order: LimitOrder = {
      id: orderId,
      user: userAddress,
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      targetPrice: params.targetPrice,
      currentPrice,
      orderType: params.orderType,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + expiresInMs,
    };

    ordersStorage.set(orderId, order);
    return order;
  }

  /**
   * Get all orders for a user
   */
  getUserOrders(userAddress: string, filter?: LimitOrdersFilter): LimitOrder[] {
    const userOrders = Array.from(ordersStorage.values()).filter(
      (order) => order.user === userAddress
    );

    if (!filter) return userOrders;

    return userOrders.filter((order) => {
      if (filter.status && !filter.status.includes(order.status)) {
        return false;
      }
      if (filter.orderType && !filter.orderType.includes(order.orderType)) {
        return false;
      }
      if (filter.tokenIn && order.tokenIn !== filter.tokenIn) {
        return false;
      }
      if (filter.tokenOut && order.tokenOut !== filter.tokenOut) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get a specific order by ID
   */
  getOrder(orderId: string): LimitOrder | null {
    return ordersStorage.get(orderId) || null;
  }

  /**
   * Cancel a pending order
   */
  cancelOrder(orderId: string, userAddress: string): boolean {
    const order = ordersStorage.get(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.user !== userAddress) {
      throw new Error('Unauthorized');
    }

    if (order.status !== 'pending') {
      throw new Error('Can only cancel pending orders');
    }

    order.status = 'cancelled';
    ordersStorage.set(orderId, order);
    return true;
  }

  /**
   * Execute an order (called when target price is reached)
   */
  executeOrder(
    orderId: string,
    filledPrice: string,
    filledAmount: string,
    txDigest: string
  ): LimitOrder {
    const order = ordersStorage.get(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending') {
      throw new Error('Order is not pending');
    }

    order.status = 'filled';
    order.filledAt = Date.now();
    order.filledPrice = filledPrice;
    order.filledAmount = filledAmount;
    order.txDigest = txDigest;

    ordersStorage.set(orderId, order);
    return order;
  }

  /**
   * Check if an order should be executed based on current price
   */
  shouldExecuteOrder(order: LimitOrder, currentPrice: number): boolean {
    if (order.status !== 'pending') return false;

    const targetPrice = parseFloat(order.targetPrice);

    if (order.orderType === 'buy') {
      // Execute buy order if current price <= target price
      return currentPrice <= targetPrice;
    } else {
      // Execute sell order if current price >= target price
      return currentPrice >= targetPrice;
    }
  }

  /**
   * Update current prices for all pending orders and check for execution
   */
  updatePrices(priceMap: Map<string, number>): LimitOrder[] {
    const executedOrders: LimitOrder[] = [];

    for (const [orderId, order] of ordersStorage.entries()) {
      if (order.status !== 'pending') continue;

      // Check if expired
      if (Date.now() > order.expiresAt) {
        order.status = 'expired';
        ordersStorage.set(orderId, order);
        continue;
      }

      // Get current price for this trading pair
      const pairKey = `${order.tokenIn}/${order.tokenOut}`;
      const currentPrice = priceMap.get(pairKey);

      if (currentPrice !== undefined) {
        order.currentPrice = currentPrice.toString();

        // Check if order should be executed
        if (this.shouldExecuteOrder(order, currentPrice)) {
          // Simulate execution
          const filledAmount = order.amountIn; // Simplified
          const txDigest = `0x${Math.random()
            .toString(16)
            .substring(2, 18)}`;

          this.executeOrder(
            orderId,
            currentPrice.toString(),
            filledAmount,
            txDigest
          );

          executedOrders.push(order);
        } else {
          ordersStorage.set(orderId, order);
        }
      }
    }

    return executedOrders;
  }

  /**
   * Get order statistics
   */
  getOrderStats(userAddress: string) {
    const userOrders = this.getUserOrders(userAddress);

    return {
      total: userOrders.length,
      pending: userOrders.filter((o) => o.status === 'pending').length,
      filled: userOrders.filter((o) => o.status === 'filled').length,
      cancelled: userOrders.filter((o) => o.status === 'cancelled').length,
      expired: userOrders.filter((o) => o.status === 'expired').length,
    };
  }

  /**
   * Calculate price difference percentage
   */
  getPriceDifference(order: LimitOrder): {
    percentage: number;
    direction: 'above' | 'below' | 'at';
  } {
    const current = parseFloat(order.currentPrice);
    const target = parseFloat(order.targetPrice);

    const diff = ((current - target) / target) * 100;

    return {
      percentage: Math.abs(diff),
      direction: diff > 0.01 ? 'above' : diff < -0.01 ? 'below' : 'at',
    };
  }
}

// Singleton instance
export const limitOrdersService = new LimitOrdersService();
