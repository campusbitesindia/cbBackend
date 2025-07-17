import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  onOrderClick: (orderId: string) => void;
}

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
  switch (status) {
    case 'placed':
      return <Clock className='w-4 h-4' />;
    case 'preparing':
      return <Package className='w-4 h-4' />;
    case 'ready':
      return <CheckCircle className='w-4 h-4' />;
    case 'completed':
      return <CheckCircle className='w-4 h-4' />;
    case 'cancelled':
      return <XCircle className='w-4 h-4' />;
    default:
      return <Clock className='w-4 h-4' />;
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onOrderClick,
}) => {
  return (
    <div
      className='bg-white rounded-xl shadow p-6 flex flex-col space-y-4 cursor-pointer hover:shadow-lg transition-shadow'
      onClick={() => onOrderClick(order._id)}>
      {/* Header: Order number, status, date, total */}
      <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-3'>
          <span className='font-bold text-lg'>
            Order #{order._id.slice(-4)}
          </span>
          <span className='bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-semibold'>
            {order.status.toUpperCase()}
          </span>
        </div>
        <span className='font-bold text-xl'>₹{order.total.toFixed(2)}</span>
      </div>

      <div className='text-sm text-gray-500'>
        Order Date: {new Date(order.createdAt).toLocaleString()}
      </div>

      <hr className='my-2' />

      {/* Customer Details and Address */}
      <div className='flex flex-col md:flex-row md:justify-between md:items-start gap-4'>
        <div>
          <div className='font-semibold'>Customer Details</div>
          <div>Student ID: {order.student || 'N/A'}</div>
          <div>Canteen: {order.canteen?.name || 'N/A'}</div>
        </div>
        <div className='text-right text-blue-900'>
          Payment: {order.payment?.method?.toUpperCase() || 'N/A'}
        </div>
      </div>

      {/* Order Items */}
      <div>
        <div className='font-semibold mt-4'>Order Items</div>
        {order.items.map((item: any, idx: any) => (
          <div key={idx} className='flex justify-between text-sm mt-1'>
            <span>
              <span className='font-semibold'>{item.item.name}</span>
              <span className='ml-2 text-gray-500'>
                Quantity: {item.quantity}
              </span>
            </span>
            <span className='text-right'>
              ₹{(item.item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Order Status Update */}
      <div className='mt-4 pt-4 border-t border-gray-200'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <span className='text-sm font-medium text-gray-700'>Status:</span>
            <Badge className={getStatusColor(order.status)}>
              {getStatusIcon(order.status)}
              <span className='ml-1'>{order.status.toUpperCase()}</span>
            </Badge>
          </div>
          <div className='text-xs text-gray-500 italic'>
            Status updates require backend API support
          </div>
        </div>
      </div>
    </div>
  );
};
