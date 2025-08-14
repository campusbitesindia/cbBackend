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
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Loader2,
  User,
  Store,
  CreditCard,
  Calendar,
  Receipt,
  Eye,
} from 'lucide-react';
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
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'payment_pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'preparing':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'ready':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'completed':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
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
    <div className='w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md hover:border-gray-200 transition-all duration-200 group'>
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6'>
        <div className='flex items-center space-x-3'>
          <div className='bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-2 sm:p-3 shadow-sm flex-shrink-0'>
            <Receipt className='w-4 h-4 sm:w-5 sm:h-5' />
          </div>
          <div className='min-w-0 flex-1'>
            <h3 className='font-bold text-lg sm:text-xl text-gray-900 truncate'>
              Order #
              {order.OrderNumber
                ? order.OrderNumber.replace(/[^0-9]/g, '')
                : order._id.slice(-6)}
            </h3>
            <div className='flex items-center space-x-2 mt-1'>
              <Calendar className='w-3 h-3 text-gray-400 flex-shrink-0' />
              <span className='text-sm text-gray-500 truncate'>
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className='text-left sm:text-right flex-shrink-0'>
          <div className='text-xl sm:text-2xl font-bold text-gray-900'>
            ₹{order.total.toFixed(2)}
          </div>
          <Badge
            className={`${getStatusColor(order.status)} border font-medium mt-2 sm:mt-0`}>
            {getStatusIcon(order.status)}
            <span className='ml-1 text-xs sm:text-sm'>{getStatusLabel(order.status)}</span>
          </Badge>
        </div>
      </div>

      {/* Customer and Payment Info */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6'>
        <div className='bg-gray-50 rounded-xl p-3 sm:p-4'>
          <div className='flex items-center space-x-2 mb-2'>
            <User className='w-4 h-4 text-gray-500 flex-shrink-0' />
            <span className='font-semibold text-gray-700 text-sm'>
              Customer
            </span>
          </div>
          <p className='text-gray-900 font-medium text-sm sm:text-base break-words'>
            {typeof order.student === 'string'
              ? order.student
              : order.student?.name || 'N/A'}
          </p>
        </div>

        <div className='bg-gray-50 rounded-xl p-3 sm:p-4'>
          <div className='flex items-center space-x-2 mb-2'>
            <Store className='w-4 h-4 text-gray-500 flex-shrink-0' />
            <span className='font-semibold text-gray-700 text-sm'>Canteen</span>
          </div>
          <p className='text-gray-900 font-medium text-sm sm:text-base break-words'>
            {order.canteen?.name || 'N/A'}
          </p>
        </div>
      </div>

      {/* Payment Method */}
      <div className='bg-blue-50 rounded-xl p-3 sm:p-4 mb-6'>
        <div className='flex items-center space-x-2 mb-2'>
          <CreditCard className='w-4 h-4 text-blue-600 flex-shrink-0' />
          <span className='font-semibold text-blue-700 text-sm'>
            Payment Method
          </span>
        </div>
        <p className='text-blue-900 font-medium text-sm sm:text-base break-words'>
          {order.payment?.method?.toUpperCase() ||
            order?.paymentStatus?.toUpperCase() ||
            'N/A'}
        </p>
      </div>

      {/* Order Items */}
      <div className='mb-6'>
        <h4 className='font-semibold text-gray-900 mb-3 flex items-center text-sm sm:text-base'>
          <Package className='w-4 h-4 mr-2 text-gray-500 flex-shrink-0' />
          Order Items ({order.items.length})
        </h4>
        <div className='space-y-2'>
          {order.items.map((item: any, idx: any) => (
            <div
              key={item._id || idx}
              className='flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 rounded-lg p-3 gap-2 sm:gap-0'>
              <div className='flex-1 min-w-0'>
                <p className='font-medium text-gray-900 text-sm sm:text-base break-words'>
                  {item.nameAtPurchase || item.item?.name || 'Unknown Item'}
                </p>
                <p className='text-xs sm:text-sm text-gray-500 mt-1'>
                  Qty: {item.quantity} × ₹
                  {(item.priceAtPurchase || item.item?.price || 0).toFixed(2)}
                </p>
              </div>
              <div className='text-left sm:text-right flex-shrink-0'>
                <p className='font-semibold text-gray-900 text-sm sm:text-base'>
                  ₹
                  {(
                    (item.quantity || 0) *
                    (item.priceAtPurchase || item.item?.price || 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Update Section */}
      {canUpdateStatus && (
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 mb-4 border border-blue-100'>
          <h4 className='font-semibold text-blue-900 mb-3 text-sm sm:text-base'>
            Update Order Status
          </h4>
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              disabled={updatingStatus}>
              <SelectTrigger className='w-full sm:w-48 bg-white border-blue-200 text-black'>
                <SelectValue placeholder='Select new status' />
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
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 w-full sm:w-auto'>
                {updatingStatus ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  'Update'
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* View Details Button */}
      <div className='border-t border-gray-100 pt-4 mt-4'>
        <Button
          variant='outline'
          onClick={() => onOrderClick(order._id)}
          className='w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-300 group-hover:shadow-md font-medium py-2 sm:py-3 relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          <div className='relative flex items-center justify-center space-x-2'>
            <Eye className='w-4 h-4' />
            <span className='text-sm sm:text-base'>View Full Details</span>
            <div className='w-1 h-1 bg-blue-500 rounded-full animate-pulse' />
          </div>
        </Button>
      </div>
    </div>
  );
};