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
  CreditCard,
  Hash,
  Phone,
  Mail,
  MapPin,
  Star,
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

      const updatedOrderDetails = {
        ...orderDetails,
        status: newStatus,
      };
      setOrderDetails(updatedOrderDetails);

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
      <DialogContent className='w-full max-w-[95vw] sm:max-w-4xl bg-gray-50 border border-gray-200 shadow-xl rounded-lg max-h-[95vh] overflow-y-auto mx-auto'>
        <DialogHeader className='pb-4 sm:pb-6 border-b border-gray-200'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div className='min-w-0'>
              <DialogTitle className='text-lg sm:text-xl font-semibold text-gray-900 truncate'>
                Order Details
              </DialogTitle>
              <DialogDescription className='text-gray-600 mt-1 text-sm sm:text-base'>
                Order #
                {orderDetails.OrderNumber ||
                  orderDetails._id.slice(-8).toUpperCase()}
              </DialogDescription>
            </div>
            <Badge
              className={`${getStatusColor(
                orderDetails.status
              )} border px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium self-start sm:self-auto`}>
              <div className='flex items-center gap-1 sm:gap-2'>
                {getStatusIcon(orderDetails.status)}
                <span className='whitespace-nowrap'>{getStatusLabel(orderDetails.status)}</span>
              </div>
            </Badge>
          </div>
        </DialogHeader>

        <div className='space-y-4 sm:space-y-6 pt-4 sm:pt-6'>
          {/* Status Update Section */}
          {canUpdateStatus && (
            <div className='bg-white border border-gray-200 p-3 sm:p-5 rounded-lg shadow-sm'>
              <h3 className='font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base'>
                <Package className='w-4 h-4 text-blue-600 flex-shrink-0' />
                Update Order Status
              </h3>
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  disabled={updatingStatus}>
                  <SelectTrigger className='w-full sm:w-64 bg-gray-50 border-gray-300 focus:border-blue-500 text-black'>
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
                    className='bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md font-medium transition-colors w-full sm:w-auto'>
                    {updatingStatus ? (
                      <div className='flex items-center gap-2 justify-center'>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        <span className='text-sm'>Updating...</span>
                      </div>
                    ) : (
                      <span className='text-sm'>Update Status</span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Order Summary Cards */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4'>
            {/* Order Information */}
            <div className='bg-white border border-gray-200 p-3 sm:p-5 rounded-lg shadow-sm'>
              <div className='flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4'>
                <div className='p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0'>
                  <Receipt className='w-3 h-3 sm:w-4 sm:h-4 text-blue-700' />
                </div>
                <h4 className='font-medium text-gray-900 text-sm sm:text-base'>Order Information</h4>
              </div>
              <div className='space-y-2 sm:space-y-3'>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Order Number
                  </span>
                  <span className='font-semibold text-gray-600 mt-1 text-sm break-all'>
                    {orderDetails.OrderNumber || 'N/A'}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Total Amount
                  </span>
                  <span className='font-bold text-base sm:text-lg text-gray-600 mt-1'>
                    ₹{orderDetails.total?.toFixed(2)}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Order Date
                  </span>
                  <span className='text-gray-600 mt-1 text-sm'>
                    {new Date(orderDetails.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Order Time
                  </span>
                  <span className='text-gray-600 mt-1 text-sm'>
                    {new Date(orderDetails.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                {orderDetails.pickupTime && (
                  <div className='flex flex-col'>
                    <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                      Pickup Time
                    </span>
                    <span className='text-gray-600 mt-1 text-sm'>
                      {new Date(orderDetails.pickupTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {orderDetails.groupOrderId && (
                  <div className='flex flex-col'>
                    <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                      Group Order
                    </span>
                    <Badge className='bg-green-100 text-green-700 border-green-200 w-fit mt-1 text-xs'>
                      Yes
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div className='bg-white border border-gray-200 p-3 sm:p-5 rounded-lg shadow-sm'>
              <div className='flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4'>
                <div className='p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0'>
                  <Users className='w-3 h-3 sm:w-4 sm:h-4 text-emerald-700' />
                </div>
                <h4 className='font-medium text-gray-900 text-sm sm:text-base'>Customer Details</h4>
              </div>
              <div className='space-y-2 sm:space-y-3'>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Student Name
                  </span>
                  <span className='font-semibold text-gray-600 mt-1 text-sm break-words'>
                    {typeof orderDetails.student === 'string'
                      ? orderDetails.student
                      : orderDetails.student?.name || 'N/A'}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Student ID
                  </span>
                  <span className='text-gray-600 font-mono text-xs sm:text-sm mt-1 break-all'>
                    {typeof orderDetails.student === 'string'
                      ? 'N/A'
                      : orderDetails.student?._id?.slice(-8) || 'N/A'}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Canteen
                  </span>
                  <span className='font-semibold text-gray-600 mt-1 text-sm break-words'>
                    {orderDetails.canteen?.name || 'N/A'}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Canteen ID
                  </span>
                  <span className='text-gray-600 font-mono text-xs sm:text-sm mt-1 break-all'>
                    {orderDetails.canteen?._id?.slice(-8) || 'N/A'}
                  </span>
                </div>
                {orderDetails.student?.email && (
                  <div className='flex flex-col'>
                    <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                      Email
                    </span>
                    <span className='text-gray-600 text-xs sm:text-sm mt-1 break-all'>
                      {orderDetails.student.email}
                    </span>
                  </div>
                )}
                {orderDetails.student?.phone && (
                  <div className='flex flex-col'>
                    <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                      Phone
                    </span>
                    <span className='text-gray-600 text-xs sm:text-sm mt-1'>
                      {orderDetails.student.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className='bg-white border border-gray-200 p-3 sm:p-5 rounded-lg shadow-sm'>
              <div className='flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4'>
                <div className='p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0'>
                  <Calendar className='w-3 h-3 sm:w-4 sm:h-4 text-purple-700' />
                </div>
                <h4 className='font-medium text-gray-900 text-sm sm:text-base'>Timeline</h4>
              </div>
              <div className='space-y-2 sm:space-y-3'>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Created
                  </span>
                  <span className='text-gray-600 text-xs sm:text-sm mt-1'>
                    {new Date(orderDetails.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                    Last Updated
                  </span>
                  <span className='text-gray-600 text-xs sm:text-sm mt-1'>
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
                          ? 'bg-red-100 text-red-700 border-red-200 w-fit mt-1 text-xs'
                          : 'bg-green-100 text-green-700 border-green-200 w-fit mt-1 text-xs'
                      }>
                      {orderDetails.isDeleted ? 'Deleted' : 'Active'}
                    </Badge>
                  </div>
                )}
                {orderDetails.estimatedTime && (
                  <div className='flex flex-col'>
                    <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                      Estimated Time
                    </span>
                    <span className='text-gray-600 text-xs sm:text-sm mt-1'>
                      {orderDetails.estimatedTime} minutes
                    </span>
                  </div>
                )}
                {orderDetails.specialInstructions && (
                  <div className='flex flex-col'>
                    <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                      Special Instructions
                    </span>
                    <span className='text-gray-600 text-xs sm:text-sm mt-1 break-words'>
                      {orderDetails.specialInstructions}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className='bg-white border border-gray-200 p-3 sm:p-5 rounded-lg shadow-sm'>
            <div className='flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4'>
              <div className='p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0'>
                <CreditCard className='w-3 h-3 sm:w-4 sm:h-4 text-green-700' />
              </div>
              <h4 className='font-medium text-gray-900 text-sm sm:text-base'>Payment Information</h4>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
              <div className='flex flex-col'>
                <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                  Payment Method
                </span>
                <span className='font-semibold text-gray-600 mt-1 text-sm'>
                  {orderDetails.payment?.method?.toUpperCase() ||
                    orderDetails?.paymentStatus?.toUpperCase() ||
                    'N/A'}
                </span>
              </div>
              <div className='flex flex-col'>
                <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                  Payment Status
                </span>
                <Badge className={`w-fit mt-1 text-xs ${
                  orderDetails.payment?.status === 'completed' || orderDetails.paymentStatus === 'completed'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : orderDetails.payment?.status === 'pending' || orderDetails.paymentStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {orderDetails.payment?.status || orderDetails.paymentStatus || 'Unknown'}
                </Badge>
              </div>
              <div className='flex flex-col'>
                <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                  Subtotal
                </span>
                <span className='font-semibold text-gray-600 mt-1 text-sm'>
                  ₹{(orderDetails.subtotal || orderDetails.total)?.toFixed(2)}
                </span>
              </div>
              <div className='flex flex-col'>
                <span className='text-gray-500 text-xs font-medium uppercase tracking-wide'>
                  Tax & Fees
                </span>
                <span className='font-semibold text-gray-600 mt-1 text-sm'>
                  ₹{(orderDetails.tax || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className='bg-white border border-gray-200 p-3 sm:p-5 rounded-lg shadow-sm'>
            <div className='flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5'>
              <div className='p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0'>
                <Package className='w-3 h-3 sm:w-4 sm:h-4 text-orange-700' />
              </div>
              <h4 className='font-medium text-gray-900 text-sm sm:text-base'>
                Order Items ({orderDetails.items?.length || 0})
              </h4>
            </div>

            <div className='space-y-2 sm:space-y-3'>
              {orderDetails.items?.map((item: any, idx: any) => (
                <div
                  key={item._id || idx}
                  className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors gap-2 sm:gap-0'>
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium text-gray-900 text-sm sm:text-base break-words'>
                      {item.nameAtPurchase || item.name || 'Unknown Item'}
                    </div>
                    <div className='text-gray-600 mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm'>
                      <span className='flex items-center gap-1'>
                        <Hash className='w-3 h-3 flex-shrink-0' />
                        Qty: {item.quantity}
                      </span>
                      <span className='flex items-center gap-1'>
                        ₹{(item.priceAtPurchase || item.price || 0).toFixed(2)} each
                      </span>
                      {item.category && (
                        <span className='text-gray-500'>
                          Category: {item.category}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className='text-xs text-gray-500 mt-1 break-words'>
                        {item.description}
                      </p>
                    )}
                    {item.customizations && item.customizations.length > 0 && (
                      <div className='mt-2'>
                        <span className='text-xs text-gray-500 font-medium'>Customizations:</span>
                        <div className='flex flex-wrap gap-1 mt-1'>
                          {item.customizations.map((custom: any, customIdx: number) => (
                            <Badge key={customIdx} className='bg-blue-50 text-blue-700 border-blue-200 text-xs'>
                              {custom.name || custom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className='text-left sm:text-right flex-shrink-0'>
                    <div className='font-semibold text-base sm:text-lg text-gray-900'>
                      ₹
                      {(
                        (item.quantity || 0) * (item.priceAtPurchase || item.price || 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className='my-3 sm:my-5' />

            {/* Order Total */}
            <div className='bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200'>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-2'>
                <span className='text-base sm:text-lg font-medium text-gray-900'>
                  Total Amount
                </span>
                <span className='text-xl sm:text-2xl font-bold text-blue-700'>
                  ₹{orderDetails.total?.toFixed(2)}
                </span>
              </div>
              {orderDetails.discount && orderDetails.discount > 0 && (
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-600'>
                  <span>Discount Applied:</span>
                  <span className='font-semibold text-green-600'>
                    -₹{orderDetails.discount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6'>
          <Button
            onClick={() => setOrderDetails(null)}
            className='bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 rounded-md font-medium transition-colors w-full sm:w-auto order-2 sm:order-1'>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};