import Link from 'next/link';
import GlassPanel from '../GlassPanel';
import { t } from '@/lib/microcopy';

type Order = {
  id: string;
  orderNumber: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  createdAt: string;
  trackingNumber?: string;
};

type OrdersListProps = {
  orders: Order[];
};

export default function OrdersList({ orders }: OrdersListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'paid':
        return 'text-blue-400';
      case 'shipped':
        return 'text-purple-400';
      case 'delivered':
        return 'text-green-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-zinc-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Payment';
      case 'paid':
        return 'Payment Received';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <GlassPanel className="p-8">
          <h2 className="text-xl font-semibold text-white mb-4">No orders yet</h2>
          <p className="text-zinc-400 mb-6">{t('status', 'emptyInventory')}</p>
          <Link
            href="/shop"
            className="inline-block rounded-xl bg-fuchsia-500/90 px-6 py-3 text-white hover:bg-fuchsia-500 transition-colors"
          >
            Start Shopping
          </Link>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <GlassPanel key={order.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Order #{order.orderNumber}</h3>
              <p className="text-sm text-zinc-400">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </div>
              <div className="text-lg font-semibold text-white">${order.total.toFixed(2)}</div>
            </div>
          </div>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{item.name}</h4>
                  <p className="text-sm text-zinc-400">Qty: {item.quantity}</p>
                </div>
                <div className="text-fuchsia-300 font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {order.trackingNumber && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-zinc-300">
                Tracking: <span className="text-fuchsia-300">{order.trackingNumber}</span>
              </p>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <Link
              href={`/profile/orders/${order.id}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
            >
              View Details
            </Link>
            {order.status === 'delivered' && (
              <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                Download Receipt
              </button>
            )}
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
