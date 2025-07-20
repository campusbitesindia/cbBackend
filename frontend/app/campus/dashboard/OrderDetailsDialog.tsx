import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Package, Loader2 } from 'lucide-react';
import { updateCanteenOrderStatus } from '@/services/canteenOrderService';
import { useToast } from '@/hooks/use-toast';

interface OrderDetailsDialogProps {
  orderDetails: any | null;
  setOrderDetails: (details: any | null) => void;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
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

const getNextStatusOptions = (currentStatus: string) => {
  switch (currentStatus) {
    case 'placed':
      return ['preparing', 'cancelled'];
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

export const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  orderDetails,
  setOrderDetails,
  onStatusUpdate,
}) => {
  const { toast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const handleStatusUpdate = async (newStatus: string) => {
    if (!orderDetails || newStatus === orderDetails.status) return;

    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token') || '';
      await updateCanteenOrderStatus(orderDetails._id, newStatus as any, token);

      toast({
        title: 'Status Updated',
        description: `Order status changed to ${getStatusLabel(newStatus)}`,
      });

      // Update the local order details
      const updatedOrderDetails = {
        ...orderDetails,
        status: newStatus,
      };
      setOrderDetails(updatedOrderDetails);

      // Call the parent callback to refresh the order list
      if (onStatusUpdate) {
        onStatusUpdate(orderDetails._id, newStatus);
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

  if (!orderDetails) return null;

  const nextStatusOptions = getNextStatusOptions(orderDetails.status);
  const canUpdateStatus = nextStatusOptions.length > 0 && !updatingStatus;

  return (
    <Dialog open={!!orderDetails} onOpenChange={() => setOrderDetails(null)}>
      <DialogContent className='max-w-lg bg-white border border-gray-200 text-black'>
        <DialogHeader>
          <DialogTitle className='text-black'>Order Details</DialogTitle>
          <DialogDescription className='text-black'>
            Detailed information for Order #{orderDetails._id.slice(-4)}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Order Status Section */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='font-semibold text-gray-800'>Order Status</h3>
              <Badge className={getStatusColor(orderDetails.status)}>
                {getStatusIcon(orderDetails.status)}
                <span className='ml-1'>
                  {orderDetails.status.toUpperCase()}
                </span>
              </Badge>
            </div>

            {canUpdateStatus ? (
              <div className='flex items-center space-x-2'>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  disabled={updatingStatus}>
                  <SelectTrigger className='w-full'>
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
                    className='bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap'>
                    {updatingStatus ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      'Update'
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <p className='text-sm text-gray-600'>
                {orderDetails.status === 'completed' ||
                orderDetails.status === 'cancelled'
                  ? 'This order has been finalized and cannot be updated.'
                  : 'No status updates available for this order.'}
              </p>
            )}
          </div>

          {/* Order Information */}
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='font-semibold'>Order ID:</span>
              <span className='text-sm'>{orderDetails._id}</span>
            </div>
            <div className='flex justify-between'>
              <span className='font-semibold'>Total:</span>
              <span>₹{orderDetails.total.toFixed(2)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='font-semibold'>Order Date:</span>
              <span>{new Date(orderDetails.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className='bg-blue-50 p-3 rounded-lg'>
            <h4 className='font-semibold text-gray-800 mb-2'>
              Customer Details
            </h4>
            <div className='space-y-1 text-sm'>
              <div>Student ID: {orderDetails.student || 'N/A'}</div>
              <div>Canteen: {orderDetails.canteen?.name || 'N/A'}</div>
              <div>
                Payment Method:{' '}
                {orderDetails.payment?.method?.toUpperCase() || 'N/A'}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className='font-semibold text-gray-800 mb-2'>Order Items</h4>
            <div className='space-y-2'>
              {orderDetails.items.map((item: any, idx: any) => (
                <div
                  key={idx}
                  className='flex justify-between items-center p-2 bg-gray-50 rounded'>
                  <div>
                    <span className='font-medium'>{item.item.name}</span>
                    <span className='text-sm text-gray-600 ml-2'>
                      x{item.quantity}
                    </span>
                  </div>
                  <span className='font-semibold'>
                    ₹{(item.item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={() => setOrderDetails(null)} className='w-full mt-4'>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};
