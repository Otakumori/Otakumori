'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminNav';
import { Package, Search, Download, Eye } from 'lucide-react';

interface Order {
  id: string;
  displayNumber: number;
  stripeId: string;
  status: string;
  totalAmount: number;
  subtotalCents: number;
  taxAmount?: number | null;
  shippingAmount?: number | null;
  discountAmount?: number | null;
  currency: string;
  createdAt: string;
  paidAt?: string | null;
  shippedAt?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  trackingUrl?: string | null;
  primaryItemName?: string | null;
  User: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  OrderItem: Array<{
    id: string;
    name: string;
    quantity: number;
    unitAmount: number;
    sku: string;
  }>;
}

interface FinancialSummary {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  inProductionOrders: number;
  shippedOrders: number;
  cancelledOrders: number;
  thisMonth: number;
  lastMonth: number;
  thisYear: number;
  totalRefunds: number;
}

const formatCurrency = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function OrdersPageClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: '30days',
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        status: filters.status,
        dateRange: filters.dateRange,
        ...(filters.search && { search: filters.search }),
      });
      
      const [ordersRes, summaryRes] = await Promise.all([
        fetch(`/api/admin/orders?${params}`),
        fetch('/api/admin/orders/summary'),
      ]);
      
      const ordersData = await ordersRes.json();
      const summaryData = await summaryRes.json();
      
      if (ordersData.ok) {
        setOrders(ordersData.data);
      } else {
        setError(ordersData.error?.message || 'Failed to load orders');
      }
      
      if (summaryData.ok) {
        setSummary(summaryData.data);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        status: filters.status,
        dateRange: filters.dateRange,
        format: 'csv',
        ...(filters.search && { search: filters.search }),
      });
      
      const res = await fetch(`/api/admin/orders/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('Failed to export CSV');
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Package className="h-8 w-8 text-pink-400" />
              Order Operations Center
            </h1>
            <p className="text-neutral-300">Manage orders, track shipments, and monitor finances</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {/* Financial Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl border border-white/10 bg-black/50 p-6">
              <div className="text-gray-400 text-sm mb-1">Total Revenue</div>
              <div className="text-3xl font-bold text-green-400">
                {formatCurrency(summary.totalRevenue)}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-6">
              <div className="text-gray-400 text-sm mb-1">Total Orders</div>
              <div className="text-3xl font-bold text-white">{summary.totalOrders}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-6">
              <div className="text-gray-400 text-sm mb-1">This Month</div>
              <div className="text-3xl font-bold text-blue-400">
                {formatCurrency(summary.thisMonth)}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-6">
              <div className="text-gray-400 text-sm mb-1">Pending Shipment</div>
              <div className="text-3xl font-bold text-yellow-400">
                {summary.pendingOrders + summary.inProductionOrders}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-black/50 border border-white/10 rounded-xl p-4 mb-6 flex gap-4 flex-wrap">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 bg-black/40 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_production">In Production</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="px-4 py-2 bg-black/40 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, email, item, or tracking..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="text-neutral-400 text-center py-8">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/50 p-8 text-center">
            <p className="text-neutral-400">No orders found</p>
          </div>
        ) : (
          <div className="bg-black/50 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/70 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Order #</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Customer</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Items</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Date</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-mono">#{order.displayNumber}</td>
                      <td className="px-6 py-4 text-gray-300">
                        <div>{order.User.email}</div>
                        {(order.User.firstName || order.User.lastName) && (
                          <div className="text-xs text-gray-500">
                            {[order.User.firstName, order.User.lastName].filter(Boolean).join(' ')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        <div>{order.OrderItem.length} item(s)</div>
                        {order.primaryItemName && (
                          <div className="text-xs text-gray-500">{order.primaryItemName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs border ${
                          order.status === 'shipped' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                          'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1 px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdate={loadData}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onUpdate,
}: {
  order: Order;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [tracking, setTracking] = useState({
    number: order.trackingNumber || '',
    carrier: order.carrier || '',
    url: order.trackingUrl || '',
  });
  const [saving, setSaving] = useState(false);

  const handleUpdateTracking = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/orders/${order.id}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tracking),
      });
      const data = await res.json();
      if (data.ok) {
        alert('Tracking updated successfully');
        onUpdate();
        onClose();
      } else {
        alert(data.error?.message || 'Failed to update tracking');
      }
    } catch (err) {
      alert('Failed to update tracking');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const totalItems = order.OrderItem.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = order.subtotalCents;
  const tax = order.taxAmount || 0;
  const shipping = order.shippingAmount || 0;
  const discount = order.discountAmount || 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-purple-900 to-black border border-white/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-gradient-to-br from-purple-900 to-black z-10">
          <h2 className="text-2xl font-bold text-white">
            Order #{order.displayNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <section>
            <h3 className="text-white font-semibold mb-3">Customer Information</h3>
            <div className="bg-black/50 rounded-lg p-4 space-y-2">
              <div className="text-gray-300">{order.User.email}</div>
              {(order.User.firstName || order.User.lastName) && (
                <div className="text-gray-400 text-sm">
                  {[order.User.firstName, order.User.lastName].filter(Boolean).join(' ')}
                </div>
              )}
              <div className="text-gray-400 text-xs font-mono">User ID: {order.User.id}</div>
            </div>
          </section>

          {/* Items */}
          <section>
            <h3 className="text-white font-semibold mb-3">Order Items ({totalItems} total)</h3>
            <div className="bg-black/50 rounded-lg divide-y divide-white/10">
              {order.OrderItem.map((item) => (
                <div key={item.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="text-white">{item.name}</div>
                    <div className="text-gray-400 text-sm">SKU: {item.sku} • Qty: {item.quantity}</div>
                  </div>
                  <div className="text-white font-semibold">
                    {formatCurrency(item.unitAmount * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Financial Breakdown */}
          <section>
            <h3 className="text-white font-semibold mb-3">Financial Breakdown</h3>
            <div className="bg-black/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Tax:</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              )}
              {shipping > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Shipping:</span>
                  <span>{formatCurrency(shipping)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-green-300">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-2 mt-2">
                <span>Total:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </section>

          {/* Tracking Info */}
          <section>
            <h3 className="text-white font-semibold mb-3">Tracking Information</h3>
            <div className="bg-black/50 rounded-lg p-4 space-y-4">
              <div>
                <label htmlFor="tracking-number" className="block text-gray-300 text-sm mb-1">Tracking Number</label>
                <input
                  id="tracking-number"
                  type="text"
                  value={tracking.number}
                  onChange={(e) => setTracking({ ...tracking, number: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label htmlFor="tracking-carrier" className="block text-gray-300 text-sm mb-1">Carrier</label>
                <input
                  id="tracking-carrier"
                  type="text"
                  value={tracking.carrier}
                  onChange={(e) => setTracking({ ...tracking, carrier: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="USPS, UPS, FedEx, etc."
                />
              </div>
              <div>
                <label htmlFor="tracking-url" className="block text-gray-300 text-sm mb-1">Tracking URL</label>
                <input
                  id="tracking-url"
                  type="url"
                  value={tracking.url}
                  onChange={(e) => setTracking({ ...tracking, url: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="https://..."
                />
              </div>
              <button
                onClick={handleUpdateTracking}
                disabled={saving}
                className="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                {saving ? 'Saving...' : 'Update Tracking'}
              </button>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h3 className="text-white font-semibold mb-3">Order Timeline</h3>
            <div className="bg-black/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Order Placed:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between text-gray-300">
                  <span>Paid:</span>
                  <span>{formatDate(order.paidAt)}</span>
                </div>
              )}
              {order.shippedAt && (
                <div className="flex justify-between text-gray-300">
                  <span>Shipped:</span>
                  <span>{formatDate(order.shippedAt)}</span>
                </div>
              )}
            </div>
          </section>

          {/* Order IDs for reference */}
          <section>
            <h3 className="text-white font-semibold mb-3">Reference IDs</h3>
            <div className="bg-black/50 rounded-lg p-4 space-y-2 text-xs font-mono text-gray-400">
              <div>Stripe ID: {order.stripeId}</div>
              <div>Order ID: {order.id}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

