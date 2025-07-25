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
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Loader2,
  Calendar,
  Users,
  Receipt,
  MapPin,
  CreditCard,
  Hash,
  DollarSign,
} from 'lucide-react';
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
      return 'bg-blue-100/50 text-blue-800 border-blue-300';
    case 'payment_pending':
      return 'bg-amber-100/50 text-amber-800 border-amber-300';
    case 'preparing':
      return 'bg-orange-100/50 text-orange-800 border-orange-300';
    case 'ready':
      return 'bg-emerald-100/50 text-emerald-800 border-emerald-300';
    case 'completed':
      return 'bg-green-100/50 text-green-800 border-green-300';
    case 'cancelled':
      return 'bg-red-100/50 text-red-800 border-red-300';
    default:
      return 'bg-gray-100/50 text-gray-800 border-gray-300';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'placed':
      return <Clock className='w-4 h-4' />;
    case 'payment_pending':
      return <CreditCard className='w-4 h-4' />;
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
      <DialogContent className='max-w-4xl bg-gray-50 border border-gray-200 shadow-xl rounded-lg max-h-[95vh] overflow-y-auto'>
        <DialogHeader className='pb-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <DialogTitle className='text-xl font-semibold text-gray-900'>
                Order Details
              </DialogTitle>
              <DialogDescription className='text-gray-600 mt-1'>
                Order #
                {orderDetails.OrderNumber ||
                  orderDetails._id.slice(-8).toUpperCase()}
              </DialogDescription>
            </div>
            <Badge
              className={`${getStatusColor(
                orderDetails.status
              )} border px-3 py-1.5 text-sm font-medium`}>
              <div className='flex items-center gap-2'>
                {getStatusIcon(orderDetails.status)}
                {getStatusLabel(orderDetails.status)}
              </div>
            </Badge>
          </div>
        </DialogHeader>

        <div className='space-y-6 pt-6'>
          {/* Status Update Section */}
          {canUpdateStatus && (
            <div className='bg-white border border-gray-200 p-5 rounded-lg shadow-sm'>
              <h3 className='font-medium text-gray-900 mb-4 flex items-center gap-2'>
                <Package className='w-4 h-4 text-blue-600' />
                Update Order Status
              </h3>
              <div className='flex items-center gap-3'>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  disabled={updatingStatus}>
                  <SelectTrigger className='w-64 bg-gray-50 border-gray-300 focus:border-blue-500 text-black'>
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
                    onClick={() => handleStatusUpdate(selectedStatus)}
                    disabled={updatingStatus}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors'>
                    {updatingStatus ? (
                      <div className='flex items-center gap-2'>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        Updating...
                      </div>
                    ) : (
                      'Update Status'
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Order Summary Cards */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            {/* Order Information */}
            <div className='bg-white border border-gray-200 p-5 rounded-lg shadow-sm'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <Receipt className='w-4 h-4 text-blue-700' />
                </div>
                <h4 className='font-medium text-gray-900'>Order Information</h4>
              </div>
              <div className='space-y-3'>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Order Number
                  </span>
                  <span className='font-semibold text-gray-600 mt-1'>
                    {orderDetails.OrderNumber || 'N/A'}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Total Amount
                  </span>
                  <span className='font-bold text-lg text-gray-600 mt-1'>
                    ₹{orderDetails.total?.toFixed(2)}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Order Date
                  </span>
                  <span className='text-gray-600 mt-1'>
                    {new Date(orderDetails.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {orderDetails.pickupTime && (
                  <div className='flex flex-col'>
                    <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                      Pickup Time
                    </span>
                    <span className='text-gray-600 mt-1'>
                      {new Date(orderDetails.pickupTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {orderDetails.groupOrderId && (
                  <div className='flex flex-col'>
                    <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                      Group Order
                    </span>
                    <Badge className='bg-green-100 text-green-700 border-green-200 w-fit mt-1'>
                      Yes
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div className='bg-white border border-gray-200 p-5 rounded-lg shadow-sm'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-emerald-100 rounded-lg'>
                  <Users className='w-4 h-4 text-emerald-700' />
                </div>
                <h4 className='font-medium text-gray-900'>Customer Details</h4>
              </div>
              <div className='space-y-3'>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Student Name
                  </span>
                  <span className='font-semibold text-gray-600 mt-1'>
                    {typeof orderDetails.student === 'string'
                      ? orderDetails.student
                      : orderDetails.student?.name || 'N/A'}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Student ID
                  </span>
                  <span className='text-gray-600 font-mono text-sm mt-1'>
                    {typeof orderDetails.student === 'string'
                      ? 'N/A'
                      : orderDetails.student?._id?.slice(-8) || 'N/A'}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Canteen
                  </span>
                  <span className='font-semibold text-gray-600 mt-1'>
                    {orderDetails.canteen?.name || 'N/A'}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Canteen ID
                  </span>
                  <span className='text-gray-600 font-mono text-sm mt-1'>
                    {orderDetails.canteen?._id?.slice(-8) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className='bg-white border border-gray-200 p-5 rounded-lg shadow-sm'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-purple-100 rounded-lg'>
                  <Calendar className='w-4 h-4 text-purple-700' />
                </div>
                <h4 className='font-medium text-gray-900'>Timeline</h4>
              </div>
              <div className='space-y-3'>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Created
                  </span>
                  <span className='text-gray-600 text-sm mt-1'>
                    {new Date(orderDetails.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Last Updated
                  </span>
                  <span className='text-gray-600 text-sm mt-1'>
                    {new Date(orderDetails.updatedAt).toLocaleString()}
                  </span>
                </div>
                {orderDetails.isDeleted !== undefined && (
                  <div className='flex flex-col'>
                    <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                      Status
                    </span>
                    <Badge
                      className={
                        orderDetails.isDeleted
                          ? 'bg-red-100 text-red-700 border-red-200 w-fit mt-1'
                          : 'bg-green-100 text-green-700 border-green-200 w-fit mt-1'
                      }>
                      {orderDetails.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className='bg-white border border-gray-200 p-5 rounded-lg shadow-sm'>
            <div className='flex items-center gap-3 mb-5'>
              <div className='p-2 bg-orange-100 rounded-lg'>
                <Package className='w-4 h-4 text-orange-700' />
              </div>
              <h4 className='font-medium text-gray-900'>
                Order Items ({orderDetails.items?.length || 0})
              </h4>
            </div>

            <div className='space-y-3'>
              {orderDetails.items?.map((item: any, idx: any) => (
                <div
                  key={item._id || idx}
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors'>
                  <div className='flex-1'>
                    <div className='font-medium text-gray-900'>
                      {item.nameAtPurchase || 'Unknown Item'}
                    </div>
                    <div className='text-gray-600 mt-1 flex items-center gap-4 text-sm'>
                      <span className='flex items-center gap-1'>
                        <Hash className='w-3 h-3' />
                        Qty: {item.quantity}
                      </span>
                      <span className='flex items-center gap-1'>
                        ₹{item.priceAtPurchase?.toFixed(2) || '0.00'} each
                      </span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='font-semibold text-lg text-gray-900'>
                      ₹
                      {(
                        (item.quantity || 0) * (item.priceAtPurchase || 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className='my-5' />

            {/* Order Total */}
            <div className='flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-200'>
              <span className='text-lg font-medium text-gray-900'>
                Total Amount
              </span>
              <span className='text-2xl font-bold text-blue-700'>
                ₹{orderDetails.total?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className='flex justify-end pt-6 border-t border-gray-200 mt-6'>
          <Button
            onClick={() => setOrderDetails(null)}
            className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors'>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
