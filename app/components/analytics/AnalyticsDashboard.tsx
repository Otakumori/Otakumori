'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Eye,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
} from 'lucide-react';

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    newThisWeek: number;
    growth: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    growth: number;
    topProducts: Array<{
      name: string;
      revenue: number;
      sales: number;
    }>;
  };
  engagement: {
    pageViews: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  sales: {
    total: number;
    thisMonth: number;
    growth: number;
    topCategories: Array<{
      name: string;
      sales: number;
      percentage: number;
    }>;
  };
  timeSeriesData: Array<{
    date: string;
    users: number;
    revenue: number;
    sales: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Mock analytics data
        const mockData: AnalyticsData = {
          users: {
            total: 1247,
            active: 892,
            newThisWeek: 45,
            growth: 12.5,
          },
          revenue: {
            total: 45678.9,
            thisMonth: 12345.67,
            growth: 8.3,
            topProducts: [
              { name: 'Cherry Blossom Hoodie', revenue: 2345.67, sales: 51 },
              { name: 'Anime Figure Collection', revenue: 1890.45, sales: 21 },
              { name: 'Gaming Accessories', revenue: 1567.89, sales: 78 },
            ],
          },
          engagement: {
            pageViews: 45678,
            uniqueVisitors: 12345,
            avgSessionDuration: 4.5,
            bounceRate: 32.1,
          },
          sales: {
            total: 234,
            thisMonth: 67,
            growth: 15.2,
            topCategories: [
              { name: 'Clothing', sales: 89, percentage: 38 },
              { name: 'Figures', sales: 67, percentage: 29 },
              { name: 'Gaming', sales: 45, percentage: 19 },
              { name: 'Accessories', sales: 33, percentage: 14 },
            ],
          },
          timeSeriesData: Array.from({ length: 30 }, (_, i) => {
            const dateStr = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0];
            return {
              date: dateStr ?? '',
              users: Math.floor(Math.random() * 50) + 800,
              revenue: Math.floor(Math.random() * 200) + 300,
              sales: Math.floor(Math.random() * 10) + 5,
            };
          }),
        };

        setData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading analytics:', error);
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your site's performance and growth
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border bg-white px-3 py-2 dark:bg-gray-800"
            aria-label="Select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.users.total)}</div>
            <div className="text-muted-foreground flex items-center text-xs">
              {data.users.growth > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              {Math.abs(data.users.growth)}% from last month
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {data.users.newThisWeek} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.revenue.total)}</div>
            <div className="text-muted-foreground flex items-center text-xs">
              {data.revenue.growth > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              {Math.abs(data.revenue.growth)}% from last month
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {formatCurrency(data.revenue.thisMonth)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.sales.total)}</div>
            <div className="text-muted-foreground flex items-center text-xs">
              {data.sales.growth > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              {Math.abs(data.sales.growth)}% from last month
            </div>
            <p className="text-muted-foreground mt-1 text-xs">{data.sales.thisMonth} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.engagement.pageViews)}</div>
            <div className="text-muted-foreground text-xs">
              {formatNumber(data.engagement.uniqueVisitors)} unique visitors
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {data.engagement.avgSessionDuration}min avg session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end justify-between gap-1">
              {data.timeSeriesData.slice(-7).map((day, i) => (
                <div key={day.date} className="flex flex-1 flex-col items-center">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-pink-500 to-pink-300"
                    style={{ height: `${(day.revenue / 500) * 100}%` }}
                  />
                  <span className="mt-1 text-xs text-gray-500">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Daily revenue for the last 7 days</p>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.revenue.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
                      <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-gray-500">
                      {((product.revenue / data.revenue.total) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sales.topCategories.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-pink-500" />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-pink-500"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Bounce Rate</span>
                <Badge variant={data.engagement.bounceRate > 50 ? 'destructive' : 'default'}>
                  {data.engagement.bounceRate}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Session Duration</span>
                <Badge variant="default">{data.engagement.avgSessionDuration}min</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Users</span>
                <Badge variant="default">{formatNumber(data.users.active)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Conversion Rate</span>
                <Badge variant="default">
                  {((data.sales.total / data.engagement.uniqueVisitors) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
