import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Clock,
  RefreshCw,
  CheckCircle,
  Bell,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatsCard } from './StatsCard';
import { CanteenStats } from '@/services/canteenOrderService';
import { Order } from '@/types';

interface PayoutsTabProps {
  canteenStats: CanteenStats | null;
  orders: Order[];
  onRefresh: () => void;
  canteenId: string | null;
}

export const PayoutsTab: React.FC<PayoutsTabProps> = ({
  canteenStats,
  orders,
  onRefresh,
  canteenId,
}) => {
  return (
    <div className='space-y-10'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800 mb-1'>
          Payouts & Earnings
        </h1>
        <p className='text-gray-600'>
          Track your earnings and manage payout requests
        </p>
      </div>
      <Separator className='mb-6 bg-gray-200' />

      {/* Payout Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <StatsCard
          title='Total Earnings'
          value={`₹${canteenStats?.totalRevenue || 0}`}
          description='All time earnings'
          icon={TrendingUp}
          className='bg-gradient-to-r from-green-50 to-green-100 border-green-200'
          iconColor='text-green-600'
        />

        <StatsCard
          title='Available Balance'
          value={`₹${((canteenStats?.totalRevenue || 0) * 0.85).toFixed(0)}`}
          description='Ready for payout'
          icon={DollarSign}
          className='bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
          iconColor='text-blue-600'
        />

        <StatsCard
          title='Pending Payouts'
          value='₹0'
          description='Processing'
          icon={Clock}
          className='bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
          iconColor='text-orange-600'
        />
      </div>

      {/* Quick Actions */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <Button className='bg-green-600 hover:bg-green-700 text-white flex items-center'>
          <DollarSign className='w-4 h-4 mr-2' />
          Request Payout
        </Button>
        <Button
          variant='outline'
          onClick={onRefresh}
          className='border-gray-300 text-gray-700 hover:bg-gray-50'
          disabled={!canteenId}>
          <RefreshCw className='w-4 h-4 mr-2' />
          Refresh Balance
        </Button>
      </div>

      {/* Payout History */}
      <Card className='bg-white border border-gray-200 shadow-md'>
        <CardHeader>
          <CardTitle className='text-gray-800'>Payout History</CardTitle>
          <CardDescription className='text-gray-600'>
            Your recent payout transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* Sample payout entries */}
            <div className='flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50'>
              <div className='flex items-center space-x-4'>
                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-800'>Payout #1234</h4>
                  <p className='text-sm text-gray-600'>
                    Completed on Dec 15, 2024
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-gray-800'>₹0</p>
                <p className='text-sm text-green-600'>Completed</p>
              </div>
            </div>

            <div className='flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50'>
              <div className='flex items-center space-x-4'>
                <div className='w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center'>
                  <Clock className='w-5 h-5 text-orange-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-800'>Payout #1235</h4>
                  <p className='text-sm text-gray-600'>
                    Requested on Dec 18, 2024
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-gray-800'>₹0</p>
                <p className='text-sm text-orange-600'>Processing</p>
              </div>
            </div>

            <div className='flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50'>
              <div className='flex items-center space-x-4'>
                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-800'>Payout #1233</h4>
                  <p className='text-sm text-gray-600'>
                    Completed on Dec 10, 2024
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-gray-800'>₹0</p>
                <p className='text-sm text-green-600'>Completed</p>
              </div>
            </div>
          </div>

          {/* Empty state fallback */}
          {orders.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              <DollarSign className='w-12 h-12 mx-auto mb-4 text-gray-300' />
              <p className='text-lg font-medium'>No payouts yet</p>
              <p className='text-sm'>
                Your payout history will appear here once you start receiving
                payments
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Information */}
      <Card className='bg-blue-50 border border-blue-200 shadow-md'>
        <CardHeader>
          <CardTitle className='text-blue-800 flex items-center'>
            <Bell className='w-5 h-5 mr-2' />
            Payout Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-blue-700'>
          <div className='flex items-start space-x-2'>
            <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
            <p className='text-sm'>
              Payouts are processed every Monday and Thursday
            </p>
          </div>
          <div className='flex items-start space-x-2'>
            <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
            <p className='text-sm'>Minimum payout amount is ₹500</p>
          </div>
          <div className='flex items-start space-x-2'>
            <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
            <p className='text-sm'>
              Platform fee of 15% is deducted from earnings
            </p>
          </div>
          <div className='flex items-start space-x-2'>
            <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
            <p className='text-sm'>
              Payments are made to your registered bank account
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
