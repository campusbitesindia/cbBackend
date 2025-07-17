import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OrderCard } from './OrderCard';
import { Order } from '@/types';

interface OrdersTabProps {
  orders: Order[];
  onRefresh: () => void;
  onOrderClick: (orderId: string) => void;
  canteenId: string | null;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  onRefresh,
  onOrderClick,
  canteenId,
}) => {
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

  return (
    <div className='space-y-10'>
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

      <div className='space-y-8'>
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            onOrderClick={onOrderClick}
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
                    <span className='text-xs text-gray-400'>
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
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
