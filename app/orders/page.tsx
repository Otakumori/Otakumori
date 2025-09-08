// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  sku: string;
  product: {
    id: string;
    name: string;
    primaryImageUrl: string | null;
  } | null;
  variant: {
    id: string;
    name: string;
  } | null;
}

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  trackingUrl: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { isSignedIn, userId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn && userId) {
      fetchOrders();
    }
  }, [isSignedIn, userId]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (data.ok) {
        setOrders(data.data.orders);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (_err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <Package className="h-4 w-4 text-purple-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'delivered':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
        <div className="container mx-auto px-4 py-16">
          <Card className="border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
            <h1 className="mb-4 text-2xl font-bold text-white">Sign In Required</h1>
            <p className="mb-8 text-pink-200">Please sign in to view your orders</p>
            <Link href="/sign-in">
              <Button className="bg-pink-500 hover:bg-pink-600">Sign In</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
        <div className="container mx-auto px-4 py-16">
          <Card className="border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-pink-200">Loading your orders...</p>
          </Card>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
        <div className="container mx-auto px-4 py-16">
          <Card className="border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
            <h1 className="mb-4 text-2xl font-bold text-white">Error</h1>
            <p className="mb-8 text-red-300">{error}</p>
            <Button onClick={fetchOrders} className="bg-pink-500 hover:bg-pink-600">
              Try Again
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Your Orders</h1>
          <p className="text-pink-200 mt-2">Track your purchases and order status</p>
        </div>

        {orders.length === 0 ? (
          <Card className="border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
            <Package className="h-16 w-16 text-pink-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Orders Yet</h2>
            <p className="text-pink-200 mb-6">Start shopping to see your orders here</p>
            <Link href="/shop">
              <Button className="bg-pink-500 hover:bg-pink-600">Browse Shop</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="border-pink-500/30 bg-white/10 p-6 backdrop-blur-lg">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        Order #{order.orderNumber}
                      </h3>
                      <Badge className={`${getStatusColor(order.status)} border`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-pink-200 text-sm">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right mt-4 lg:mt-0">
                    <p className="text-2xl font-bold text-white">${order.total.toFixed(2)}</p>
                    <p className="text-pink-200 text-sm">{order.currency}</p>
                  </div>
                </div>

                <Separator className="bg-pink-500/30 mb-4" />

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                        {item.product?.primaryImageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          (<img
                            src={item.product.primaryImageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />)
                        ) : (
                          <Package className="h-6 w-6 text-pink-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{item.name}</h4>
                        {item.variant && (
                          <p className="text-sm text-pink-200">{item.variant.name}</p>
                        )}
                        <p className="text-sm text-pink-300">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white">Qty: {item.quantity}</p>
                        <p className="text-pink-200">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.trackingUrl && (
                  <>
                    <Separator className="bg-pink-500/30 my-4" />
                    <div className="flex items-center gap-2 text-blue-300">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm">
                        {order.carrier && `${order.carrier} `}
                        {order.trackingNumber && `#${order.trackingNumber}`}
                      </span>
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Track Package
                      </a>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
