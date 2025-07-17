import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/types';

interface AnalyticsTabProps {
  orders: Order[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ orders }) => {
  // Calculate order status distribution
  const statusData = [
    {
      name: 'Completed',
      value: orders.filter((o) => o.status === 'completed').length,
    },
    {
      name: 'Preparing',
      value: orders.filter((o) => o.status === 'preparing').length,
    },
    {
      name: 'Placed',
      value: orders.filter((o) => o.status === 'placed').length,
    },
    {
      name: 'Cancelled',
      value: orders.filter((o) => o.status === 'cancelled').length,
    },
  ];

  // Calculate popular items from actual orders
  const itemStats = new Map<string, { orders: number; revenue: number }>();

  orders.forEach((order) => {
    order.items.forEach((orderItem) => {
      const itemName = orderItem.item.name;
      const quantity = orderItem.quantity;
      const price = orderItem.item.price;
      const revenue = quantity * price;

      if (itemStats.has(itemName)) {
        const existing = itemStats.get(itemName)!;
        existing.orders += quantity;
        existing.revenue += revenue;
      } else {
        itemStats.set(itemName, { orders: quantity, revenue });
      }
    });
  });

  const popularItems = Array.from(itemStats.entries())
    .map(([name, stats]) => ({
      name,
      orders: stats.orders,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  return (
    <div className='space-y-10'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800 mb-1'>Analytics</h1>
        <p className='text-gray-600'>
          Detailed insights about your business performance
        </p>
      </div>
      <Separator className='mb-6 bg-gray-200' />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='bg-blue-50 border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105'>
          <CardHeader>
            <CardTitle className='text-gray-800'>
              Revenue Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center h-[300px] text-gray-500'>
              <div className='text-center'>
                <p className='text-lg font-medium'>No Revenue Data</p>
                <p className='text-sm'>
                  Revenue trends will appear here once orders are placed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-blue-50 border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105'>
          <CardHeader>
            <CardTitle className='text-gray-800'>
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'>
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className='bg-blue-50 border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105'>
        <CardHeader>
          <CardTitle className='text-gray-800'>Top Performing Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {popularItems.length > 0 ? (
              popularItems.map((item, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                      <span className='text-sm font-semibold text-blue-600'>
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800'>
                        {item.name}
                      </h4>
                      <p className='text-sm text-gray-600'>
                        {item.orders} orders
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-gray-800'>
                      ₹{item.revenue.toFixed(2)}
                    </p>
                    <p className='text-sm text-gray-600'>Revenue</p>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-8 text-gray-500'>
                <p>No order data available yet</p>
                <p className='text-sm'>
                  Orders will appear here once customers start ordering
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
