import React from 'react';
import {
  ShoppingCart,
  DollarSign,
  Menu,
  Clock,
  TrendingUp,
  Users,
  Star,
} from 'lucide-react';
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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      {/* Hero Section */}
      <div className='relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white'>
        <div className='absolute inset-0 bg-black/10'></div>
        <div className='relative px-6 py-16 pb-20'>
          <div className='max-w-7xl mx-auto'>
            <div className='text-center space-y-6'>
              <div className='inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium'>
                <Star className='w-4 h-4 mr-2' />
                Campus Vendor Partner
              </div>
              <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent'>
                Dashboard Overview
              </h1>
              <p className='text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed'>
                Welcome back! Here's a comprehensive view of your canteen's
                performance and key metrics.
              </p>
            </div>
          </div>
        </div>
        {/* Decorative Wave */}
        <div className='absolute bottom-0 left-0 right-0'>
          <svg viewBox='0 0 1440 120' className='w-full h-auto'>
            <path
              fill='rgb(248 250 252)'
              d='M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z'></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className='relative -mt-8 px-6 pb-12'>
        <div className='max-w-7xl mx-auto'>
          {/* Stats Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
            {/* Total Orders Card */}
            <div className='group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5'></div>
              <div className='relative p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg'>
                    <ShoppingCart className='w-6 h-6 text-white' />
                  </div>
                  <TrendingUp className='w-5 h-5 text-green-500' />
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Orders
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {(canteenStats?.totalOrders ?? 0).toLocaleString()}
                  </p>
                  <p className='text-sm text-green-600 font-medium'>
                    All time orders
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue Card */}
            <div className='group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5'></div>
              <div className='relative p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg'>
                    <DollarSign className='w-6 h-6 text-white' />
                  </div>
                  <TrendingUp className='w-5 h-5 text-green-500' />
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Revenue
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    ₹{(canteenStats?.totalRevenue ?? 0).toLocaleString()}
                  </p>
                  <p className='text-sm text-green-600 font-medium'>
                    Lifetime earnings
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items Card */}
            <div className='group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5'></div>
              <div className='relative p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg'>
                    <Menu className='w-6 h-6 text-white' />
                  </div>
                  <Users className='w-5 h-5 text-blue-500' />
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-gray-600'>
                    Menu Items
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {menuItems.length.toLocaleString()}
                  </p>
                  <p className='text-sm text-blue-600 font-medium'>
                    Active items
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Orders Card */}
            <div className='group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5'></div>
              <div className='relative p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg'>
                    <Clock className='w-6 h-6 text-white' />
                  </div>
                  <div className='flex items-center space-x-1'>
                    <div className='w-2 h-2 bg-amber-500 rounded-full animate-pulse'></div>
                    <span className='text-xs font-medium text-amber-600'>
                      Active
                    </span>
                  </div>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-gray-600'>
                    Pending Orders
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {(canteenStats?.pendingOrders ?? 0).toLocaleString()}
                  </p>
                  <p className='text-sm text-amber-600 font-medium'>
                    Need attention
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className='bg-white rounded-2xl shadow-lg p-8'>
            <div className='text-center mb-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Quick Actions
              </h2>
              <p className='text-gray-600'>
                Manage your canteen efficiently with these shortcuts
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300 cursor-pointer'>
                <div className='flex items-center space-x-4'>
                  <div className='p-3 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors'>
                    <Menu className='w-5 h-5 text-white' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>Manage Menu</h3>
                    <p className='text-sm text-gray-600'>
                      Add or edit menu items
                    </p>
                  </div>
                </div>
              </div>

              <div className='group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-200 transition-all duration-300 cursor-pointer'>
                <div className='flex items-center space-x-4'>
                  <div className='p-3 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors'>
                    <ShoppingCart className='w-5 h-5 text-white' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>View Orders</h3>
                    <p className='text-sm text-gray-600'>
                      Process pending orders
                    </p>
                  </div>
                </div>
              </div>

              <div className='group p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-300 cursor-pointer'>
                <div className='flex items-center space-x-4'>
                  <div className='p-3 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors'>
                    <DollarSign className='w-5 h-5 text-white' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>
                      View Payouts
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Check earnings & payouts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
