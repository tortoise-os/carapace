export type OrderType = "buy" | "sell";
export type OrderStatus = "pending" | "filled" | "cancelled" | "expired";

export interface LimitOrder {
	id: string;
	user: string;
	tokenIn: string;
	tokenOut: string;
	amountIn: string;
	targetPrice: string; // Price of tokenOut in terms of tokenIn
	currentPrice: string;
	orderType: OrderType;
	status: OrderStatus;
	createdAt: number;
	expiresAt: number;
	filledAt?: number;
	filledPrice?: string;
	filledAmount?: string;
	txDigest?: string;
}

export interface CreateLimitOrderParams {
	tokenIn: string;
	tokenOut: string;
	amountIn: string;
	targetPrice: string;
	orderType: OrderType;
	expiresInHours?: number; // Default 24 hours
}

export interface LimitOrdersFilter {
	status?: OrderStatus[];
	orderType?: OrderType[];
	tokenIn?: string;
	tokenOut?: string;
}
