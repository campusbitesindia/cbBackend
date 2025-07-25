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

      // Auto-hide notification after 10 seconds
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
        return (
          <div className={`${iconClass} bg-orange-500 rounded-full`}></div>
        );
      case 'preparing':
        return (
          <div className={`${iconClass} bg-yellow-500 rounded-full`}></div>
        );
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
    // Call the parent callback to refresh the order list
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
      count: orders.filter((order) => order.status === 'payment_pending')
        .length,
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

  return (
    <div className='space-y-10'>
      {/* New Order Notification */}
      {newOrderNotification.show && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-300'>
          <div className='flex items-center space-x-3'>
            <Bell className='w-5 h-5 text-green-600 animate-pulse' />
            <div>
              <p className='font-semibold text-green-800'>
                New Order{newOrderNotification.count > 1 ? 's' : ''} Received!
              </p>
              <p className='text-sm text-green-600'>
                {newOrderNotification.count} new order
                {newOrderNotification.count > 1 ? 's' : ''} need
                {newOrderNotification.count > 1 ? '' : 's'} your attention
              </p>
            </div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setNewOrderNotification({ show: false, count: 0 })}
            className='text-green-600 hover:text-green-800'>
            <X className='w-4 h-4' />
          </Button>
        </div>
      )}

      <div className='flex justify-between items-end mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800 mb-1'>Orders</h1>
          <p className='text-gray-600'>
            Manage and track all orders in real-time
          </p>
        </div>
        <Button
          variant='outline'
          onClick={onRefresh}
          className='bg-white text-black border border-gray-200 hover:border-gray-400 flex items-center space-x-2'
          disabled={!canteenId}>
          <RefreshCw className='w-4 h-4' />
          <span>Refresh</span>
        </Button>
      </div>

      <Separator className='mb-6 bg-gray-200' />

      {/* Enhanced Status Filter */}
      <div className='bg-white rounded-2xl border border-gray-100 p-6 shadow-sm'>
        <div className='flex items-center space-x-3 mb-6'>
          <div className='bg-gray-100 rounded-xl p-2'>
            <Filter className='w-5 h-5 text-gray-600' />
          </div>
          <div>
            <h3 className='font-semibold text-gray-900 text-lg'>
              Filter Orders
            </h3>
            <p className='text-sm text-gray-500'>
              Select a status to filter your orders
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3'>
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`relative group p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                statusFilter === filter.value
                  ? 'border-gray-400 bg-gray-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
              {/* Active indicator */}
              {statusFilter === filter.value && (
                <div className='absolute -top-1 -right-1 w-3 h-3 bg-gray-600 rounded-full border-2 border-white'></div>
              )}

              {/* Icon */}
              <div
                className={`mb-3 transition-colors duration-300 ${
                  statusFilter === filter.value
                    ? 'text-gray-700'
                    : 'text-gray-500'
                }`}>
                {filter.icon}
              </div>

              {/* Label */}
              <div className='text-left'>
                <div
                  className={`font-semibold text-sm transition-colors duration-300 ${
                    statusFilter === filter.value
                      ? 'text-gray-900'
                      : 'text-gray-700'
                  }`}>
                  {filter.label}
                </div>

                {/* Count badge */}
                <div className='flex items-center justify-between mt-2'>
                  <span
                    className={`text-xs transition-colors duration-300 ${
                      statusFilter === filter.value
                        ? 'text-gray-600'
                        : 'text-gray-500'
                    }`}>
                    {filter.count}
                  </span>
                  {filter.count > 0 && (
                    <div
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        statusFilter === filter.value
                          ? 'bg-gray-600'
                          : 'bg-gray-400'
                      }`}></div>
                  )}
                </div>
              </div>

              {/* Hover effect */}
              <div className='absolute inset-0 bg-gray-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10'></div>
            </button>
          ))}
        </div>

        {/* Filter summary */}
        <div className='mt-6 pt-4 border-t border-gray-100'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Grid3X3 className='w-4 h-4 text-gray-500' />
              <span className='text-sm text-gray-600'>
                Showing{' '}
                {statusFilter === 'all'
                  ? orders.length
                  : orders.filter((order) => order.status === statusFilter)
                      .length}{' '}
                orders
              </span>
            </div>
            {statusFilter !== 'all' && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setStatusFilter('all')}
                className='text-gray-500 hover:text-gray-700 text-xs'>
                Clear Filter
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className='space-y-8'>
        {orders &&
          orders.length > 0 &&
          orders
            .filter(
              (order) =>
                statusFilter === 'all' || order?.status === statusFilter
            )
            .map((order) => (
              <OrderCard
                key={order?._id}
                order={order || {}}
                onOrderClick={onOrderClick}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
      </div>

      <div className='mt-10'>
        <span className='text-xs font-semibold text-gray-400 tracking-widest'>
          RECENT ORDERS
        </span>
        <div className='mt-3 flex flex-col gap-2'>
          {orders && orders?.length > 0 ? (
            orders
              ?.slice()
              ?.sort(
                (a, b) =>
                  new Date(b?.createdAt)?.getTime() -
                  new Date(a?.createdAt)?.getTime()
              )
              ?.slice(0, 5)
              ?.map((order) => (
                <div
                  key={order?._id}
                  className='flex flex-col bg-gray-50 rounded-lg p-2 border border-gray-100 hover:bg-blue-50 transition cursor-pointer mb-1'
                  onClick={() => onOrderClick(order?._id)}>
                  <div className='flex items-center justify-between'>
                    <span className='font-semibold text-sm text-gray-800'>
                      #{order?._id?.slice(-4)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                        order?.status
                      )}`}
                      style={{ minWidth: 70, textAlign: 'center' }}>
                      {getStatusIcon(order?.status)}
                      <span className='ml-1'>
                        {order?.status?.charAt(0)?.toUpperCase() +
                          order?.status?.slice(1)}
                      </span>
                    </span>
                  </div>
                  <div className='flex items-center justify-between mt-1'>
                    <span className='text-xs text-gray-500'>
                      ₹{order?.total?.toFixed(2)}
                    </span>
                    <div className='flex items-center space-x-2'>
                      <span className='text-xs text-gray-400'>
                        {new Date(order?.createdAt)?.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {order?.status === 'placed' && (
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-xs h-6 px-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order?._id, 'preparing');
                          }}>
                          Start Preparing
                        </Button>
                      )}
                      {order?.status === 'payment_pending' && (
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-xs h-6 px-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order?._id, 'placed');
                          }}>
                          Mark as Placed
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className='text-xs text-gray-400 mt-2'>No recent orders</div>
          )}
        </div>
      </div>
    </div>
  );
};
