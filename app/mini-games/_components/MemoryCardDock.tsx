'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

interface Order {
  id: string;
  displayNumber: number;
  primaryItemName: string | null;
  label: string | null;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

interface MemoryCardDockProps {
  className?: string;
}

export default function MemoryCardDock({ className = '' }: MemoryCardDockProps) {
  const { isSignedIn, userId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Order | null>(null);

  useEffect(() => {
    if (isSignedIn && userId) {
      fetchRecentOrders();
    } else {
      setLoading(false);
    }
  }, [isSignedIn, userId]);

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/v1/orders/recent?limit=8');
      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          setOrders(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getItemName = (order: Order) => {
    return order.primaryItemName || order.label || `Order #${order.displayNumber}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shipped':
        return 'text-green-400';
      case 'in_production':
        return 'text-yellow-400';
      case 'pending':
        return 'text-blue-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className={`${className}`} data-test="gc-memcard-dock">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full" />
          <div className="text-white/60 text-sm">Loading memory cards...</div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={`${className} text-center`} data-test="gc-memcard-dock">
        <div className="bg-gradient-to-br from-purple-900/30 to-black/40 backdrop-blur-sm border border-purple-400/20 rounded-xl p-6">
          <div className="text-white/60 text-sm mb-2">No memory cards yet</div>
          <div className="text-purple-200 text-xs">Make your first claim in the Shop</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${className}`} data-test="gc-memcard-dock">
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center">
            <span className="w-3 h-3 bg-pink-400 rounded-full mr-2 animate-pulse" />
            Memory Cards
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {orders.slice(0, 6).map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedCard(order)}
                className="group relative bg-gradient-to-br from-pink-500/20 to-purple-600/20 
                          backdrop-blur-sm border border-pink-400/30 rounded-lg p-3 
                          hover:from-pink-400/30 hover:to-purple-500/30 hover:border-pink-300/50
                          transition-all duration-300 text-left focus:outline-none 
                          focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
                data-test={`gc-memcard-${order.id}`}
                aria-label={`Open Order #${order.displayNumber} – ${getItemName(order)}`}
              >
                {/* Memory card styling with translucent glass effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs font-mono text-pink-300">#{order.displayNumber}</div>
                    <div className={`text-xs ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="text-white text-sm font-medium mb-1 line-clamp-2 group-hover:text-pink-200 transition-colors">
                    {getItemName(order)}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-200">
                      {formatPrice(order.totalAmount, order.currency)}
                    </span>
                    <span className="text-white/60">{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                {/* Subtle glow effect on hover */}
                <div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-400/0 via-pink-400/10 to-purple-400/0 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </button>
            ))}
          </div>

          {orders.length > 6 && (
            <div className="text-center">
              <button
                onClick={() => {
                  /* Navigate to full orders page */
                }}
                className="text-purple-300 hover:text-pink-300 text-xs transition-colors"
              >
                View all {orders.length} cards →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Memory Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div
            className="bg-gradient-to-br from-purple-900/90 to-black/90 border border-purple-400/30 
                         rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Order #{selectedCard.displayNumber}
                </h2>
                <div className={`text-sm ${getStatusColor(selectedCard.status)}`}>
                  {selectedCard.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-purple-300 hover:text-white transition-colors text-xl"
                aria-label="Close detail view"
              >
                
              </button>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-purple-200 text-sm mb-1">Item</label>
                <div className="text-white font-medium">{getItemName(selectedCard)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Total</label>
                  <div className="text-white font-medium">
                    {formatPrice(selectedCard.totalAmount, selectedCard.currency)}
                  </div>
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Date</label>
                  <div className="text-white">{formatDate(selectedCard.createdAt)}</div>
                </div>
              </div>

              {selectedCard.paidAt && (
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Paid</label>
                  <div className="text-green-400">{formatDate(selectedCard.paidAt)}</div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-purple-400/20">
                <button
                  onClick={() => {
                    // Navigate to order details page or receipt
                    window.open(`/orders/${selectedCard.id}`, '_blank');
                  }}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 
                           hover:from-pink-600 hover:to-purple-600 
                           text-white font-medium py-2 px-4 rounded-lg 
                           transition-all duration-300"
                >
                  View Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
