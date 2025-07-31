'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getAllAnalytics,
  BasicDashboardData,
  FinancialOverviewData,
  OrderPerformanceData,
  ItemSalesAnalysisData,
  OperatingMetricsData,
} from '@/services/vendorAnalyticsService';

interface AnalyticsTabProps {
  canteenId: string;
}

const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#84cc16', // Lime
];

// Professional color gradients
const GRADIENT_CARDS = {
  orders: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  earnings: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  balance: 'bg-gradient-to-br from-purple-500 to-violet-600',
  rating: 'bg-gradient-to-br from-amber-500 to-orange-600',
};

// Icon components (using emojis as fallback since we don't have lucide-react confirmed)
const Icons = {
  orders: '📦',
  earnings: '💰',
  balance: '💳',
  rating: '⭐',
  items: '🍽️',
  payouts: '💸',
  time: '⏰',
  calendar: '📅',
  analytics: '📊',
  trending: '📈',
};

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ canteenId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{
    basic: BasicDashboardData;
    financial: FinancialOverviewData;
    orders: OrderPerformanceData;
    items: ItemSalesAnalysisData;
    operating: OperatingMetricsData;
  } | null>(null);

  useEffect(() => {
    if (!canteenId) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllAnalytics(canteenId);
        setAnalyticsData(data);
      } catch (err: any) {
        console.error('Failed to fetch analytics:', err);
        setError(
          err?.response?.data?.message || 'Failed to load analytics data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [canteenId]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-white p-6'>
        <div className='max-w-7xl mx-auto space-y-8'>
          {/* Header */}
          <div className='text-center space-y-4'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4'>
              <span className='text-2xl text-white'>{Icons.analytics}</span>
            </div>
            <Skeleton className='h-8 w-64 mx-auto' />
            <Skeleton className='h-4 w-96 mx-auto' />
          </div>

          <Separator className='bg-gradient-to-r from-transparent via-gray-300 to-transparent' />

          {/* Stats Cards Skeleton */}
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                className='border-0 shadow-xl bg-gradient-to-br from-white to-gray-50'>
                <CardContent className='p-8'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-3'>
                      <Skeleton className='h-4 w-24' />
                      <Skeleton className='h-8 w-20' />
                    </div>
                    <Skeleton className='w-14 h-14 rounded-2xl' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className='border-0 shadow-xl bg-white'>
                <CardHeader className='pb-4'>
                  <Skeleton className='h-6 w-48' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='h-80 w-full rounded-lg' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-white p-6'>
        <div className='max-w-7xl mx-auto space-y-8'>
          {/* Header */}
          <div className='text-center space-y-4'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4'>
              <span className='text-2xl text-white'>{Icons.analytics}</span>
            </div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>
              Analytics Dashboard
            </h1>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Comprehensive insights about your business performance
            </p>
          </div>

          <Separator className='bg-gradient-to-r from-transparent via-gray-300 to-transparent' />

          <Alert
            variant='destructive'
            className='max-w-2xl mx-auto border-red-200 bg-red-50'>
            <AlertDescription className='text-red-700'>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const { basic, financial, orders, items, operating } = analyticsData;

  // Prepare status data for pie chart
  const statusData = Object.entries(orders.statusCounts).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    })
  );

  // Prepare sales trend data for line chart
  const salesTrendData = financial.salesData.map((point) => ({
    date: `${point._id.day}/${point._id.month}`,
    sales: point.dailyTotal,
    orders: point.count,
  }));

  // Prepare hourly distribution data
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const found = orders.ordersByHour.find((item) => item._id === hour);
    return {
      hour: `${hour}:00`,
      orders: found ? found.count : 0,
    };
  });

  // Prepare day-wise distribution
  const dayData = Object.entries(operating.ordersByDay).map(([day, count]) => ({
    day,
    orders: count,
  }));

  return (
    <div className='space-y-10'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800 mb-1'>Analytics</h1>
        <p className='text-gray-600'>
          Comprehensive insights and performance metrics for your business
        </p>
      </div>

      {/* Enhanced Key Metrics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
        <Card className='group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'>
          <div className={`h-2 ${GRADIENT_CARDS.orders}`}></div>
          <CardContent className='p-8 bg-gradient-to-br from-white to-blue-50'>
            <div className='flex items-center justify-between'>
              <div className='space-y-2'>
                <p className='text-sm font-semibold text-blue-600 uppercase tracking-wide'>
                  Total Orders
                </p>
                <p className='text-3xl font-bold text-gray-800'>
                  {basic.totalOrders.toLocaleString()}
                </p>
                <p className='text-xs text-gray-500'>All time orders</p>
              </div>
              <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200'>
                <span className='text-xl text-white'>{Icons.orders}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'>
          <div className={`h-2 ${GRADIENT_CARDS.earnings}`}></div>
          <CardContent className='p-8 bg-gradient-to-br from-white to-emerald-50'>
            <div className='flex items-center justify-between'>
              <div className='space-y-2'>
                <p className='text-sm font-semibold text-emerald-600 uppercase tracking-wide'>
                  Total Earnings
                </p>
                <p className='text-3xl font-bold text-gray-800'>
                  ₹{basic.totalEarnings.toLocaleString()}
                </p>
                <p className='text-xs text-gray-500'>Lifetime revenue</p>
              </div>
              <div className='w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200'>
                <span className='text-xl text-white'>{Icons.earnings}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'>
          <div className={`h-2 ${GRADIENT_CARDS.balance}`}></div>
          <CardContent className='p-8 bg-gradient-to-br from-white to-purple-50'>
            <div className='flex items-center justify-between'>
              <div className='space-y-2'>
                <p className='text-sm font-semibold text-purple-600 uppercase tracking-wide'>
                  Available Balance
                </p>
                <p className='text-3xl font-bold text-gray-800'>
                  ₹{basic.availableBalance.toLocaleString()}
                </p>
                <p className='text-xs text-gray-500'>Ready for payout</p>
              </div>
              <div className='w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200'>
                <span className='text-xl text-white'>{Icons.balance}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'>
          <div className={`h-2 ${GRADIENT_CARDS.rating}`}></div>
          <CardContent className='p-8 bg-gradient-to-br from-white to-amber-50'>
            <div className='flex items-center justify-between'>
              <div className='space-y-2'>
                <p className='text-sm font-semibold text-amber-600 uppercase tracking-wide'>
                  Average Rating
                </p>
                <div className='flex items-center space-x-2'>
                  <p className='text-3xl font-bold text-gray-800'>
                    {basic.averageRating}
                  </p>
                  <div className='flex space-x-0.5'>
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < Math.floor(Number(basic.averageRating))
                            ? 'text-amber-500'
                            : 'text-gray-300'
                        }`}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                <p className='text-xs text-gray-500'>Customer satisfaction</p>
              </div>
              <div className='w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200'>
                <span className='text-xl text-white'>{Icons.rating}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Grid */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
        {/* Sales Trend Chart */}
        <Card className='border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300'>
          <CardHeader className='pb-4 border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center'>
                  <span className='text-white text-sm'>{Icons.trending}</span>
                </div>
                <div>
                  <CardTitle className='text-xl font-bold text-gray-800'>
                    Sales Trend
                  </CardTitle>
                  <p className='text-sm text-gray-500'>
                    Last 30 days performance
                  </p>
                </div>
              </div>
              <Badge
                variant='secondary'
                className='bg-blue-100 text-blue-700 px-3 py-1'>
                {salesTrendData.length} days
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='p-6'>
            {salesTrendData.length > 0 ? (
              <ResponsiveContainer width='100%' height={320}>
                <LineChart
                  data={salesTrendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient
                      id='salesGradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'>
                      <stop offset='5%' stopColor='#6366f1' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#6366f1' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                  <XAxis
                    dataKey='date'
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      padding: '12px',
                    }}
                    formatter={(value, name) => [
                      name === 'sales' ? `₹${value}` : value,
                      name === 'sales' ? 'Sales' : 'Orders',
                    ]}
                  />
                  <Line
                    type='monotone'
                    dataKey='sales'
                    stroke='#6366f1'
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }}
                    activeDot={{
                      r: 7,
                      stroke: '#6366f1',
                      strokeWidth: 2,
                      fill: 'white',
                    }}
                    fill='url(#salesGradient)'
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className='flex items-center justify-center h-80 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200'>
                <div className='text-center space-y-3'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto'>
                    <span className='text-2xl text-gray-400'>
                      {Icons.trending}
                    </span>
                  </div>
                  <p className='text-lg font-semibold text-gray-600'>
                    No Sales Data
                  </p>
                  <p className='text-sm text-gray-500 max-w-xs'>
                    Sales trends will appear here once orders are placed
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className='border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300'>
          <CardHeader className='pb-4 border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center'>
                  <span className='text-white text-sm'>{Icons.orders}</span>
                </div>
                <div>
                  <CardTitle className='text-xl font-bold text-gray-800'>
                    Order Status
                  </CardTitle>
                  <p className='text-sm text-gray-500'>
                    Distribution breakdown
                  </p>
                </div>
              </div>
              <Badge
                variant='secondary'
                className='bg-emerald-100 text-emerald-700 px-3 py-1'>
                {statusData.reduce((sum, item) => sum + item.value, 0)} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='p-6'>
            {statusData.length > 0 &&
            statusData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width='100%' height={320}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill='#8884d8'
                    dataKey='value'
                    stroke='white'
                    strokeWidth={3}>
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      padding: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType='circle'
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='flex items-center justify-center h-80 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200'>
                <div className='text-center space-y-3'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto'>
                    <span className='text-2xl text-gray-400'>
                      {Icons.orders}
                    </span>
                  </div>
                  <p className='text-lg font-semibold text-gray-600'>
                    No Order Data
                  </p>
                  <p className='text-sm text-gray-500 max-w-xs'>
                    Order status distribution will appear here
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hourly Order Distribution */}
        <Card className='border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300'>
          <CardHeader className='pb-4 border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center'>
                  <span className='text-white text-sm'>{Icons.time}</span>
                </div>
                <div>
                  <CardTitle className='text-xl font-bold text-gray-800'>
                    Hourly Orders
                  </CardTitle>
                  <p className='text-sm text-gray-500'>Peak hours analysis</p>
                </div>
              </div>
              <Badge
                variant='secondary'
                className='bg-purple-100 text-purple-700 px-3 py-1'>
                Avg: {orders.averageCompletionTimeMinutes} min
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='p-6'>
            <ResponsiveContainer width='100%' height={320}>
              <BarChart
                data={hourlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient
                    id='hourlyGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'>
                    <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                <XAxis
                  dataKey='hour'
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    padding: '12px',
                  }}
                />
                <Bar
                  dataKey='orders'
                  fill='url(#hourlyGradient)'
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Day-wise Distribution */}
        <Card className='border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300'>
          <CardHeader className='pb-4 border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center'>
                  <span className='text-white text-sm'>{Icons.calendar}</span>
                </div>
                <div>
                  <CardTitle className='text-xl font-bold text-gray-800'>
                    Weekly Pattern
                  </CardTitle>
                  <p className='text-sm text-gray-500'>Orders by day of week</p>
                </div>
              </div>
              <Badge
                variant='secondary'
                className='bg-amber-100 text-amber-700 px-3 py-1'>
                {operating.operatingHours.opening} -{' '}
                {operating.operatingHours.closing}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='p-6'>
            {dayData.length > 0 ? (
              <ResponsiveContainer width='100%' height={320}>
                <BarChart
                  data={dayData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient
                      id='weeklyGradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'>
                      <stop offset='5%' stopColor='#f59e0b' stopOpacity={0.8} />
                      <stop
                        offset='95%'
                        stopColor='#f59e0b'
                        stopOpacity={0.3}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                  <XAxis
                    dataKey='day'
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      padding: '12px',
                    }}
                  />
                  <Bar
                    dataKey='orders'
                    fill='url(#weeklyGradient)'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className='flex items-center justify-center h-80 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200'>
                <div className='text-center space-y-3'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto'>
                    <span className='text-2xl text-gray-400'>
                      {Icons.calendar}
                    </span>
                  </div>
                  <p className='text-lg font-semibold text-gray-600'>
                    No Weekly Data
                  </p>
                  <p className='text-sm text-gray-500 max-w-xs'>
                    Weekly patterns will appear here
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Top Performing Items */}
      <Card className='border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300'>
        <CardHeader className='pb-6 border-b border-gray-100'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center'>
                <span className='text-white text-lg'>{Icons.items}</span>
              </div>
              <div>
                <CardTitle className='text-2xl font-bold text-gray-800'>
                  Top Performing Items
                </CardTitle>
                <p className='text-sm text-gray-500'>Best selling menu items</p>
              </div>
            </div>
            <Badge
              variant='secondary'
              className='bg-emerald-100 text-emerald-700 px-4 py-2 text-sm'>
              {items.allItems.length} total items
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            {items.top5Items.length > 0 ? (
              items.top5Items.map((item, index) => (
                <div
                  key={item.itemId}
                  className='group flex items-center justify-between p-6 bg-gradient-to-r from-white to-gray-50 border border-gray-100 rounded-xl hover:shadow-lg hover:border-gray-200 transition-all duration-300'>
                  <div className='flex items-center space-x-4'>
                    <div className='relative'>
                      <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200'>
                        <span className='text-lg font-bold text-white'>
                          #{index + 1}
                        </span>
                      </div>
                      {index === 0 && (
                        <div className='absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center'>
                          <span className='text-xs text-white'>👑</span>
                        </div>
                      )}
                    </div>
                    <div className='space-y-1'>
                      <h4 className='text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors'>
                        {item.name}
                      </h4>
                      <div className='flex items-center space-x-4 text-sm text-gray-600'>
                        <span className='flex items-center space-x-1'>
                          <span>📦</span>
                          <span>{item.totalQuantity} units sold</span>
                        </span>
                        <span className='flex items-center space-x-1'>
                          <span>📊</span>
                          <span>{item.salesPercentage}% of total sales</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='text-right space-y-1'>
                    <p className='text-2xl font-bold text-gray-800'>
                      ₹{item.totalRevenue.toFixed(2)}
                    </p>
                    <p className='text-sm text-gray-500 font-medium'>Revenue</p>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200'>
                <div className='space-y-4'>
                  <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto'>
                    <span className='text-3xl text-gray-400'>
                      {Icons.items}
                    </span>
                  </div>
                  <div>
                    <p className='text-xl font-bold text-gray-600'>
                      No Sales Data Available
                    </p>
                    <p className='text-sm text-gray-500 mt-2 max-w-md mx-auto'>
                      Item performance will appear here once customers start
                      ordering from your menu
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Additional Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'>
          <div className='h-2 bg-gradient-to-r from-indigo-500 to-purple-600'></div>
          <CardContent className='p-8 text-center bg-gradient-to-br from-white to-indigo-50'>
            <div className='w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200'>
              <span className='text-2xl text-white'>{Icons.items}</span>
            </div>
            <p className='text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2'>
              Active Menu Items
            </p>
            <p className='text-3xl font-bold text-gray-800 mb-1'>
              {basic.activeItems}
            </p>
            <p className='text-xs text-gray-500'>Currently available</p>
          </CardContent>
        </Card>

        <Card className='group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'>
          <div className='h-2 bg-gradient-to-r from-red-500 to-pink-600'></div>
          <CardContent className='p-8 text-center bg-gradient-to-br from-white to-red-50'>
            <div className='w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200'>
              <span className='text-2xl text-white'>{Icons.payouts}</span>
            </div>
            <p className='text-sm font-semibold text-red-600 uppercase tracking-wide mb-2'>
              Total Payouts
            </p>
            <p className='text-3xl font-bold text-gray-800 mb-1'>
              ₹{basic.totalPayouts.toLocaleString()}
            </p>
            <p className='text-xs text-gray-500'>Lifetime withdrawals</p>
          </CardContent>
        </Card>

        <Card className='group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'>
          <div className='h-2 bg-gradient-to-r from-yellow-500 to-amber-600'></div>
          <CardContent className='p-8 text-center bg-gradient-to-br from-white to-yellow-50'>
            <div className='w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200'>
              <span className='text-2xl text-white'>{Icons.calendar}</span>
            </div>
            <p className='text-sm font-semibold text-yellow-600 uppercase tracking-wide mb-2'>
              Operating Days
            </p>
            <p className='text-lg font-bold text-gray-800 mb-1 leading-tight'>
              {operating.operatingDays.join(', ')}
            </p>
            <p className='text-xs text-gray-500'>Weekly schedule</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
