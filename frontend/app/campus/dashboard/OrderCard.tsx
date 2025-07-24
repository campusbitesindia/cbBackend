import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, CheckCircle, XCircle, Package, Loader2 } from 'lucide-react';
import { Order } from '@/types';
import { updateCanteenOrderStatus } from '@/services/canteenOrderService';
import { useToast } from '@/hooks/use-toast';

interface OrderCardProps {
  order: Order;
  onOrderClick: (orderId: string) => void;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
}

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
  switch (status) {
    case 'placed':
      return <Clock className='w-4 h-4' />;
    case 'payment_pending':
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

const getNextStatusOptions = (currentStatus: string) => {
  switch (currentStatus) {
    case 'placed':
      return ['preparing', 'cancelled'];
    case 'payment_pending':
      return ['placed', 'cancelled'];
    case 'preparing':
      return ['ready', 'cancelled'];
    case 'ready':
      return ['completed', 'cancelled'];
    case 'completed':
      return [];
    case 'cancelled':
      return [];
    default:
      return ['preparing', 'ready', 'completed', 'cancelled'];
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'placed':
      return 'Order Placed';
    case 'payment_pending':
      return 'Payment Pending';
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready for Pickup';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onOrderClick,
  onStatusUpdate,
}) => {
  const { toast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === order.status) return;

    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token') || '';
      await updateCanteenOrderStatus(order._id, newStatus as any, token);

      toast({
        title: 'Status Updated',
        description: `Order status changed to ${getStatusLabel(newStatus)}`,
      });

      // Call the parent callback to refresh the order list
      if (onStatusUpdate) {
        onStatusUpdate(order._id, newStatus);
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Update Failed',
        description:
          error.response?.data?.message || 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(false);
      setSelectedStatus('');
    }
  };

  const nextStatusOptions = getNextStatusOptions(order.status);
  const canUpdateStatus = nextStatusOptions.length > 0 && !updatingStatus;

  return (
    <div className='bg-white rounded-xl shadow p-6 flex flex-col space-y-4 hover:shadow-lg transition-shadow'>
      {/* Header: Order number, status, date, total */}
      <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-3'>
          <span className='font-bold text-lg text-black'>
            Order #{order._id.slice(-4)}
          </span>
          <span className='bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-semibold'>
            {order.status.toUpperCase()}
          </span>
        </div>
        <span className='font-bold text-xl text-black'>
          ₹{order.total.toFixed(2)}
        </span>
      </div>

      <div className='text-sm text-gray-500'>
        Order Date: {new Date(order.createdAt).toLocaleString()}
      </div>

      <hr className='my-2' />

      {/* Customer Details and Address */}
      <div className='flex flex-col md:flex-row md:justify-between md:items-start gap-4'>
        <div>
          <div className='font-semibold text-black'>Customer Details</div>
          <div className='text-gray-500'>
            Student:{' '}
            {typeof order.student === 'string'
              ? order.student
              : order.student?.name || 'N/A'}
          </div>
          <div className='text-gray-500'>
            Canteen: {order.canteen?.name || 'N/A'}
          </div>
        </div>
        <div className='text-right text-blue-900'>
          Payment: {order.payment?.method?.toUpperCase() || 'N/A'}
        </div>
      </div>

      {/* Order Items */}
      <div>
        <div className='font-semibold mt-4 text-black'>Order Items</div>
        {order.items.map((item: any, idx: any) => (
          <div
            key={item._id || idx}
            className='flex justify-between text-sm mt-1'>
            <span>
              <span className='font-semibold text-black'>
                {item.nameAtPurchase || item.item?.name || 'Unknown Item'}
              </span>
              <span className='ml-2 text-gray-500 '>
                Quantity: {item.quantity}
              </span>
            </span>
            <span className='text-right text-black'>
              ₹
              {(
                (item.quantity || 0) *
                (item.priceAtPurchase || item.item?.price || 0)
              ).toFixed(2)}
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

          {/* Status Update Controls */}
          {canUpdateStatus ? (
            <div className='flex items-center space-x-2'>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                disabled={updatingStatus}>
                <SelectTrigger className='w-40'>
                  <SelectValue placeholder='Update Status' />
                </SelectTrigger>
                <SelectContent>
                  {nextStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedStatus && (
                <Button
                  size='sm'
                  onClick={() => handleStatusUpdate(selectedStatus)}
                  disabled={updatingStatus}
                  className='bg-blue-600 hover:bg-blue-700 text-white'>
                  {updatingStatus ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    'Update'
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className='text-xs text-gray-500 italic'>
              {order.status === 'completed' || order.status === 'cancelled'
                ? 'Order finalized'
                : 'No status updates available'}
            </div>
          )}
        </div>
      </div>

      {/* View Details Button */}
      <Button
        variant='outline'
        onClick={() => onOrderClick(order._id)}
        className='w-full mt-2'>
        View Full Details
      </Button>
    </div>
  );
};
