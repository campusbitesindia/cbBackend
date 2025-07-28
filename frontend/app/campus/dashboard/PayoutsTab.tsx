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
  ArrowUpRight,
  Calendar,
  CreditCard,
  Banknote,
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
import { Badge } from '@/components/ui/badge';
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
  gradient,
  iconBg,
}: {
  title: string;
  value: string;
  description: string;
  icon: any;
  className?: string;
  gradient?: string;
  iconBg?: string;
}) => (
  <Card
    className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
      className || ''
    }`}>
    <div
      className={`absolute inset-0 ${
        gradient || 'bg-gradient-to-br from-slate-50 to-slate-100'
      }`}
    />
    <CardContent className='relative p-6'>
      <div className='flex items-start justify-between'>
        <div className='space-y-2'>
          <p className='text-sm font-medium text-slate-600 uppercase tracking-wide'>
            {title}
          </p>
          <p className='text-3xl font-bold text-slate-900 tracking-tight'>
            {value}
          </p>
          <p className='text-sm text-slate-500 flex items-center gap-1'>
            <TrendingUp className='w-3 h-3' />
            {description}
          </p>
        </div>
        <div
          className={`p-3 rounded-xl ${
            iconBg || 'bg-white/80'
          } shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className='w-6 h-6 text-slate-700' />
        </div>
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className='bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100'>
            Completed
          </Badge>
        );
      case 'processing':
        return (
          <Badge className='bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100'>
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge className='bg-red-100 text-red-800 border-red-200 hover:bg-red-100'>
            Failed
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className='bg-red-100 text-red-800 border-red-200 hover:bg-red-100'>
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className='bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100'>
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      <div className='space-y-8 p-6'>
        {/* Header Section */}
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg'>
              <Banknote className='w-6 h-6 text-white' />
            </div>
            <div>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent'>
                Payouts & Earnings
              </h1>
              <p className='text-slate-600 text-lg'>
                Track your earnings and manage payout requests with ease
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <StatsCard
            title='Total Earnings'
            value={`₹${payoutBalance.balance.totalEarnings.toLocaleString()}`}
            description='All time revenue'
            icon={TrendingUp}
            gradient='bg-gradient-to-br from-emerald-50 to-teal-100'
            iconBg='bg-emerald-100'
          />

          <StatsCard
            title='Available Balance'
            value={`₹${payoutBalance.balance.availableBalance.toLocaleString()}`}
            description='Ready for withdrawal'
            icon={DollarSign}
            gradient='bg-gradient-to-br from-blue-50 to-indigo-100'
            iconBg='bg-blue-100'
          />

          <StatsCard
            title='Pending Payouts'
            value={`₹${payoutBalance.balance.pendingPayouts.toLocaleString()}`}
            description='Currently processing'
            icon={Clock}
            gradient='bg-gradient-to-br from-amber-50 to-orange-100'
            iconBg='bg-amber-100'
          />
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <Button
            className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 h-12 px-8 text-lg font-medium'
            onClick={handlePayoutRequest}
            disabled={
              requesting ||
              loading ||
              payoutBalance.balance.availableBalance < 100
            }>
            <DollarSign className='w-5 h-5 mr-2' />
            {requesting ? 'Processing Request...' : 'Request Payout'}
            <ArrowUpRight className='w-4 h-4 ml-2' />
          </Button>

          <Button
            variant='outline'
            onClick={handleRefresh}
            className='border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 h-12 px-6'
            disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh Data
          </Button>
        </div>

        {/* Payout History */}
        <Card className='border-0 shadow-xl bg-white/80 backdrop-blur-sm'>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <CardTitle className='text-2xl font-bold text-slate-900 flex items-center gap-2'>
                  <CreditCard className='w-6 h-6 text-slate-700' />
                  Transaction History
                </CardTitle>
                <CardDescription className='text-slate-600 text-base'>
                  Complete record of your payout transactions
                </CardDescription>
              </div>
              <div className='flex items-center gap-2 text-sm text-slate-500'>
                <Calendar className='w-4 h-4' />
                Updated {new Date().toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-2'>
            {loading ? (
              <div className='space-y-4'>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between p-6 bg-slate-50 rounded-xl animate-pulse'>
                    <div className='flex items-center space-x-4'>
                      <div className='w-12 h-12 bg-slate-200 rounded-full'></div>
                      <div className='space-y-2'>
                        <div className='h-4 bg-slate-200 rounded w-32'></div>
                        <div className='h-3 bg-slate-200 rounded w-24'></div>
                      </div>
                    </div>
                    <div className='text-right space-y-2'>
                      <div className='h-4 bg-slate-200 rounded w-20'></div>
                      <div className='h-3 bg-slate-200 rounded w-16'></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : payoutHistory.length > 0 ? (
              <div className='space-y-3'>
                {payoutHistory.map((payout) => {
                  const StatusIcon = getStatusIcon(payout.status);

                  return (
                    <div
                      key={payout._id}
                      className='group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-xl hover:shadow-md hover:border-slate-200 transition-all duration-300'>
                      <div className='flex items-center space-x-4'>
                        <div className='relative'>
                          <div className='w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors duration-300'>
                            <StatusIcon className='w-6 h-6 text-slate-600' />
                          </div>
                          {payout.status === 'completed' && (
                            <div className='absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center'>
                              <CheckCircle className='w-3 h-3 text-white' />
                            </div>
                          )}
                        </div>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-3'>
                            <h4 className='font-semibold text-slate-900 text-lg'>
                              Payout #{payout._id.slice(-6).toUpperCase()}
                            </h4>
                            {getStatusBadge(payout.status)}
                          </div>
                          <p className='text-slate-600 flex items-center gap-2'>
                            <Calendar className='w-4 h-4' />
                            {payout.status === 'completed' && payout.processedAt
                              ? `Completed ${new Date(
                                  payout.processedAt
                                ).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}`
                              : `Requested ${new Date(
                                  payout.createdAt
                                ).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}`}
                          </p>
                          {payout.transactionId && (
                            <p className='text-xs text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded'>
                              TXN: {payout.transactionId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className='text-right space-y-1'>
                        <p className='text-2xl font-bold text-slate-900'>
                          ₹{payout.requestedAmount.toLocaleString()}
                        </p>
                        {payout.requestNotes && payout.status === 'failed' && (
                          <p className='text-sm text-red-600 bg-red-50 px-2 py-1 rounded max-w-xs'>
                            {payout.requestNotes}
                          </p>
                        )}
                        {payout.rejectionReason &&
                          payout.status === 'rejected' && (
                            <p className='text-sm text-red-600 bg-red-50 px-2 py-1 rounded max-w-xs'>
                              {payout.rejectionReason}
                            </p>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='text-center py-16'>
                <div className='w-24 h-24 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6'>
                  <DollarSign className='w-12 h-12 text-slate-400' />
                </div>
                <h3 className='text-xl font-semibold text-slate-900 mb-2'>
                  No transaction history
                </h3>
                <p className='text-slate-600 max-w-md mx-auto'>
                  Your payout transactions will appear here once you start
                  requesting withdrawals from your available balance.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Panel */}
        <Card className='border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'>
          <CardHeader>
            <CardTitle className='text-slate-900 flex items-center gap-2 text-xl'>
              <Bell className='w-6 h-6 text-blue-600' />
              Payout Information & Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                  <div>
                    <p className='font-medium text-slate-900'>
                      Processing Schedule
                    </p>
                    <p className='text-sm text-slate-600'>
                      Payouts processed every Monday and Thursday
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                  <div>
                    <p className='font-medium text-slate-900'>Minimum Amount</p>
                    <p className='text-sm text-slate-600'>
                      ₹100 minimum payout requirement
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                  <div>
                    <p className='font-medium text-slate-900'>Platform Fee</p>
                    <p className='text-sm text-slate-600'>
                      5% deducted from total earnings
                    </p>
                  </div>
                </div>
              </div>
              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                  <div>
                    <p className='font-medium text-slate-900'>Payment Method</p>
                    <p className='text-sm text-slate-600'>
                      Direct transfer to registered bank account
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                  <div>
                    <p className='font-medium text-slate-900'>
                      Processing Time
                    </p>
                    <p className='text-sm text-slate-600'>
                      2-3 business days for completion
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                  <div>
                    <p className='font-medium text-slate-900'>Support</p>
                    <p className='text-sm text-slate-600'>
                      24/7 assistance for payout queries
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
