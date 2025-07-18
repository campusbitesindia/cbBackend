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

// Mock interfaces (would normally come from backend)
interface PayoutHistory {
  _id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  processedAt?: string;
  transactionId?: string;
  remarks?: string;
}

interface PayoutBalance {
  availableBalance: number;
  pendingAmount: number;
  totalEarnings: number;
  lastUpdated: string;
}

interface PayoutsTabProps {
  canteenStats: any;
  orders: any[];
  onRefresh: () => void;
  canteenId: string | null;
}

// Mock data for demonstration
const mockPayoutBalance: PayoutBalance = {
  availableBalance: 2850,
  pendingAmount: 450,
  totalEarnings: 15670,
  lastUpdated: new Date().toISOString(),
};

const mockPayoutHistory: PayoutHistory[] = [
  {
    _id: '64f1a2b3c4d5e6f7g8h9i0j1',
    amount: 1200,
    status: 'completed',
    requestedAt: '2024-01-15T10:30:00Z',
    processedAt: '2024-01-16T14:22:00Z',
    transactionId: 'TXN_123456789',
    remarks: 'Regular payout request',
  },
  {
    _id: '64f1a2b3c4d5e6f7g8h9i0j2',
    amount: 800,
    status: 'processing',
    requestedAt: '2024-01-20T09:15:00Z',
    remarks: 'Weekly payout',
  },
  {
    _id: '64f1a2b3c4d5e6f7g8h9i0j3',
    amount: 950,
    status: 'completed',
    requestedAt: '2024-01-10T16:45:00Z',
    processedAt: '2024-01-11T11:30:00Z',
    transactionId: 'TXN_987654321',
  },
  {
    _id: '64f1a2b3c4d5e6f7g8h9i0j4',
    amount: 500,
    status: 'failed',
    requestedAt: '2024-01-08T14:20:00Z',
    remarks: 'Bank account verification failed',
  },
];

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
  const [payoutHistory, setPayoutHistory] =
    useState<PayoutHistory[]>(mockPayoutHistory);
  const [payoutBalance, setPayoutBalance] =
    useState<PayoutBalance>(mockPayoutBalance);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Mock API calls (would be real API calls when backend is ready)
  const fetchPayoutData = async () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setPayoutHistory(mockPayoutHistory);
      setPayoutBalance(mockPayoutBalance);
      setLoading(false);
    }, 1000);
  };

  const handlePayoutRequest = async () => {
    if (payoutBalance.availableBalance < 500) {
      toast({
        title: 'Insufficient Balance',
        description: 'Minimum payout amount is ₹500',
        variant: 'destructive',
      });
      return;
    }

    setRequesting(true);

    // Simulate API request
    setTimeout(() => {
      const newPayout: PayoutHistory = {
        _id: `mock_${Date.now()}`,
        amount: payoutBalance.availableBalance,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        remarks: 'Regular payout request',
      };

      setPayoutHistory([newPayout, ...payoutHistory]);
      setPayoutBalance({
        ...payoutBalance,
        availableBalance: 0,
        pendingAmount:
          payoutBalance.pendingAmount + payoutBalance.availableBalance,
      });

      setRequesting(false);

      toast({
        title: 'Payout Request Submitted',
        description:
          'Your payout request has been submitted successfully! (Demo mode)',
      });
    }, 2000);
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

      {/* Demo Notice */}
      <Card className='bg-amber-50 border-amber-200'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-amber-800'>
            <Eye className='w-5 h-5' />
            Demo Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-amber-700 text-sm'>
            This is a demo interface with mock data. Backend endpoints are not
            yet implemented. All data shown is for demonstration purposes only.
          </p>
        </CardContent>
      </Card>

      {/* Payout Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <StatsCard
          title='Total Earnings'
          value={`₹${payoutBalance.totalEarnings.toLocaleString()}`}
          description='All time earnings'
          icon={TrendingUp}
          className='bg-gradient-to-r from-green-50 to-green-100 border-green-200'
          iconColor='text-green-600'
        />

        <StatsCard
          title='Available Balance'
          value={`₹${payoutBalance.availableBalance.toLocaleString()}`}
          description='Ready for payout'
          icon={DollarSign}
          className='bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
          iconColor='text-blue-600'
        />

        <StatsCard
          title='Pending Payouts'
          value={`₹${payoutBalance.pendingAmount.toLocaleString()}`}
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
            requesting || loading || payoutBalance.availableBalance < 500
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
                                payout.requestedAt
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
                        ₹{payout.amount.toLocaleString()}
                      </p>
                      <p
                        className={`text-sm text-${statusColor}-600 capitalize`}>
                        {payout.status}
                      </p>
                      {payout.remarks && payout.status === 'failed' && (
                        <p className='text-xs text-red-500 mt-1'>
                          {payout.remarks}
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
          <div className='flex items-start space-x-2'>
            <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
            <p className='text-sm'>Processing time: 2-3 business days</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
