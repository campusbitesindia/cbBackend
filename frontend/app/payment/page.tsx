'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Smartphone,
  Truck,
  Loader2,
  Shield,
  CheckCircle,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/auth-context';
import { useSocket } from '@/context/socket-context';
import { disconnect } from 'node:process';
import { useCart } from '@/context/cart-context';

interface OrderDetailsType {
  id: string;
  total: number;
  // add more fields as required
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { token } = useAuth();
  const { disconnectSocket } = useSocket();
  // State
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState<OrderDetailsType | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  // Query param
  const orderId = searchParams.get('orderId');

  // Fetch order details
  useEffect(() => {
    async function getOrderDetails() {
      if (!orderId) return;
      try {
        const response = await axios.get(
          `https://campusbites-mxpe.onrender.com/api/v1/order/getOrderDetails/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || 'Failed to get order details'
          );
        }
        const filteredData = {
          id: response.data.data._id,
          total: response.data.data.total,
        };
        setOrderDetails(filteredData);
      } catch (err: any) {
        console.log(err);
        toast({
          variant: 'destructive',
          title: 'Error fetching order',
          description: err.message ?? 'Failed to load order details.',
        });
      }
    }
    getOrderDetails();
  }, [orderId, token, toast]);

  // Loading state
  if (!orderId) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6'>
        <p className='text-red-600 font-semibold'>
          Order ID is missing. Please access from the valid link.
        </p>
      </div>
    );
  }
  const totalAmount = orderDetails?.total ?? 0;

  // --- Payment Handlers ---

  // Cash on Delivery Handler
  const handleCashOnDelivery = async (paymentData: object) => {
    try {
      const response = await axios.post(
        "https://campusbites-mxpe.onrender.com/api/v1/payments/COD",
        paymentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast({
        title: 'Order placed successfully',
        description: 'Your COD order is confirmed.',
      });
      disconnectSocket();
      router.push('/orders'); // Redirect after success
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: err.message ?? 'There was a problem with your order.',
      });
    }
  };

  // Payment Verification Handler
  const verifypayment = async (data: object) => {
    try {
      const response = await axios.post(
        "https://campusbites-mxpe.onrender.com/api/v1/payments/verify",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        toast({
          title: 'Payment Successful',
          description: 'Thank you for your payment!',
        });
        disconnectSocket();
        router.push('/orders');
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Payment Verification Failed',
        description: 'There was a problem verifying your payment.',
      });
    }
  };
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };
  // Razorpay Handler, pass custom transaction ID in 'notes'
  const openRazorpay = async (paymentData: object) => {
    await loadRazorpayScript();
    try {
      // Pass custom transaction ID to your backend for order creation
      const response = await axios.post(
        "https://campusbites-mxpe.onrender.com/api/v1/payments/create-order",paymentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const OrderData = response.data.data;

      const options = {
        key: OrderData.key,
        amount: OrderData.amount,
        currency: OrderData.currency,
        order_id: OrderData.razorpayOrderId,
        // Include custom transactionId via 'notes'
        notes: {
          orderId: orderId,
        },
        handler: function (response: object) {
          // Optionally, send the transactionId along with verification
          verifypayment(response);
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'UPI',
                instruments: [{ method: 'upi' }],
              },
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
      };

      // @ts-ignore

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.log(err);
      toast({
        variant: 'destructive',
        title: 'Payment Initialization Failed',
        description: err.message ?? 'Failed to initiate payment.',
      });
    }
  };

  // Main Payment Button Handler
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (!orderId) throw new Error('Missing order ID.');

      const paymentData = {
        orderId,
        method: paymentMethod,
      };

      if (paymentMethod === 'cod') {
        await handleCashOnDelivery(paymentData);
      } else {
        await openRazorpay(paymentData);
      }
      clearCart();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error.message || 'Please check your payment details',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Render UI ---

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      {/* Header */}
      <div className='bg-white dark:bg-gray-900 shadow-sm border-b'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center space-x-3'>
            <Button variant='ghost' size='icon' onClick={() => router.back()}>
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <h1 className='text-xl font-semibold'>Payment</h1>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-6 max-w-2xl'>
        {/* Order Summary */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Shield className='h-5 w-5 text-green-600' />
              <span>Order Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex justify-between font-bold text-lg'>
              <span>Total Amount</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Payment Method</CardTitle>
            <CardDescription>
              Select your preferred payment option
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value: 'cod' | 'upi') => setPaymentMethod(value)}
              className='space-y-4'>
              {/* Cash on Delivery */}
              <div className='flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-50'>
                <RadioGroupItem value='cod' id='cod' />
                <Label htmlFor='cod' className='flex-1 cursor-pointer'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-green-100 dark:bg-green-100 rounded-full flex items-center justify-center'>
                      <Truck className='h-4 w-4 text-green-600' />
                    </div>
                    <div>
                      <div className='font-medium'>Cash on Delivery</div>
                      <div className='text-sm text-gray-500'>
                        Pay when your order arrives
                      </div>
                    </div>
                  </div>
                </Label>
              </div>

              {/* UPI Payment */}
              <div className='flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-50'>
                <RadioGroupItem value='upi' id='upi' />
                <Label htmlFor='upi' className='flex-1 cursor-pointer'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-blue-100 dark:bg-blue-100 rounded-full flex items-center justify-center'>
                      <Smartphone className='h-4 w-4 text-blue-600' />
                    </div>
                    <div>
                      <div className='font-medium'>UPI Payment</div>
                      <div className='text-sm text-gray-500'>
                        Pay using your UPI ID (VPA)
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className='w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-base'>
              {isProcessing ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className='mr-2 h-4 w-4' />
                  {paymentMethod === 'cod'
                    ? 'Place Order'
                    : `Pay ₹${totalAmount.toFixed(2)}`}
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className='mt-4 p-3 bg-green-50 dark:bg-green-50 border border-green-200 dark:border-green-200 rounded-lg'>
              <div className='flex items-center space-x-2 text-sm text-green-700'>
                <Shield className='h-4 w-4' />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
