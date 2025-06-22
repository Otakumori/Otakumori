'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require('next/server');
// Mock data for shop management
const mockProducts = [
  {
    id: '1',
    name: 'Cherry Blossom Hoodie',
    description: 'Elegant hoodie with sakura pattern',
    price: 45.99,
    category: 'Clothing',
    stock: 25,
    status: 'active',
    imageUrl: '/assets/products/hoodie1.jpg',
    tags: ['clothing', 'sakura', 'hoodie'],
    createdAt: '2024-01-15T10:00:00Z',
    salesCount: 12,
    revenue: 551.88,
  },
  {
    id: '2',
    name: 'Anime Figure - Sakura',
    description: 'Limited edition anime figure',
    price: 89.99,
    category: 'Figures',
    stock: 8,
    status: 'active',
    imageUrl: '/assets/products/figure1.jpg',
    tags: ['figure', 'anime', 'limited'],
    createdAt: '2024-01-10T14:30:00Z',
    salesCount: 5,
    revenue: 449.95,
  },
  {
    id: '3',
    name: 'Gaming Mouse Pad',
    description: 'RGB gaming mouse pad with anime design',
    price: 29.99,
    category: 'Gaming',
    stock: 0,
    status: 'out_of_stock',
    imageUrl: '/assets/products/mousepad1.jpg',
    tags: ['gaming', 'rgb', 'mousepad'],
    createdAt: '2024-01-05T09:15:00Z',
    salesCount: 20,
    revenue: 599.8,
  },
];
const mockOrders = [
  {
    id: '1',
    customerId: 'user123',
    customerName: 'Sakura Fan',
    items: [{ productId: '1', name: 'Cherry Blossom Hoodie', quantity: 1, price: 45.99 }],
    total: 45.99,
    status: 'completed',
    createdAt: '2024-01-20T15:30:00Z',
    shippingAddress: '123 Anime St, Tokyo, Japan',
  },
  {
    id: '2',
    customerId: 'user456',
    customerName: 'Otaku Master',
    items: [
      { productId: '2', name: 'Anime Figure - Sakura', quantity: 1, price: 89.99 },
      { productId: '3', name: 'Gaming Mouse Pad', quantity: 2, price: 29.99 },
    ],
    total: 149.97,
    status: 'pending',
    createdAt: '2024-01-21T10:15:00Z',
    shippingAddress: '456 Manga Ave, Osaka, Japan',
  },
];
async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    switch (action) {
      case 'products':
        return server_1.NextResponse.json({
          success: true,
          data: mockProducts,
          total: mockProducts.length,
        });
      case 'orders':
        return server_1.NextResponse.json({
          success: true,
          data: mockOrders,
          total: mockOrders.length,
        });
      case 'analytics':
        const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = mockOrders.length;
        const lowStockProducts = mockProducts.filter(p => p.stock < 10);
        return server_1.NextResponse.json({
          success: true,
          data: {
            totalRevenue,
            totalOrders,
            lowStockProducts: lowStockProducts.length,
            topSellingProduct: mockProducts.reduce((top, current) =>
              current.salesCount > top.salesCount ? current : top
            ),
          },
        });
      default:
        return server_1.NextResponse.json({
          success: true,
          data: {
            products: mockProducts.length,
            orders: mockOrders.length,
            totalRevenue: mockOrders.reduce((sum, order) => sum + order.total, 0),
          },
        });
    }
  } catch (error) {
    console.error('Shop API Error:', error);
    return server_1.NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
async function POST(request) {
  try {
    const body = await request.json();
    const { action, data } = body;
    switch (action) {
      case 'add_product':
        const newProduct = {
          id: Date.now().toString(),
          ...data,
          createdAt: new Date().toISOString(),
          salesCount: 0,
          revenue: 0,
        };
        // In real implementation, save to database
        return server_1.NextResponse.json({
          success: true,
          data: newProduct,
          message: 'Product added successfully',
        });
      case 'update_product':
        // In real implementation, update in database
        return server_1.NextResponse.json({
          success: true,
          message: 'Product updated successfully',
        });
      case 'delete_product':
        // In real implementation, delete from database
        return server_1.NextResponse.json({
          success: true,
          message: 'Product deleted successfully',
        });
      case 'update_order_status':
        // In real implementation, update order status in database
        return server_1.NextResponse.json({
          success: true,
          message: 'Order status updated successfully',
        });
      default:
        return server_1.NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Shop API Error:', error);
    return server_1.NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
