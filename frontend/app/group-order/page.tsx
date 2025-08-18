'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import io from 'socket.io-client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PopulatedMenuItem {
  _id: string;
  name: string;
  price: number;
}

interface Item {
  item: string | PopulatedMenuItem;
  quantity: number;
  nameAtPurchase?: string;
  priceAtPurchase?: number;
  _id?: string;
  user: string;
}

interface Member {
  _id: string;
  name: string;
}

interface PaymentAmount {
  user: string;
  amount: number;
}

interface Transaction {
  user: string;
  transactionId: string;
  status: string;
  createdAt?: string;
}

interface GroupOrder {
  _id: string;
  creator: string;
  members: Member[];
  groupLink: string;
  qrCodeUrl: string;
  canteen: string;
  items: Item[];
  totalAmount: number;
  paymentDetails: {
    splitType: 'equal' | 'custom' | 'self';
    amounts: PaymentAmount[];
    transactions: Transaction[];
  };
  status: string;
}

const TransactionRowDesktop = ({
  txn,
  member,
  isCurrentUser,
  amount,
}: {
  txn: Transaction;
  member: Member | undefined;
  isCurrentUser: boolean;
  amount: number;
}) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const statusText =
    txn.status === 'pending'
      ? 'Processing...'
      : txn.status.charAt(0).toUpperCase() + txn.status.slice(1);

  const loadingSpinner = txn.status === 'pending' ? (
    <svg
      className="animate-spin -ml-1 mr-1 h-3 w-3 text-yellow-600 inline"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  ) : null;

  return (
    <tr>
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {isCurrentUser ? 'You' : member?.name || 'Unknown'}
      </td>
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
        ₹{amount.toFixed(2)}
      </td>
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-right">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[txn.status as keyof typeof statusColors] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {loadingSpinner}
          {statusText}
        </span>
      </td>
    </tr>
  );
};

const TransactionRowMobile = ({
  txn,
  member,
  isCurrentUser,
  amount,
}: {
  txn: Transaction;
  member: Member | undefined;
  isCurrentUser: boolean;
  amount: number;
}) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const statusText =
    txn.status === 'pending'
      ? 'Processing...'
      : txn.status.charAt(0).toUpperCase() + txn.status.slice(1);

  const loadingSpinner = txn.status === 'pending' ? (
    <svg
      className="animate-spin -ml-1 mr-1 h-3 w-3 text-yellow-600 inline"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  ) : null;

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="space-y-1">
        <div className="font-medium text-gray-900 dark:text-white">
          {isCurrentUser ? 'You' : member?.name || 'Unknown'}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(txn.createdAt || Date.now()).toLocaleString()}
        </div>
      </div>
      <div className="flex flex-col items-end space-y-1">
        <div className="font-semibold">₹{amount.toFixed(2)}</div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            statusColors[txn.status as keyof typeof statusColors] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {loadingSpinner}
          {statusText}
        </span>
      </div>
      {txn.transactionId && (
        <div className="col-span-2 mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
          Txn ID: {txn.transactionId}
        </div>
      )}
    </div>
  );
};

export default function GroupOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'custom' | 'self'>('equal');
  const [amounts, setAmounts] = useState<PaymentAmount[]>([]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [savingItems, setSavingItems] = useState(false);
  const [menuItems, setMenuItems] = useState<
    { _id: string; name: string; price: number }[]
  >([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | null>(null);
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);

  const groupLink = searchParams.get('link');
  if (!groupLink) {
    return <div>Invalid group link.</div>;
  }

  const updateTimeout = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  // Load Razorpay SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => console.log('Razorpay SDK loaded');
      script.onerror = () =>
        toast({
          variant: 'destructive',
          title: 'Razorpay SDK failed to load',
          description: 'Could not load Razorpay payment gateway script',
        });
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [toast]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Initialize Socket.IO for real-time updates
  useEffect(() => {
    if (!groupLink || !token) return;

    const socket = io('https://campusbites-mxpe.onrender.com', {
      path: '/socket.io',
      query: { token },
      transports: ['websocket'],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO connected');
      socket.emit('joinGroupOrder', groupLink);
    });

    socket.on('ORDER_UPDATED', (data) => {
      console.log('Received ORDER_UPDATED:', data);
      setGroupOrder(data.groupOrder);
      setItems(data.groupOrder.items || []);
      setSplitType(data.groupOrder.paymentDetails.splitType || 'equal');
      setAmounts(data.groupOrder.paymentDetails.amounts || []);
      toast({
        title: 'Order Updated',
        description: 'Group order has been updated by a member.',
      });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Failed to connect to real-time updates. Retrying...',
      });
      setTimeout(() => socket.connect(), 5000); // Attempt to reconnect
    });

    socket.on('disconnect', () => {
      toast({
        variant: 'destructive',
        title: 'Connection Lost',
        description: 'Socket.IO connection closed. Retrying...',
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [groupLink, token, toast]);

  // Fetch group order
  const fetchGroupOrder = useCallback(async () => {
    if (!groupLink || !token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://campusbites-mxpe.onrender.com/api/v1/groupOrder/${groupLink}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to load group order: ${res.statusText}`);
      }
      const data = await res.json();
      setGroupOrder(data.groupOrder);
      setItems(data.groupOrder.items || []);
      setSplitType(data.groupOrder.paymentDetails.splitType || 'equal');
      setAmounts(data.groupOrder.paymentDetails.amounts || []);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (err as Error).message || 'Failed to load group order',
      });
    } finally {
      setLoading(false);
    }
  }, [groupLink, token, toast]);

  // Initial fetch
  useEffect(() => {
    fetchGroupOrder();
  }, [fetchGroupOrder]);

  // Fetch menu items
  useEffect(() => {
    async function fetchMenuItems() {
      if (!groupOrder?.canteen || !token) return;
      try {
        const res = await fetch(
          `https://campusbites-mxpe.onrender.com/api/v1/items/getItems/${groupOrder.canteen}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error('Failed to fetch canteen menu');
        const data = await res.json();
        setMenuItems(data?.data || []);
        if (data.data.length > 0 && !selectedMenuItemId) {
          setSelectedMenuItemId(data.data[0]._id);
        }
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (e as Error).message,
        });
      }
    }
    fetchMenuItems();
  }, [groupOrder?.canteen, token, toast, selectedMenuItemId]);

  // Persist items to backend
  const persistItemsToBackend = useCallback(async (updatedItems: Item[]) => {
    if (!groupOrder || !token || !user) return;
    setSavingItems(true);
    try {
      const updatePayload = {
        groupOrderId: groupOrder._id,
        items: updatedItems.map((item) => ({
          item: typeof item.item === 'object' ? item.item._id : item.item,
          quantity: item.quantity,
          user: item.user || user.id,
        })),
      };

      const res = await fetch(`https://campusbites-mxpe.onrender.com/api/v1/groupOrder/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const errResp = await res.json();
        throw new Error(errResp.message || 'Failed to update group order');
      }

      // Fetch updated order to ensure consistency
      await fetchGroupOrder();
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Failed to save items',
        description: (e as Error).message,
      });
    } finally {
      setSavingItems(false);
    }
  }, [groupOrder, token, user, toast, fetchGroupOrder]);

  // Remove item
  const removeItem = useCallback(async (itemId: string) => {
    try {
      const updatedItems = items.filter(
        (i) => (typeof i.item === 'object' ? i.item._id : i.item) !== itemId
      );
      setItems(updatedItems);
      await persistItemsToBackend(updatedItems);

      toast({
        title: 'Item removed',
        description: 'Item has been removed from the order.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error removing item',
        description: (error as Error).message || 'Failed to remove item',
      });
    }
  }, [items, persistItemsToBackend, toast]);

  // Update item quantity
  const updateItemQuantityDebounced = useCallback(
    (itemId: string, quantity: number) => {
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
      updateTimeout.current = setTimeout(() => {
        performUpdateItemQuantity(itemId, quantity);
      }, 500);
    },
    []
  );

  const performUpdateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const updated = items.map((i) =>
        (typeof i.item === 'object' ? i.item._id : i.item) === itemId
          ? { ...i, quantity: Math.max(1, quantity) }
          : i
      );
      setItems(updated);
      await persistItemsToBackend(updated);
    },
    [items, persistItemsToBackend]
  );

  // Add item
  const addItem = useCallback(async () => {
    if (!selectedMenuItemId || newItemQuantity < 1) {
      toast({
        variant: 'destructive',
        title: 'Invalid input',
        description: 'Please select an item and enter quantity >= 1.',
      });
      return;
    }

    const selectedMenuItem = menuItems.find(
      (mi) => mi._id === selectedMenuItemId
    );

    if (!selectedMenuItem) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Selected item not found in menu.',
      });
      return;
    }

    const updatedItems = [...items];
    const existingIndex = updatedItems.findIndex(
      (i) =>
        (typeof i.item === 'object' ? i.item._id : i.item) === selectedMenuItemId &&
        i.user === user?.id
    );

    if (existingIndex !== -1) {
      updatedItems[existingIndex].quantity += newItemQuantity;
      updatedItems[existingIndex].nameAtPurchase = selectedMenuItem.name;
      updatedItems[existingIndex].priceAtPurchase = selectedMenuItem.price;
      updatedItems[existingIndex].item = selectedMenuItem;
    } else {
      updatedItems.push({
        item: selectedMenuItem,
        quantity: newItemQuantity,
        nameAtPurchase: selectedMenuItem.name,
        priceAtPurchase: selectedMenuItem.price,
        user: user?.id || '',
      });
    }

    setItems(updatedItems);
    setNewItemQuantity(1);

    toast({
      title: 'Item added',
      description: 'Item successfully added to the order.',
    });

    await persistItemsToBackend(updatedItems);
  }, [selectedMenuItemId, newItemQuantity, menuItems, items, user, toast, persistItemsToBackend]);

  // Calculate total for a specific user
  const calculateUserTotal = useCallback(
    (userId: string) => {
      return items.reduce(
        (acc, i) =>
          i.user === userId
            ? acc +
              (i.priceAtPurchase ?? (typeof i.item === 'object' ? i.item.price : 0)) *
              i.quantity
            : acc,
        0
      );
    },
    [items]
  );

  // Calculate total for all items
  const calculateTotal = useCallback(() => {
    return items.reduce(
      (acc, i) =>
        acc +
        (i.priceAtPurchase ?? (typeof i.item === 'object' ? i.item.price : 0)) *
        i.quantity,
      0
    );
  }, [items]);

  // Update custom split amounts
  const updateAmountForUser = useCallback(
    (userId: string, newAmount: number) => {
      setAmounts((prev) => {
        const existing = prev.find((a) => a.user === userId);
        if (existing) {
          return prev.map((a) =>
            a.user === userId ? { ...a, amount: newAmount } : a
          );
        } else {
          return [...prev, { user: userId, amount: newAmount }];
        }
      });
    },
    []
  );

  // Pay for self
  const payForSelf = useCallback(async () => {
    if (!groupOrder || !token || !user) return;
    setPaymentProcessing(true);

    try {
      const userTotal = calculateUserTotal(user.id);
      if (userTotal === 0) {
        toast({
          variant: 'destructive',
          title: 'No items',
          description: 'You have not added any items to pay for.',
        });
        return;
      }

      const updatePayload = {
        groupOrderId: groupOrder._id,
        userId: user.id,
        amount: userTotal,
      };

      const res = await fetch(
        `https://campusbites-mxpe.onrender.com/api/v1/groupOrder/pay-self`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!res.ok) {
        const errResp = await res.json();
        throw new Error(errResp.message || 'Failed to initiate payment');
      }

      const data = await res.json();
      await openRazorpayCheckout(data.transaction);
      await fetchGroupOrder();

      toast({
        title: 'Payment initiated',
        description: 'Please complete your payment to confirm your items.',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: (e as Error).message,
      });
    } finally {
      setPaymentProcessing(false);
    }
  }, [groupOrder, token, user, calculateUserTotal, toast, fetchGroupOrder]);

  // Update group order
  const updateOrder = useCallback(async () => {
    if (!groupOrder || !token || !user) return;
    setPaymentProcessing(true);

    try {
      const updatePayload = {
        groupOrderId: groupOrder._id,
        items,
        splitType,
        amounts:
          splitType === 'custom' || splitType === 'equal'
            ? amounts.length > 0
              ? amounts
              : groupOrder.members.map((m) => ({
                  user: m._id,
                  amount: calculateTotal() / groupOrder.members.length,
                }))
            : [{ user: user.id, amount: calculateUserTotal(user.id) }],
        pickupTime: new Date().toISOString(),
        canteen: groupOrder.canteen,
      };

      const res = await fetch(
        `https://campusbites-mxpe.onrender.com/api/v1/groupOrder/add-items-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!res.ok) {
        const errResp = await res.json();
        throw new Error(errResp.message || 'Failed to update group order');
      }
      const data = await res.json();

      setGroupOrder(data.data.groupOrder);

      if (data.data.transactions.length === 0) {
        toast({
          variant: 'default',
          title: 'Update successful',
          description: 'Group order updated but no new transactions created',
        });
        return;
      }

      for (const txn of data.data.transactions) {
        if (txn.user !== user.id) continue;
        await openRazorpayCheckout(txn);
      }

      toast({
        title: 'Payment initiated',
        description: 'Please complete your payment(s) to confirm the order.',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: (e as Error).message,
      });
    } finally {
      setPaymentProcessing(false);
    }
  }, [groupOrder, token, user, items, splitType, amounts, calculateTotal, calculateUserTotal, toast]);

  // Razorpay checkout
  const openRazorpayCheckout = useCallback(
    (transaction: {
      transactionId: string;
      razorpayOrderId: string;
      amount: number;
      orderId: string;
      user: string;
    }) =>
      new Promise<void>((resolve, reject) => {
        if (!window.Razorpay) {
          toast({
            variant: 'destructive',
            title: 'Payment failed',
            description: 'Razorpay SDK not loaded',
          });
          return reject(new Error('Razorpay SDK not loaded'));
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_bnxn34fZ9ODg4f',
          amount: Math.round(transaction.amount * 100),
          currency: 'INR',
          name: 'Campus Bites',
          description: 'Group Order Payment',
          order_id: transaction.razorpayOrderId,
          handler: async function (response: any) {
            try {
              const res = await fetch(`https://campusbites-mxpe.onrender.com/api/v1/payments/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  transactionId: transaction.transactionId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              if (!res.ok) {
                throw new Error('Payment verification failed');
              }

              toast({
                title: 'Payment successful',
                description: 'Thank you for completing the payment!',
              });

              router.push('/thank-you');
              resolve();
            } catch (err) {
              toast({
                variant: 'destructive',
                title: 'Payment verification failed',
                description: (err as Error).message,
              });
              reject(err);
            }
          },
          prefill: { name: user?.name, email: user?.email },
          theme: { color: '#F44336' },
          modal: {
            ondismiss: () => {
              toast({
                variant: 'destructive',
                title: 'Payment cancelled',
                description: 'You cancelled the Razorpay payment.',
              });
              reject(new Error('Payment cancelled'));
            },
          },
        };

        new window.Razorpay(options).open();
      }),
    [toast, token, user, router]
  );

  // Join group
  const handleJoinGroup = useCallback(async () => {
    try {
      if (!token) throw new Error('Not authenticated');
      if (groupOrder && groupOrder.members.find((m) => m._id === user?.id)) {
        toast({ title: 'Already a member' });
        return;
      }
      const res = await fetch('https://campusbites-mxpe.onrender.com/api/v1/groupOrder/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ link: groupLink }),
      });
      if (!res.ok) {
        const errResp = await res.json();
        throw new Error(errResp.message || 'Failed to join group');
      }
      toast({ title: 'Joined group successfully' });
      await fetchGroupOrder();
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Join failed',
        description: (e as Error).message,
      });
    }
  }, [groupOrder, token, user, groupLink, toast, fetchGroupOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading group order details...
          </p>
        </div>
      </div>
    );
  }

  if (!groupOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Group Order Not Found
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The group order may not exist or is temporarily unavailable.
          </p>
          <Button
            onClick={fetchGroupOrder}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            Retry
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="mt-2"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const userIsMember = groupOrder.members.some((m) => m._id === user?.id);

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
          Group Order
        </h1>
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="px-3 py-1 text-xs sm:text-sm rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            {groupOrder.status}
          </span>
        </div>
      </div>

      {/* Group Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="mx-auto sm:mx-0">
            <img
              src={groupOrder.qrCodeUrl}
              alt="Group QR Code"
              className="w-24 h-24 sm:w-32 sm:h-32"
            />
            <p className="mt-2 break-all text-xs sm:text-sm text-center sm:text-left text-gray-600 dark:text-gray-400">
              Group Link: <span className="font-mono">{groupOrder.groupLink}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Canteen
              </h2>
              <p className="text-sm font-medium break-words">
                {groupOrder.canteen}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </h2>
              <p className="text-sm font-medium">{groupOrder.status}</p>
            </div>
          </div>
        </div>
      </div>

      {!userIsMember ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Join this Group Order
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You've been invited to join this group order. Click the button below
            to participate and start adding items.
          </p>
          <Button
            onClick={handleJoinGroup}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-full text-base transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            Join Group Order
          </Button>
        </div>
      ) : (
        <>
          {/* Add Item Section */}
          <Card className="mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Add Item to Your Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <select
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white"
                    value={selectedMenuItemId || ''}
                    onChange={(e) => setSelectedMenuItemId(e.target.value)}
                    disabled={savingItems}
                  >
                    <option value="">Select an item</option>
                    {menuItems.map((mi) => (
                      <option key={mi._id} value={mi._id}>
                        {mi.name} - ₹{mi.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-20">
                  <Input
                    type="number"
                    min={1}
                    className="text-center w-full"
                    value={newItemQuantity}
                    onChange={(e) =>
                      setNewItemQuantity(Math.max(1, +e.target.value))
                    }
                    disabled={savingItems}
                    placeholder="Qty"
                  />
                </div>
                <Button
                  onClick={addItem}
                  className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap w-full sm:w-auto"
                  disabled={savingItems || !selectedMenuItemId}
                >
                  {savingItems ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    'Add Item'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card className="mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Group Order Items
                <span className="ml-2 px-2.5 py-0.5 text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No items added
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Start by adding items from the menu above.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupOrder.members.map((member) => {
                    const memberItems = items.filter((i) => i.user === member._id);
                    if (memberItems.length === 0) return null;

                    return (
                      <div key={member._id}>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {member._id === user?.id ? 'Your Items' : `${member.name}'s Items`}
                        </h4>
                        <div className="space-y-4">
                          {memberItems.map((item, idx) => {
                            const itemId = typeof item.item === 'object' ? item.item._id : item.item;
                            const displayName = item.nameAtPurchase || (typeof item.item === 'object' ? item.item.name : 'Unknown item');
                            const displayPrice = item.priceAtPurchase ?? (typeof item.item === 'object' ? item.item.price : 0);
                            const totalPrice = displayPrice * item.quantity;
                            const isOwnItem = item.user === user?.id;

                            return (
                              <div
                                key={item._id || `${itemId}-${idx}`}
                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                              >
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {displayName}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    ₹{displayPrice.toFixed(2)} × {item.quantity} = ₹
                                    {totalPrice.toFixed(2)}
                                  </p>
                                </div>
                                {isOwnItem && (
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      type="number"
                                      min={1}
                                      className="w-20 text-center"
                                      value={item.quantity}
                                      onChange={(e) =>
                                        updateItemQuantityDebounced(
                                          itemId,
                                          Math.max(1, +e.target.value)
                                        )
                                      }
                                      disabled={savingItems}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                      onClick={() => removeItem(itemId)}
                                      disabled={savingItems}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                            Total: ₹{calculateUserTotal(member._id).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card className="mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Options
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose how you'd like to pay for the order.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="self-pay"
                    type="radio"
                    checked={splitType === 'self'}
                    onChange={() => setSplitType('self')}
                    name="splitType"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <label
                    htmlFor="self-pay"
                    className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Pay for Yourself (₹{calculateUserTotal(user?.id || '').toFixed(2)})
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="equal-split"
                    type="radio"
                    checked={splitType === 'equal'}
                    onChange={() => setSplitType('equal')}
                    name="splitType"
                    disabled={savingItems}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <label
                    htmlFor="equal-split"
                    className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Equal Split (₹{(calculateTotal() / groupOrder.members.length).toFixed(2)} each)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="custom-split"
                    type="radio"
                    checked={splitType === 'custom'}
                    onChange={() => setSplitType('custom')}
                    name="splitType"
                    disabled={savingItems}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <label
                    htmlFor="custom-split"
                    className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Custom Split
                  </label>
                </div>

                {splitType === 'custom' && (
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="grid grid-cols-3 gap-4 font-medium text-sm text-gray-500 dark:text-gray-400 flex-1">
                        <span>Member</span>
                        <span className="text-center">Amount (₹)</span>
                        <span className="text-right">Share</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const equalAmount = calculateTotal() / groupOrder.members.length;
                          const equalAmounts = groupOrder.members.map((member) => ({
                            user: member._id,
                            amount: equalAmount,
                          }));
                          setAmounts(equalAmounts);
                        }}
                        disabled={savingItems}
                        className="ml-4 text-xs"
                      >
                        Split Equally
                      </Button>
                    </div>
                    {groupOrder.members.map((member) => {
                      const userAmount = amounts.find((a) => a.user === member._id) || {
                        user: member._id,
                        amount: 0,
                      };
                      const total = calculateTotal();
                      const percentage = total > 0 ? (userAmount.amount / total) * 100 : 0;

                      return (
                        <div key={member._id} className="grid grid-cols-3 gap-4 items-center">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {member._id === user?.id ? 'You' : member.name}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full flex-shrink-0"
                              onClick={() =>
                                updateAmountForUser(member._id, Math.max(0, userAmount.amount - 10))
                              }
                              disabled={savingItems || userAmount.amount <= 0}
                            >
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </Button>
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                ₹
                              </span>
                              <Input
                                type="number"
                                min={0}
                                step={0.01}
                                value={userAmount.amount}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  updateAmountForUser(
                                    member._id,
                                    isNaN(value) ? 0 : Math.max(0, value)
                                  );
                                }}
                                disabled={savingItems}
                                className="pl-8 text-center text-sm h-8"
                                placeholder="0.00"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full flex-shrink-0"
                              onClick={() =>
                                updateAmountForUser(member._id, userAmount.amount + 10)
                              }
                              disabled={savingItems}
                            >
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </Button>
                          </div>
                          <div className="flex items-center justify-end">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Assigned Total</span>
                        <span
                          className={`font-semibold ${
                            Math.abs(
                              amounts.reduce((sum, a) => sum + a.amount, 0) - calculateTotal()
                            ) < 0.01
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          ₹{amounts.reduce((sum, a) => sum + a.amount, 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-medium">Order Total</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₹{calculateTotal().toFixed(2)}
                        </span>
                      </div>
                      {Math.abs(
                        amounts.reduce((sum, a) => sum + a.amount, 0) - calculateTotal()
                      ) >= 0.01 && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                            ⚠️ Total mismatch: ₹
                            {(
                              amounts.reduce((sum, a) => sum + a.amount, 0) - calculateTotal()
                            ).toFixed(2)}
                          </p>
                          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                            The assigned amounts must equal the order total to proceed with payment.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Button */}
          <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 pt-3 sm:pt-4 pb-4 sm:pb-6 border-t border-gray-200 dark:border-gray-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {(() => {
                const isCustomSplitValid =
                  splitType !== 'custom' ||
                  Math.abs(
                    amounts.reduce((sum, a) => sum + a.amount, 0) - calculateTotal()
                  ) < 0.01;
                const paymentAmount =
                  splitType === 'self'
                    ? calculateUserTotal(user?.id || '')
                    : splitType === 'equal'
                    ? calculateTotal() / groupOrder.members.length
                    : amounts.find((a) => a.user === user?.id)?.amount || 0;

                return (
                  <>
                    <Button
                      disabled={
                        paymentProcessing ||
                        savingItems ||
                        items.length === 0 ||
                        !isCustomSplitValid ||
                        paymentAmount === 0
                      }
                      onClick={splitType === 'self' ? payForSelf : updateOrder}
                      className={`w-full py-4 sm:py-5 text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 ${
                        isCustomSplitValid && paymentAmount > 0
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white'
                          : 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed'
                      }`}
                      size="lg"
                    >
                      {paymentProcessing ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : !isCustomSplitValid ? (
                        'Fix Split Amounts to Continue'
                      ) : paymentAmount === 0 ? (
                        'Add Items to Pay'
                      ) : (
                        `Pay ₹${paymentAmount.toFixed(2)} (${
                          splitType === 'self'
                            ? 'Your Items'
                            : splitType === 'equal'
                            ? 'Equal Split'
                            : 'Custom Split'
                        })`
                      )}
                    </Button>
                    <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                      {!isCustomSplitValid
                        ? 'Custom split amounts must equal the order total'
                        : splitType === 'self'
                        ? 'Pay only for the items you added'
                        : splitType === 'equal'
                        ? 'Pay an equal share of the total order'
                        : 'Pay your assigned share of the total order'}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Transaction History */}
          {groupOrder.paymentDetails.transactions.length > 0 && (
            <Card className="mt-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  {/* Desktop Table */}
                  <div className="hidden sm:block">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Member
                          </th>
                          <th
                            scope="col"
                            className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {groupOrder.paymentDetails.transactions.map((txn) => (
                          <TransactionRowDesktop
                            key={txn.transactionId}
                            txn={txn}
                            member={groupOrder.members.find((m) => m._id === txn.user)}
                            isCurrentUser={txn.user === user?.id}
                            amount={amounts.find((a) => a.user === txn.user)?.amount || 0}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile List */}
                  <div className="sm:hidden space-y-3 p-4">
                    {groupOrder.paymentDetails.transactions.map((txn) => (
                      <div
                        key={txn.transactionId}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700"
                      >
                        <TransactionRowMobile
                          txn={txn}
                          member={groupOrder.members.find((m) => m._id === txn.user)}
                          isCurrentUser={txn.user === user?.id}
                          amount={amounts.find((a) => a.user === txn.user)?.amount || 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}