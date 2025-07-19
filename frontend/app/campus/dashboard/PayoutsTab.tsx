import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Clock,
  RefreshCw,
  CheckCircle,
  Bell,
  AlertCircle,
  XCircle,
  Eye,
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
import { useToast } from '@/hooks/use-toast';
import {
  payoutService,
  PayoutBalance,
  PayoutRequest,
} from '@/services/payoutService';

// Using real interfaces from payoutService

interface PayoutsTabProps {
  canteenStats: any;
  orders: any[];
  onRefresh: () => void;
  canteenId: string | null;
}

// Initial state for payout data
const initialPayoutBalance: PayoutBalance = {
  canteen: { id: '', name: '' },
  balance: {
    totalEarnings: 0,
    totalPayouts: 0,
    platformFee: 0,
    availableBalance: 0,
    pendingPayouts: 0,
  },
  statistics: {
    totalOrders: 0,
    completedPayouts: 0,
    pendingPayoutRequests: 0,
  },
  pendingRequests: [],
};

const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  className,
  iconColor,
}: {
  title: string;
  value: string;
  description: string;
  icon: any;
  className?: string;
  iconColor?: string;
}) => (
  <Card
    className={`transition-transform duration-200 hover:shadow-lg hover:scale-105 ${
      className || ''
    }`}>
    <CardContent className='p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-2xl font-bold text-gray-900'>{value}</p>
          <p className='text-xs text-gray-500 mt-1'>{description}</p>
        </div>
        <Icon className={`w-8 h-8 ${iconColor || 'text-gray-600'}`} />
      </div>
    </CardContent>
  </Card>
);

export const PayoutsTab: React.FC<PayoutsTabProps> = ({
  canteenStats,
  orders,
  onRefresh,
  canteenId,
}) => {
  const { toast } = useToast();
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([]);
  const [payoutBalance, setPayoutBalance] =
    useState<PayoutBalance>(initialPayoutBalance);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Real API calls
  const fetchPayoutData = async () => {
    setLoading(true);
    try {
      const [balanceResponse, historyResponse] = await Promise.all([
        payoutService.getBalance(),
        payoutService.getPayoutHistory(),
      ]);

      setPayoutBalance(balanceResponse.data);
      setPayoutHistory(historyResponse.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch payout data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutRequest = async () => {
    if (payoutBalance.balance.availableBalance < 100) {
      toast({
        title: 'Insufficient Balance',
        description: 'Minimum payout amount is ₹100',
        variant: 'destructive',
      });
      return;
    }

    setRequesting(true);

    try {
      const response = await payoutService.requestPayout(
        payoutBalance.balance.availableBalance,
        'Regular payout request'
      );

      toast({
        title: 'Payout Request Submitted',
        description: response.message,
      });

      // Refresh data after successful request
      await fetchPayoutData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit payout request',
        variant: 'destructive',
      });
    } finally {
      setRequesting(false);
    }
  };

  const handleRefresh = async () => {
    await fetchPayoutData();
    onRefresh();
  };

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'processing':
        return Clock;
      case 'failed':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'processing':
        return 'orange';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

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

      {/* Live API Notice */}
      <Card className='bg-green-50 border-green-200'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-green-800'>
            <CheckCircle className='w-5 h-5' />
            Live API Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-green-700 text-sm'>
            Connected to real backend API. All data is live from your canteen's
            actual earnings and payout requests.
          </p>
        </CardContent>
      </Card>

      {/* Payout Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <StatsCard
          title='Total Earnings'
          value={`₹${payoutBalance.balance.totalEarnings.toLocaleString()}`}
          description='All time earnings'
          icon={TrendingUp}
          className='bg-gradient-to-r from-green-50 to-green-100 border-green-200'
          iconColor='text-green-600'
        />

        <StatsCard
          title='Available Balance'
          value={`₹${payoutBalance.balance.availableBalance.toLocaleString()}`}
          description='Ready for payout'
          icon={DollarSign}
          className='bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
          iconColor='text-blue-600'
        />

        <StatsCard
          title='Pending Payouts'
          value={`₹${payoutBalance.balance.pendingPayouts.toLocaleString()}`}
          description='Processing'
          icon={Clock}
          className='bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
          iconColor='text-orange-600'
        />
      </div>

      {/* Quick Actions */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <Button
          className='bg-green-600 hover:bg-green-700 text-white flex items-center'
          onClick={handlePayoutRequest}
          disabled={
            requesting ||
            loading ||
            payoutBalance.balance.availableBalance < 100
          }>
          <DollarSign className='w-4 h-4 mr-2' />
          {requesting ? 'Processing...' : 'Request Payout'}
        </Button>
        <Button
          variant='outline'
          onClick={handleRefresh}
          className='border-gray-300 text-gray-700 hover:bg-gray-50'
          disabled={loading}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
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
          {loading ? (
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='flex items-center justify-between p-4 border border-gray-100 rounded-lg animate-pulse'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
                    <div>
                      <div className='h-4 bg-gray-200 rounded w-24 mb-2'></div>
                      <div className='h-3 bg-gray-200 rounded w-32'></div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='h-4 bg-gray-200 rounded w-16 mb-2'></div>
                    <div className='h-3 bg-gray-200 rounded w-20'></div>
                  </div>
                </div>
              ))}
            </div>
          ) : payoutHistory.length > 0 ? (
            <div className='space-y-4'>
              {payoutHistory.map((payout) => {
                const StatusIcon = getStatusIcon(payout.status);
                const statusColor = getStatusColor(payout.status);

                return (
                  <div
                    key={payout._id}
                    className='flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors'>
                    <div className='flex items-center space-x-4'>
                      <div
                        className={`w-10 h-10 bg-${statusColor}-100 rounded-full flex items-center justify-center`}>
                        <StatusIcon
                          className={`w-5 h-5 text-${statusColor}-600`}
                        />
                      </div>
                      <div>
                        <h4 className='font-semibold text-gray-800'>
                          Payout #{payout._id.slice(-4)}
                        </h4>
                        <p className='text-sm text-gray-600'>
                          {payout.status === 'completed' && payout.processedAt
                            ? `Completed on ${new Date(
                                payout.processedAt
                              ).toLocaleDateString()}`
                            : `Requested on ${new Date(
                                payout.createdAt
                              ).toLocaleDateString()}`}
                        </p>
                        {payout.transactionId && (
                          <p className='text-xs text-gray-500'>
                            ID: {payout.transactionId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold text-gray-800'>
                        ₹{payout.requestedAmount.toLocaleString()}
                      </p>
                      <p
                        className={`text-sm text-${statusColor}-600 capitalize`}>
                        {payout.status}
                      </p>
                      {payout.requestNotes && payout.status === 'failed' && (
                        <p className='text-xs text-red-500 mt-1'>
                          {payout.requestNotes}
                        </p>
                      )}
                      {payout.rejectionReason &&
                        payout.status === 'rejected' && (
                          <p className='text-xs text-red-500 mt-1'>
                            {payout.rejectionReason}
                          </p>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <DollarSign className='w-12 h-12 mx-auto mb-4 text-gray-300' />
              <p className='text-lg font-medium'>No payouts yet</p>
              <p className='text-sm'>
                Your payout history will appear here once you start requesting
                payouts
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
            <p className='text-sm'>Minimum payout amount is ₹100</p>
          </div>
          <div className='flex items-start space-x-2'>
            <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
            <p className='text-sm'>
              Platform fee of 5% is deducted from earnings
            </p>
          </div>
          <div className='flex items-start space-x-2'>
            <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
            <p className='text-sm'>
              Payments are made to your registered bank account
            </p>
          </div>
          <div className='flex items-start space-x-2'>
            <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
            <p className='text-sm'>Processing time: 2-3 business days</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
