import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface OrderDetailsDialogProps {
  orderDetails: any | null;
  setOrderDetails: (details: any | null) => void;
}

export const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  orderDetails,
  setOrderDetails,
}) => {
  if (!orderDetails) return null;

  return (
    <Dialog open={!!orderDetails} onOpenChange={() => setOrderDetails(null)}>
      <DialogContent className='max-w-lg bg-white border border-gray-200 text-black'>
        <DialogHeader>
          <DialogTitle className='text-black'>Order Details</DialogTitle>
          <DialogDescription className='text-black'>
            Detailed information for Order #{orderDetails._id.slice(-4)}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span className='font-semibold'>Order ID:</span>
            <span>{orderDetails._id}</span>
          </div>
          <div className='flex justify-between'>
            <span className='font-semibold'>Status:</span>
            <span>{orderDetails.status}</span>
          </div>
          <div className='flex justify-between'>
            <span className='font-semibold'>Total:</span>
            <span>₹{orderDetails.total.toFixed(2)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='font-semibold'>Order Date:</span>
            <span>{new Date(orderDetails.createdAt).toLocaleString()}</span>
          </div>
          <div className='font-semibold mt-2'>Customer Details</div>
          <div>Student ID: {orderDetails.student || 'N/A'}</div>
          <div>Canteen: {orderDetails.canteen?.name || 'N/A'}</div>
          <div>
            Payment Method:{' '}
            {orderDetails.payment?.method?.toUpperCase() || 'N/A'}
          </div>
          <div className='font-semibold mt-2'>Order Items</div>
          <div className='space-y-1'>
            {orderDetails.items.map((item: any, idx: any) => (
              <div key={idx} className='flex justify-between'>
                <span>
                  {item.item.name} x {item.quantity}
                </span>
                <span>₹{(item.item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={() => setOrderDetails(null)} className='w-full mt-4'>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};
