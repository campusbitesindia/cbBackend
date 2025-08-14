import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Bell,
  X,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  CreditCard,
  List,
  Grid3X3,
  Activity,
  AlertCircle,
  Eye,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OrderCard } from './OrderCard';
import { Order } from '@/types';

interface OrdersTabProps {
  orders: Order[];
  onRefresh: () => void;
  onOrderClick: (orderId: string) => void;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
  canteenId: string | null;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  onRefresh,
  onOrderClick,
  onStatusUpdate,
  canteenId,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newOrderNotification, setNewOrderNotification] = useState<{
    show: boolean;
    count: number;
  }>({ show: false, count: 0 });
  const [lastOrderCount, setLastOrderCount] = useState(0);

  // Check for new orders
  useEffect(() => {
    if (orders.length > lastOrderCount && lastOrderCount > 0) {
      const newCount = orders.length - lastOrderCount;
      setNewOrderNotification({
        show: true,
        count: newCount,
      });

      const timer = setTimeout(() => {
        setNewOrderNotification({ show: false, count: 0 });
      }, 10000);

      return () => clearTimeout(timer);
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-800';
      case 'payment_pending':
        return 'bg-orange-100 text-orange-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClass = 'w-3 h-3 mr-1';
    switch (status) {
      case 'placed':
        return <div className={`${iconClass} bg-blue-500 rounded-full`}></div>;
      case 'payment_pending':
        return <div className={`${iconClass} bg-orange-500 rounded-full`}></div>;
      case 'preparing':
        return <div className={`${iconClass} bg-yellow-500 rounded-full`}></div>;
      case 'ready':
        return <div className={`${iconClass} bg-green-500 rounded-full`}></div>;
      case 'completed':
        return <div className={`${iconClass} bg-green-500 rounded-full`}></div>;
      case 'cancelled':
        return <div className={`${iconClass} bg-red-500 rounded-full`}></div>;
      default:
        return <div className={`${iconClass} bg-gray-500 rounded-full`}></div>;
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(orderId, newStatus);
    }
  };

  // Status filter configuration with icons and counts
  const statusFilters = [
    {
      value: 'all',
      label: 'All Orders',
      icon: <List className='w-4 h-4' />,
      count: orders.length,
      description: 'View all orders',
    },
    {
      value: 'placed',
      label: 'Placed',
      icon: <Clock className='w-4 h-4' />,
      count: orders.filter((order) => order.status === 'placed').length,
      description: 'New orders received',
    },
    {
      value: 'payment_pending',
      label: 'Payment Pending',
      icon: <CreditCard className='w-4 h-4' />,
      count: orders.filter((order) => order.status === 'payment_pending').length,
      description: 'Awaiting payment',
    },
    {
      value: 'preparing',
      label: 'Preparing',
      icon: <Package className='w-4 h-4' />,
      count: orders.filter((order) => order.status === 'preparing').length,
      description: 'Currently being prepared',
    },
    {
      value: 'ready',
      label: 'Ready',
      icon: <CheckCircle className='w-4 h-4' />,
      count: orders.filter((order) => order.status === 'ready').length,
      description: 'Ready for pickup',
    },
    {
      value: 'completed',
      label: 'Completed',
      icon: <CheckCircle className='w-4 h-4' />,
      count: orders.filter((order) => order.status === 'completed').length,
      description: 'Successfully delivered',
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      icon: <XCircle className='w-4 h-4' />,
      count: orders.filter((order) => order.status === 'cancelled').length,
      description: 'Cancelled orders',
    },
  ];

  const activeOrdersCount = orders.filter((order) =>
    ['placed', 'preparing', 'ready'].includes(order.status)
  ).length;

  const completedTodayCount = orders.filter((order) => {
    const today = new Date();
    const orderDate = new Date(order.createdAt);
    return (
      order.status === 'completed' &&
      orderDate.toDateString() === today.toDateString()
    );
  }).length;

  const totalRevenue = orders
    .filter((order) => order.status === 'completed')
    .reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 w-full overflow-x-hidden'>
      <div className='space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 w-full max-w-full'>
        {/* New Order Notification */}
        {newOrderNotification.show && (
          <div className='relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-emerald-200/50 animate-in slide-in-from-top-4 duration-500'>
            <div className='absolute inset-0 bg-white/10 backdrop-blur-sm'></div>
            <div className='relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0'>
              <div className='flex items-center space-x-3 sm:space-x-4 min-w-0'>
                <div className='bg-white/20 rounded-full p-2 sm:p-3 flex-shrink-0'>
                  <Bell className='w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='font-bold text-white text-base sm:text-lg break-words'>
                    🎉 New Order{newOrderNotification.count > 1 ? 's' : ''} Received!
                  </p>
                  <p className='text-emerald-100 text-sm sm:text-base'>
                    {newOrderNotification.count} new order
                    {newOrderNotification.count > 1 ? 's' : ''} need
                    {newOrderNotification.count > 1 ? '' : 's'} your immediate attention
                  </p>
                </div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setNewOrderNotification({ show: false, count: 0 })}
                className='text-white hover:bg-white/20 rounded-xl self-end sm:self-auto flex-shrink-0'>
                <X className='w-4 h-4 sm:w-5 sm:h-5' />
              </Button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className='relative overflow-hidden bg-white rounded-3xl border border-gray-200/60 shadow-xl shadow-gray-100/50'>
          <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5'></div>
          <div className='relative p-4 sm:p-6 lg:p-8'>
            <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-0'>
              <div className='space-y-2'>
                <div className='flex items-center space-x-3'>
                  <div className='bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-2 sm:p-3 shadow-lg shadow-indigo-200/50 flex-shrink-0'>
                    <Activity className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent break-words'>
                      Orders Management
                    </h1>
                    <p className='text-gray-600 text-sm sm:text-base lg:text-lg mt-1'>
                      Manage and track all orders in real-time with advanced analytics
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex items-center space-x-3 sm:space-x-4 self-start lg:self-auto'>
                <div className='bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-2 sm:p-3 border border-gray-200 flex-shrink-0'>
                  <BarChart3 className='w-5 h-5 sm:w-6 sm:h-6 text-gray-600' />
                </div>
                <Button
                  variant='outline'
                  onClick={onRefresh}
                  className='bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-200/50 rounded-xl px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all duration-300 hover:scale-105 text-sm sm:text-base'
                  disabled={!canteenId}>
                  <RefreshCw className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
                  <span className='hidden sm:inline'>Refresh Data</span>
                  <span className='sm:hidden'>Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className='bg-gradient-to-br from-white to-gray-50/30 rounded-3xl border border-gray-200/60 p-4 sm:p-6 lg:p-8 shadow-lg shadow-gray-100/50 backdrop-blur-sm'>
          <div className='flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8'>
            <div className='bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-2 sm:p-3 shadow-lg shadow-indigo-200/50 flex-shrink-0'>
              <Filter className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
            </div>
            <div className='min-w-0 flex-1'>
              <h3 className='font-bold text-gray-900 text-lg sm:text-xl'>Filter Orders</h3>
              <p className='text-xs sm:text-sm text-gray-600 mt-1'>
                Select a status to filter and manage your orders efficiently
              </p>
            </div>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4'>
            {statusFilters.map((filter, index) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`relative group p-3 sm:p-4 lg:p-5 rounded-2xl border-2 transition-all duration-500 hover:scale-105 hover:-translate-y-1 ${
                  statusFilter === filter.value
                    ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl shadow-indigo-200/40'
                    : 'border-gray-200/80 bg-white/80 backdrop-blur-sm hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}>
                {/* Active indicator */}
                {statusFilter === filter.value && (
                  <div className='absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-2 sm:border-3 border-white shadow-lg animate-pulse'></div>
                )}

                {/* Background glow effect for active state */}
                {statusFilter === filter.value && (
                  <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-2xl blur-xl scale-110 opacity-60'></div>
                )}

                {/* Icon container */}
                <div
                  className={`relative mb-3 sm:mb-4 p-2 sm:p-3 rounded-xl transition-all duration-300 ${
                    statusFilter === filter.value
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-300/50'
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                  <div
                    className={`transition-colors duration-300 ${
                      statusFilter === filter.value
                        ? 'text-white'
                        : 'text-gray-600 group-hover:text-gray-700'
                    }`}>
                    {filter.icon}
                  </div>
                </div>

                {/* Content */}
                <div className='relative text-left'>
                  <div
                    className={`font-bold text-xs sm:text-sm mb-2 transition-colors duration-300 ${
                      statusFilter === filter.value
                        ? 'text-indigo-900'
                        : 'text-gray-800 group-hover:text-gray-900'
                    }`}>
                    {filter.label}
                  </div>

                  {/* Count display */}
                  <div className='flex items-center justify-between'>
                    <div
                      className={`text-lg sm:text-2xl font-bold transition-colors duration-300 ${
                        statusFilter === filter.value
                          ? 'text-indigo-700'
                          : filter.count > 0
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}>
                      {filter.count}
                    </div>

                    {/* Status indicator */}
                    <div
                      className={`flex items-center space-x-1 ${
                        filter.count > 0 ? '' : 'opacity-50'
                      }`}>
                      <div
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                          statusFilter === filter.value
                            ? 'bg-indigo-500 shadow-md shadow-indigo-300/50'
                            : filter.count > 0
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}></div>
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    className={`text-xs mt-2 transition-colors duration-300 ${
                      statusFilter === filter.value
                        ? 'text-indigo-600'
                        : 'text-gray-500 group-hover:text-gray-600'
                    }`}>
                    {filter.description}
                  </p>
                </div>

                {/* Hover overlay */}
                <div className='absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
              </button>
            ))}
          </div>

          {/* Enhanced Filter summary */}
          <div className='mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/60'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0'>
              <div className='flex items-center space-x-3'>
                <div className='bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-2 flex-shrink-0'>
                  <Grid3X3 className='w-4 h-4 text-gray-600' />
                </div>
                <div className='min-w-0 flex-1'>
                  <span className='text-sm font-semibold text-gray-800'>
                    {statusFilter === 'all'
                      ? `Showing all ${orders.length} orders`
                      : `Showing ${
                          orders.filter((order) => order.status === statusFilter).length
                        } ${statusFilter} orders`}
                  </span>
                  {orders.length === 0 && (
                    <p className='text-xs text-gray-500 mt-1'>
                      No orders found. Orders will appear here once received.
                    </p>
                  )}
                </div>
              </div>
              {statusFilter !== 'all' && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setStatusFilter('all')}
                  className='text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 text-sm font-medium transition-all duration-300 rounded-xl px-3 sm:px-4 self-start sm:self-auto'>
                  <X className='w-4 h-4 mr-1' />
                  Clear Filter
                </Button>
              )}
            </div>

            {/* Quick stats */}
            {orders.length > 0 && (
              <div className='mt-4 grid grid-cols-3 gap-3 sm:gap-4'>
                <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-2 sm:p-3 border border-blue-200/50'>
                  <div className='text-xs text-blue-600 font-medium mb-1'>
                    Active Orders
                  </div>
                  <div className='text-base sm:text-lg font-bold text-blue-700'>
                    {orders.filter((order) =>
                      ['placed', 'preparing', 'ready'].includes(order.status)
                    ).length}
                  </div>
                </div>
                <div className='bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-2 sm:p-3 border border-green-200/50'>
                  <div className='text-xs text-green-600 font-medium mb-1'>
                    Completed Today
                  </div>
                  <div className='text-base sm:text-lg font-bold text-green-700'>
                    {orders.filter((order) => order.status === 'completed').length}
                  </div>
                </div>
                <div className='bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-2 sm:p-3 border border-orange-200/50'>
                  <div className='text-xs text-orange-600 font-medium mb-1'>
                    Total Revenue
                  </div>
                  <div className='text-base sm:text-lg font-bold text-orange-700'>
                    ₹
                    {orders
                      .filter((order) => order.status === 'completed')
                      .reduce((sum, order) => sum + (order.total || 0), 0)
                      .toFixed(0)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders Display */}
        <div className='space-y-4 sm:space-y-6 w-full'>
          {orders &&
            orders.length > 0 &&
            orders
              .filter(
                (order) => statusFilter === 'all' || order?.status === statusFilter
              )
              .map((order) => (
                <div
                  key={order?._id}
                  className='transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 w-full'>
                  <OrderCard
                    order={order || {}}
                    onOrderClick={onOrderClick}
                    onStatusUpdate={handleStatusUpdate}
                  />
                </div>
              ))}
        </div>

        {/* Recent Orders Section */}
        <div className='bg-white rounded-3xl border border-gray-200/60 p-4 sm:p-6 lg:p-8 shadow-xl shadow-gray-100/50'>
          <div className='flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6'>
            <div className='bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl p-2 sm:p-3 shadow-lg shadow-slate-200/50 flex-shrink-0'>
              <Clock className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
            </div>
            <div className='min-w-0 flex-1'>
              <h3 className='font-bold text-gray-900 text-lg sm:text-2xl'>
                Recent Activity
              </h3>
              <p className='text-gray-600 mt-1 text-sm sm:text-base'>
                Latest orders and quick actions
              </p>
            </div>
          </div>

          <div className='space-y-2 sm:space-y-3'>
            {orders && orders?.length > 0 ? (
              orders
                ?.slice()
                ?.sort(
                  (a, b) =>
                    new Date(b?.createdAt)?.getTime() -
                    new Date(a?.createdAt)?.getTime()
                )
                ?.slice(0, 5)
                ?.map((order, index) => (
                  <div
                    key={order?._id}
                    className='group bg-gradient-to-r from-gray-50 to-white rounded-2xl p-3 sm:p-4 border border-gray-200/60 hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 transition-all duration-300 cursor-pointer hover:shadow-lg transform hover:-translate-y-1'
                    onClick={() => onOrderClick(order?._id)}
                    style={{ animationDelay: `${index * 100}ms` }}>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0'>
                      <div className='flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1'>
                        <div className='bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-100 rounded-xl p-2 sm:p-3 transition-all duration-300 flex-shrink-0'>
                          <Package className='w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600' />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'>
                            <span className='font-bold text-gray-900 text-base sm:text-lg'>
                              #{order?._id?.slice(-6)}
                            </span>
                            <span
                              className={`text-xs px-2 sm:px-3 py-1 rounded-full font-semibold ${getStatusColor(
                                order?.status
                              )} self-start sm:self-auto`}>
                              {getStatusIcon(order?.status)}
                              <span className='ml-1'>
                                {order?.status?.charAt(0)?.toUpperCase() +
                                  order?.status?.slice(1)}
                              </span>
                            </span>
                          </div>
                          <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1'>
                            <span className='text-base sm:text-lg font-semibold text-gray-800'>
                              ₹{order?.total?.toFixed(2)}
                            </span>
                            <span className='text-xs sm:text-sm text-gray-500'>
                              {new Date(order?.createdAt)?.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto'>
                        {order?.status === 'placed' && (
                          <Button
                            size='sm'
                            className='bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-200/50 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-xs sm:text-sm w-full sm:w-auto'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order?._id, 'preparing');
                            }}>
                            <Package className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                            <span className='hidden sm:inline'>Start Preparing</span>
                            <span className='sm:hidden'>Preparing</span>
                          </Button>
                        )}
                        {order?.status === 'payment_pending' && (
                          <Button
                            size='sm'
                            className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-200/50 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-xs sm:text-sm w-full sm:w-auto'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order?._id, 'placed');
                            }}>
                            <CheckCircle className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                            <span className='hidden sm:inline'>Mark as Placed</span>
                            <span className='sm:hidden'>Place Order</span>
                          </Button>
                        )}
                        {order?.status === 'preparing' && (
                          <Button
                            size='sm'
                            className='bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-200/50 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-xs sm:text-sm w-full sm:w-auto'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order?._id, 'ready');
                            }}>
                            <AlertCircle className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                            <span className='hidden sm:inline'>Mark Ready</span>
                            <span className='sm:hidden'>Ready</span>
                          </Button>
                        )}
                        {order?.status === 'ready' && (
                          <Button
                            size='sm'
                            className='bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700 shadow-lg shadow-purple-200/50 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-xs sm:text-sm w-full sm:w-auto'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order?._id, 'completed');
                            }}>
                            <CheckCircle className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                            <span className='hidden sm:inline'>Mark Complete</span>
                            <span className='sm:hidden'>Complete</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className='text-center py-8 sm:py-12'>
                <div className='bg-gray-100 rounded-2xl p-4 sm:p-6 inline-block mb-4'>
                  <Package className='w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto' />
                </div>
                <p className='text-gray-500 text-base sm:text-lg font-medium'>
                  No recent orders found
                </p>
                <p className='text-gray-400 text-xs sm:text-sm mt-1'>
                  New orders will appear here automatically
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Empty state for filtered orders */}
        {orders &&
          orders.length > 0 &&
          orders.filter((order) => statusFilter === 'all' || order?.status === statusFilter).length === 0 && (
            <div className='bg-white rounded-3xl border border-gray-200/60 p-8 sm:p-12 shadow-xl shadow-gray-100/50 text-center'>
              <div className='bg-gray-100 rounded-2xl p-6 inline-block mb-6'>
                <Package className='w-12 h-12 text-gray-400 mx-auto' />
              </div>
              <h3 className='text-xl sm:text-2xl font-bold text-gray-900 mb-2'>
                No {statusFilter !== 'all' ? statusFilter : ''} orders found
              </h3>
              <p className='text-gray-500 text-base sm:text-lg mb-6'>
                {statusFilter === 'all'
                  ? 'Orders will appear here once they are received'
                  : `No orders with "${statusFilter}" status at the moment`}
              </p>
              {statusFilter !== 'all' && (
                <Button
                  onClick={() => setStatusFilter('all')}
                  className='bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-200/50 rounded-xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105'>
                  View All Orders
                </Button>
              )}
            </div>
          )}
      </div>
    </div>
  );
};