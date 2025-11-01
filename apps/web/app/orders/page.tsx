'use client';

import { useState, useEffect } from 'react';
import { BlurFade, MagicCard, Card, Badge, Button, DotPattern } from '@carapace/carapace-ui';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Plus,
  Filter,
} from 'lucide-react';
import { LimitOrder, OrderStatus } from '@/lib/types/limit-orders';
import { limitOrdersService } from '@/lib/services/limit-orders-service';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function OrdersPage() {
  const account = useCurrentAccount();
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<LimitOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    filled: 0,
    cancelled: 0,
    expired: 0,
  });

  // Load orders
  useEffect(() => {
    if (!account?.address) return;

    // Generate mock orders for demo
    const mockOrders: LimitOrder[] = [
      {
        id: 'order_1',
        user: account.address,
        tokenIn: '0x2::sui::SUI',
        tokenOut: '0x2::btc::BTC',
        amountIn: '1000',
        targetPrice: '0.00045',
        currentPrice: '0.00042',
        orderType: 'buy',
        status: 'pending',
        createdAt: Date.now() - 3600000,
        expiresAt: Date.now() + 82800000,
      },
      {
        id: 'order_2',
        user: account.address,
        tokenIn: '0x2::usdc::USDC',
        tokenOut: '0x2::sui::SUI',
        amountIn: '500',
        targetPrice: '2.5',
        currentPrice: '2.3',
        orderType: 'sell',
        status: 'pending',
        createdAt: Date.now() - 7200000,
        expiresAt: Date.now() + 79200000,
      },
      {
        id: 'order_3',
        user: account.address,
        tokenIn: '0x2::sui::SUI',
        tokenOut: '0x2::usdc::USDC',
        amountIn: '250',
        targetPrice: '2.2',
        currentPrice: '2.3',
        orderType: 'buy',
        status: 'filled',
        createdAt: Date.now() - 172800000,
        expiresAt: Date.now() - 86400000,
        filledAt: Date.now() - 100000000,
        filledPrice: '2.18',
        filledAmount: '545',
        txDigest: '0xabcd1234...',
      },
    ];

    setOrders(mockOrders);
    setFilteredOrders(mockOrders);

    // Calculate stats
    setStats({
      total: mockOrders.length,
      pending: mockOrders.filter((o) => o.status === 'pending').length,
      filled: mockOrders.filter((o) => o.status === 'filled').length,
      cancelled: mockOrders.filter((o) => o.status === 'cancelled').length,
      expired: mockOrders.filter((o) => o.status === 'expired').length,
    });
  }, [account]);

  // Filter orders
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((o) => o.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const getTokenSymbol = (address: string) => {
    return address.split('::').pop() || 'Unknown';
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTimeRemaining = (expiresAt: number) => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return 'Expired';

    const hours = Math.floor(remaining / 3600000);
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${Math.floor((remaining % 3600000) / 60000)}m`;
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'filled':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      filled: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      expired: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!account) {
    return (
      <div className="relative min-h-screen py-12">
        <DotPattern className="opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to view and manage limit orders
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-12">
      <DotPattern className="opacity-10" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <BlurFade delay={0.1}>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Limit Orders
              </h1>
              <p className="text-lg text-muted-foreground">
                Set target prices for automatic execution
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <Button size="lg" className="mt-4 md:mt-0">
              <Plus className="mr-2 h-5 w-5" />
              Create Order
            </Button>
          </BlurFade>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: Filter },
            {
              label: 'Pending',
              value: stats.pending,
              icon: Clock,
              color: 'text-yellow-600',
            },
            {
              label: 'Filled',
              value: stats.filled,
              icon: CheckCircle2,
              color: 'text-green-600',
            },
            {
              label: 'Cancelled',
              value: stats.cancelled,
              icon: XCircle,
              color: 'text-red-600',
            },
            {
              label: 'Expired',
              value: stats.expired,
              icon: AlertCircle,
              color: 'text-orange-600',
            },
          ].map((stat, i) => (
            <BlurFade key={i} delay={0.2 + i * 0.05}>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                  <stat.icon
                    className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`}
                  />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </Card>
            </BlurFade>
          ))}
        </div>

        {/* Filters */}
        <BlurFade delay={0.4}>
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {(['all', 'pending', 'filled', 'cancelled', 'expired'] as const).map(
              (status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              )
            )}
          </div>
        </BlurFade>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <BlurFade delay={0.5}>
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No {statusFilter !== 'all' ? statusFilter : ''} orders found
                </p>
              </Card>
            </BlurFade>
          ) : (
            filteredOrders.map((order, index) => (
              <BlurFade key={order.id} delay={0.5 + index * 0.05}>
                <MagicCard className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">
                              {getTokenSymbol(order.tokenIn)} →{' '}
                              {getTokenSymbol(order.tokenOut)}
                            </span>
                            {getStatusBadge(order.status)}
                            <Badge variant="outline">
                              {order.orderType.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Created {formatTime(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">
                            Amount
                          </div>
                          <div className="font-semibold">
                            {parseFloat(order.amountIn).toFixed(2)}{' '}
                            {getTokenSymbol(order.tokenIn)}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground mb-1">
                            Target Price
                          </div>
                          <div className="font-semibold">
                            {parseFloat(order.targetPrice).toFixed(6)}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground mb-1">
                            Current Price
                          </div>
                          <div
                            className={`font-semibold flex items-center gap-1 ${
                              parseFloat(order.currentPrice) >
                              parseFloat(order.targetPrice)
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {parseFloat(order.currentPrice) >
                            parseFloat(order.targetPrice) ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {parseFloat(order.currentPrice).toFixed(6)}
                          </div>
                        </div>

                        {order.status === 'pending' && (
                          <div>
                            <div className="text-muted-foreground mb-1">
                              Expires In
                            </div>
                            <div className="font-semibold">
                              {getTimeRemaining(order.expiresAt)}
                            </div>
                          </div>
                        )}

                        {order.status === 'filled' && (
                          <div>
                            <div className="text-muted-foreground mb-1">
                              Filled Price
                            </div>
                            <div className="font-semibold text-green-600">
                              {order.filledPrice}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {order.status === 'pending' && (
                      <div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            limitOrdersService.cancelOrder(
                              order.id,
                              account.address
                            );
                            // Refresh orders
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {order.status === 'filled' && order.txDigest && (
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://suiexplorer.com/txblock/${order.txDigest}?network=testnet`,
                              '_blank'
                            )
                          }
                        >
                          View Tx
                        </Button>
                      </div>
                    )}
                  </div>
                </MagicCard>
              </BlurFade>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
