/**
 * Event Parser - Parse and decode blockchain events from Carapace contracts
 */

import { SuiClient, SuiEvent } from '@mysten/sui/client';
import type { EventId } from '@mysten/sui/client';
import type { ObjectId } from './types';

// ============================================================================
// Event Type Definitions
// ============================================================================

export interface PoolCreatedEvent {
  pool_id: string;
  token_x: string;
  token_y: string;
  creator: string;
}

export interface LiquidityAddedEvent {
  pool_id: string;
  provider: string;
  amount_x: string;
  amount_y: string;
  liquidity_minted: string;
}

export interface LiquidityRemovedEvent {
  pool_id: string;
  provider: string;
  amount_x: string;
  amount_y: string;
  liquidity_burned: string;
}

export interface SwapExecutedEvent {
  pool_id: string;
  trader: string;
  token_in: string;
  token_out: string;
  amount_in: string;
  amount_out: string;
  fee_amount: string;
}

export interface FlashSwapExecutedEvent {
  pool_id: string;
  borrower: string;
  borrowed_x: string;
  borrowed_y: string;
  repaid_x: string;
  repaid_y: string;
}

export interface PoolPausedEvent {
  pool_id: string;
  admin: string;
}

export interface PoolUnpausedEvent {
  pool_id: string;
  admin: string;
}

export interface ProtocolFeesCollectedEvent {
  pool_id: string;
  collector: string;
  amount_x: string;
  amount_y: string;
}

export type CarapaceEvent =
  | { type: 'PoolCreated'; data: PoolCreatedEvent }
  | { type: 'LiquidityAdded'; data: LiquidityAddedEvent }
  | { type: 'LiquidityRemoved'; data: LiquidityRemovedEvent }
  | { type: 'SwapExecuted'; data: SwapExecutedEvent }
  | { type: 'FlashSwapExecuted'; data: FlashSwapExecutedEvent }
  | { type: 'PoolPaused'; data: PoolPausedEvent }
  | { type: 'PoolUnpaused'; data: PoolUnpausedEvent }
  | { type: 'ProtocolFeesCollected'; data: ProtocolFeesCollectedEvent };

// ============================================================================
// Event Parser Class
// ============================================================================

export class EventParser {
  constructor(
    private client: SuiClient,
    private packageId: string,
  ) {}

  /**
   * Parse a raw Sui event into a Carapace event
   */
  parseEvent(event: SuiEvent): CarapaceEvent | null {
    const eventType = event.type;

    // Check if event is from our package
    if (!eventType.startsWith(this.packageId)) {
      return null;
    }

    const parsedContent = event.parsedJson as any;

    // Pool events
    if (eventType.includes('::pool::PoolCreated')) {
      return {
        type: 'PoolCreated',
        data: {
          pool_id: parsedContent.pool_id,
          token_x: parsedContent.token_x,
          token_y: parsedContent.token_y,
          creator: parsedContent.creator,
        },
      };
    }

    if (eventType.includes('::pool::LiquidityAdded')) {
      return {
        type: 'LiquidityAdded',
        data: {
          pool_id: parsedContent.pool_id,
          provider: parsedContent.provider,
          amount_x: parsedContent.amount_x,
          amount_y: parsedContent.amount_y,
          liquidity_minted: parsedContent.liquidity_minted,
        },
      };
    }

    if (eventType.includes('::pool::LiquidityRemoved')) {
      return {
        type: 'LiquidityRemoved',
        data: {
          pool_id: parsedContent.pool_id,
          provider: parsedContent.provider,
          amount_x: parsedContent.amount_x,
          amount_y: parsedContent.amount_y,
          liquidity_burned: parsedContent.liquidity_burned,
        },
      };
    }

    if (eventType.includes('::pool::SwapExecuted')) {
      return {
        type: 'SwapExecuted',
        data: {
          pool_id: parsedContent.pool_id,
          trader: parsedContent.trader,
          token_in: parsedContent.token_in,
          token_out: parsedContent.token_out,
          amount_in: parsedContent.amount_in,
          amount_out: parsedContent.amount_out,
          fee_amount: parsedContent.fee_amount,
        },
      };
    }

    if (eventType.includes('::pool::FlashSwapExecuted')) {
      return {
        type: 'FlashSwapExecuted',
        data: {
          pool_id: parsedContent.pool_id,
          borrower: parsedContent.borrower,
          borrowed_x: parsedContent.borrowed_x,
          borrowed_y: parsedContent.borrowed_y,
          repaid_x: parsedContent.repaid_x,
          repaid_y: parsedContent.repaid_y,
        },
      };
    }

    if (eventType.includes('::pool::PoolPaused')) {
      return {
        type: 'PoolPaused',
        data: {
          pool_id: parsedContent.pool_id,
          admin: parsedContent.admin,
        },
      };
    }

    if (eventType.includes('::pool::PoolUnpaused')) {
      return {
        type: 'PoolUnpaused',
        data: {
          pool_id: parsedContent.pool_id,
          admin: parsedContent.admin,
        },
      };
    }

    if (eventType.includes('::pool::ProtocolFeesCollected')) {
      return {
        type: 'ProtocolFeesCollected',
        data: {
          pool_id: parsedContent.pool_id,
          collector: parsedContent.collector,
          amount_x: parsedContent.amount_x,
          amount_y: parsedContent.amount_y,
        },
      };
    }

    return null;
  }

  /**
   * Query events for a specific pool
   */
  async getPoolEvents(
    poolId: ObjectId,
    options?: {
      eventType?: string;
      limit?: number;
      cursor?: EventId | null;
    },
  ): Promise<{ events: CarapaceEvent[]; nextCursor: EventId | null }> {
    const query: any = {
      MoveEventModule: {
        package: this.packageId,
        module: 'pool',
      },
    };

    if (options?.eventType) {
      query.MoveEventType = `${this.packageId}::pool::${options.eventType}`;
    }

    const response = await this.client.queryEvents({
      query,
      limit: options?.limit || 50,
      cursor: options?.cursor,
    });

    // Filter events by pool_id and parse
    const events = response.data
      .map((event) => this.parseEvent(event))
      .filter((event): event is CarapaceEvent => {
        if (!event) return false;
        return event.data.pool_id === poolId;
      });

    return {
      events,
      nextCursor: response.nextCursor || null,
    };
  }

  /**
   * Query all swap events for a pool
   */
  async getPoolSwaps(
    poolId: ObjectId,
    limit: number = 50,
  ): Promise<SwapExecutedEvent[]> {
    const { events } = await this.getPoolEvents(poolId, {
      eventType: 'SwapExecuted',
      limit,
    });

    return events
      .filter((e): e is { type: 'SwapExecuted'; data: SwapExecutedEvent } => e.type === 'SwapExecuted')
      .map((e) => e.data);
  }

  /**
   * Query events for a specific user
   */
  async getUserEvents(
    userAddress: string,
    options?: {
      limit?: number;
      cursor?: EventId | null;
    },
  ): Promise<{ events: CarapaceEvent[]; nextCursor: EventId | null }> {
    const response = await this.client.queryEvents({
      query: {
        MoveEventModule: {
          package: this.packageId,
          module: 'pool',
        },
      },
      limit: options?.limit || 50,
      cursor: options?.cursor,
    });

    // Filter events by user and parse
    const events = response.data
      .map((event) => this.parseEvent(event))
      .filter((event): event is CarapaceEvent => {
        if (!event) return false;

        // Check if user is involved in the event
        const data = event.data as any;
        return (
          data.provider === userAddress ||
          data.trader === userAddress ||
          data.borrower === userAddress ||
          data.creator === userAddress ||
          data.admin === userAddress ||
          data.collector === userAddress
        );
      });

    return {
      events,
      nextCursor: response.nextCursor || null,
    };
  }

  /**
   * Subscribe to pool events (real-time)
   */
  async subscribeToPoolEvents(
    poolId: ObjectId,
    callback: (event: CarapaceEvent) => void,
    _onError?: (error: Error) => void,
  ): Promise<() => void> {
    const unsubscribe = await this.client.subscribeEvent({
      filter: {
        MoveEventModule: {
          package: this.packageId,
          module: 'pool',
        },
      },
      onMessage: (event) => {
        const parsed = this.parseEvent(event);
        if (parsed && parsed.data.pool_id === poolId) {
          callback(parsed);
        }
      },
    });

    return () => unsubscribe();
  }

  /**
   * Subscribe to all swap events
   */
  async subscribeToSwaps(
    callback: (event: SwapExecutedEvent) => void,
    _onError?: (error: Error) => void,
  ): Promise<() => void> {
    const unsubscribe = await this.client.subscribeEvent({
      filter: {
        MoveEventType: `${this.packageId}::pool::SwapExecuted`,
      },
      onMessage: (event) => {
        const parsed = this.parseEvent(event);
        if (parsed && parsed.type === 'SwapExecuted') {
          callback(parsed.data);
        }
      },
    });

    return () => unsubscribe();
  }

  /**
   * Get recent activity across all pools
   */
  async getRecentActivity(limit: number = 20): Promise<CarapaceEvent[]> {
    const response = await this.client.queryEvents({
      query: {
        MoveEventModule: {
          package: this.packageId,
          module: 'pool',
        },
      },
      limit,
      order: 'descending',
    });

    return response.data
      .map((event) => this.parseEvent(event))
      .filter((event): event is CarapaceEvent => event !== null);
  }
}
