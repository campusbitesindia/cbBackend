import React, { useState, useEffect } from 'react';
import { RefreshCw, Bell, X } from 'lucide-react';
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

      {/* Status Filter */}
      <div className='flex items-center space-x-4 mb-6'>
        <span className='text-sm font-medium text-gray-700'>
          Filter by Status:
        </span>
        <div className='flex space-x-2'>
          {[
            'all',
            'placed',
            'preparing',
            'ready',
            'completed',
            'cancelled',
          ].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter(status)}
              className={
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700'
              }>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className='space-y-8'>
        {orders
          .filter(
            (order) => statusFilter === 'all' || order.status === statusFilter
          )
          .map((order) => (
            <OrderCard
              key={order._id}
              order={order}
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
          {orders && orders.length > 0 ? (
            orders
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 5)
              .map((order) => (
                <div
                  key={order._id}
                  className='flex flex-col bg-gray-50 rounded-lg p-2 border border-gray-100 hover:bg-blue-50 transition cursor-pointer mb-1'
                  onClick={() => onOrderClick(order._id)}>
                  <div className='flex items-center justify-between'>
                    <span className='font-semibold text-sm text-gray-800'>
                      #{order._id.slice(-4)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                        order.status
                      )}`}
                      style={{ minWidth: 70, textAlign: 'center' }}>
                      {getStatusIcon(order.status)}
                      <span className='ml-1'>
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </span>
                  </div>
                  <div className='flex items-center justify-between mt-1'>
                    <span className='text-xs text-gray-500'>
                      ₹{order.total.toFixed(2)}
                    </span>
                    <div className='flex items-center space-x-2'>
                      <span className='text-xs text-gray-400'>
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {order.status === 'placed' && (
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-xs h-6 px-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order._id, 'preparing');
                          }}>
                          Start Preparing
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
