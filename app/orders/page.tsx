'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { EmptyOrders } from '@/app/components/empty-states';
import {
  CommanderArchiveHeading,
  CommanderArchiveShell,
} from '@/app/components/commander/CommanderArchive';
import { MoriSystemState } from '@/app/components/mori/MoriProduction';
import { MoriStatus, type MoriStatusTone } from '@/app/components/mori/MoriFoundation';

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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (data.ok) {
        setOrders(data.data.orders);
      } else {
        setError('unavailable');
      }
    } catch {
      setError('unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn && userId) void fetchOrders();
  }, [fetchOrders, isSignedIn, userId]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle aria-hidden="true" className="h-3.5 w-3.5" />;
      case 'shipped':
        return <Truck aria-hidden="true" className="h-3.5 w-3.5" />;
      case 'delivered':
        return <Package aria-hidden="true" className="h-3.5 w-3.5" />;
      case 'pending':
        return <Clock aria-hidden="true" className="h-3.5 w-3.5" />;
      default:
        return <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />;
    }
  };

  const getStatusTone = (status: string): MoriStatusTone => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'shipped':
        return 'selected';
      case 'delivered':
        return 'success';
      case 'pending':
        return 'neutral';
      default:
        return 'error';
    }
  };

  if (!isSignedIn) {
    return (
      <CommanderArchiveShell current="orders" className="om-route-page om-route-page--orders">
        <CommanderArchiveHeading
          title="Orders"
          description="Completed purchases, fulfillment progress, and shipping records remain together."
        />
        <MoriSystemState
          state="locked"
          title="Sign in to view your orders"
          description="Your completed purchases and shipping records are private to your account."
          action={
            <Link href="/sign-in" className="mori-foundation-button">
              Sign In
            </Link>
          }
        />
      </CommanderArchiveShell>
    );
  }

  if (loading) {
    return (
      <CommanderArchiveShell current="orders" className="om-route-page om-route-page--orders">
        <CommanderArchiveHeading
          title="Orders"
          description="Completed purchases, fulfillment progress, and shipping records remain together."
        />
        <MoriSystemState
          state="loading"
          title="Opening your order archive"
          description="Gathering your purchase records…"
        />
      </CommanderArchiveShell>
    );
  }

  if (error) {
    return (
      <CommanderArchiveShell current="orders" className="om-route-page om-route-page--orders">
        <CommanderArchiveHeading
          title="Orders"
          description="Completed purchases, fulfillment progress, and shipping records remain together."
        />
        <MoriSystemState
          state="error"
          title="Orders temporarily unavailable"
          description="We couldn't load your order records right now."
          action={
            <button type="button" onClick={fetchOrders} className="mori-foundation-button">
              Try Again
            </button>
          }
        />
      </CommanderArchiveShell>
    );
  }

  return (
    <CommanderArchiveShell current="orders" className="om-route-page om-route-page--orders">
      <CommanderArchiveHeading
        title="Orders"
        description="Completed purchases, fulfillment progress, and shipping records remain together."
      />

      {orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <section aria-label="Order history" className="commander-order-list">
          {orders.map((order) => (
            <article key={order.id} className="commander-order">
              <header className="commander-order__header">
                <div>
                  <div className="commander-order__title-row">
                    <h2>Order #{order.orderNumber}</h2>
                    <MoriStatus tone={getStatusTone(order.status)}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </MoriStatus>
                  </div>
                  <p className="commander-order__date">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="commander-order__total">${order.total.toFixed(2)}</p>
                  <p className="commander-order__currency">{order.currency}</p>
                </div>
              </header>

              <ul
                className="commander-order__items"
                aria-label={`Items in order ${order.orderNumber}`}
              >
                {order.items.map((item) => (
                  <li key={item.id} className="commander-order__item">
                    <div className="commander-order__image">
                      {item.product?.primaryImageUrl ? (
                        <img
                          src={item.product.primaryImageUrl}
                          alt=""
                          width="56"
                          height="56"
                          loading="lazy"
                        />
                      ) : (
                        <Package aria-hidden="true" className="h-6 w-6 text-[#b79b73]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="commander-order__item-name">{item.name}</p>
                      {item.variant ? (
                        <p className="commander-order__item-detail">{item.variant.name}</p>
                      ) : null}
                      <p className="commander-order__item-detail">SKU: {item.sku}</p>
                    </div>
                    <div className="commander-order__item-summary">
                      <p className="commander-order__item-price">${item.price.toFixed(2)}</p>
                      <p className="commander-order__item-detail">Quantity {item.quantity}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {order.trackingUrl ? (
                <div className="commander-order__tracking">
                  <Truck aria-hidden="true" className="h-4 w-4" />
                  <span>
                    {order.carrier ? `${order.carrier} ` : ''}
                    {order.trackingNumber ? `#${order.trackingNumber}` : ''}
                  </span>
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                    Track package
                  </a>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      )}
    </CommanderArchiveShell>
  );
}
