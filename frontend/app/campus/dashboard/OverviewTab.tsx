import React from 'react';
import { ShoppingCart, DollarSign, Menu, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { StatsCard } from './StatsCard';
import { CanteenStats } from '@/services/canteenOrderService';
import { MenuItem } from '@/services/menuService';

interface OverviewTabProps {
  canteenStats: CanteenStats | null;
  menuItems: MenuItem[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  canteenStats,
  menuItems,
}) => {
  return (
    <div className='space-y-10'>
      <div className='mb-6'>
        <h2 className='text-3xl font-bold text-blue-900 mb-2'>
          Campus Vendor Partner
        </h2>
        <Separator className='mb-4 bg-gray-200' />
        <h1 className='text-2xl font-bold text-gray-800 mb-1'>
          Dashboard Overview
        </h1>
        <p className='text-gray-600'>
          Welcome back! Here's what's happening with your canteen today.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-full'>
        <StatsCard
          title='Total Orders'
          value={canteenStats?.totalOrders ?? 0}
          description='All time orders'
          icon={ShoppingCart}
          className='max-w-full w-full'
        />

        <StatsCard
          title='Revenue'
          value={`₹${canteenStats?.totalRevenue ?? 0}`}
          description='Total revenue'
          icon={DollarSign}
          className='max-w-full w-full'
        />

        <StatsCard
          title='Menu Items'
          value={menuItems.length}
          description='Active items'
          icon={Menu}
          className='max-w-full w-full'
        />

        <StatsCard
          title='Pending Orders'
          value={canteenStats?.pendingOrders ?? 0}
          description='Need attention'
          icon={Clock}
          className='max-w-full w-full'
        />
      </div>
    </div>
  );
};
