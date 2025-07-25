"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Populated Menu Item type
interface PopulatedMenuItem {
  _id: string;
  name: string;
  price: number;
}

// Item type supports populated object or string id for `item`
interface Item {
  item: string | PopulatedMenuItem;
  quantity: number;
  nameAtPurchase?: string;
  priceAtPurchase?: number;
  _id?: string; // optional DB subdocument id
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
    splitType: "equal" | "custom";
    amounts: PaymentAmount[];
    payer: string;
    transactions: Transaction[];
  };
  status: string;
}

export default function GroupOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [amounts, setAmounts] = useState<PaymentAmount[]>([]);
  const [payer, setPayer] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [savingItems, setSavingItems] = useState(false);

  const [menuItems, setMenuItems] = useState<{ _id: string; name: string; price: number }[]>([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | null>(null);
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);

  const groupLink = searchParams.get("link");
  if (!groupLink) {
    return <div>Invalid group link.</div>;
  }

  // Ref for debouncing item quantity updates
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => console.log("Razorpay SDK loaded");
      script.onerror = () =>
        toast({
          variant: "destructive",
          title: "Razorpay SDK failed to load",
          description: "Could not load Razorpay payment gateway script",
        });
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script); // cleanup without return
      };
    }
  }, [toast]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?redirect=/group-order?link=${groupLink}`);
    }
  }, [isAuthenticated, router, groupLink]);

  useEffect(() => {
    fetchGroupOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupLink, token]);

  async function fetchGroupOrder() {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/groupOrder/${groupLink}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load group order");
      const data = await res.json();

      setGroupOrder(data.groupOrder);
      setItems(data.groupOrder.items || []);
      setSplitType(data.groupOrder.paymentDetails.splitType);
      setAmounts(data.groupOrder.paymentDetails.amounts || []);
      setPayer(data.groupOrder.paymentDetails.payer);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (err as Error).message || "Failed to load group order",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchMenuItems() {
      if (!groupOrder?.canteen || !token) return;
      try {
        const res = await fetch(`http://localhost:8080/api/v1/items/getItems/${groupOrder.canteen}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch canteen menu");
        const data = await res.json();
        setMenuItems(data?.data || []);
        if (data.data.length > 0 && !selectedMenuItemId) {
          setSelectedMenuItemId(data.data[0]._id);
        }
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Error",
          description: (e as Error).message,
        });
      }
    }
    fetchMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupOrder?.canteen, token]);

  async function persistItemsToBackend(updatedItems: Item[]) {
    if (!groupOrder || !token) return;
    setSavingItems(true);
    try {
      const updatePayload = {
        groupOrderId: groupOrder._id,
        items: updatedItems,
      };

      const res = await fetch(`http://localhost:8080/api/v1/groupOrder/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const errResp = await res.json();
        throw new Error(errResp.message || "Failed to update group order");
      }

      await fetchGroupOrder();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Failed to save items",
        description: (e as Error).message,
      });
    } finally {
      setSavingItems(false);
    }
  }

  // Debounced updateItemQuantity to avoid rapid calls / 429 errors
  function updateItemQuantityDebounced(itemId: string, quantity: number) {
    if (updateTimeout.current) clearTimeout(updateTimeout.current);
    updateTimeout.current = setTimeout(() => {
      performUpdateItemQuantity(itemId, quantity);
    }, 500); // debounce delay 500ms
  }

  async function performUpdateItemQuantity(itemId: string, quantity: number) {
    const updated = items.map((i) =>
      i.item && typeof i.item === "object"
        ? i.item._id === itemId
          ? { ...i, quantity: Math.max(1, quantity) }
          : i
        : i.item === itemId
        ? { ...i, quantity: Math.max(1, quantity) }
        : i
    );
    setItems(updated);
    await persistItemsToBackend(updated);
  }

  async function addItem() {
    if (!selectedMenuItemId || newItemQuantity < 1) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please select an item and enter quantity >= 1.",
      });
      return;
    }

    const selectedMenuItem = menuItems.find((mi) => mi._id === selectedMenuItemId);

    if (!selectedMenuItem) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selected item not found in menu.",
      });
      return;
    }

    const updatedItems = [...items];
    const existingIndex = updatedItems.findIndex((i) =>
      i.item && typeof i.item === "object"
        ? i.item._id === selectedMenuItemId
        : i.item === selectedMenuItemId
    );

    if (existingIndex !== -1) {
      updatedItems[existingIndex].quantity += newItemQuantity;
      updatedItems[existingIndex].nameAtPurchase = selectedMenuItem.name;
      updatedItems[existingIndex].priceAtPurchase = selectedMenuItem.price;
      // Also update item field if you prefer to have populated data 
      updatedItems[existingIndex].item = selectedMenuItem;
    } else {
      updatedItems.push({
        item: selectedMenuItem,
        quantity: newItemQuantity,
        nameAtPurchase: selectedMenuItem.name,
        priceAtPurchase: selectedMenuItem.price,
      });
    }

    setItems(updatedItems);
    setNewItemQuantity(1);

    toast({
      title: "Item added",
      description: "Item successfully added to the order.",
    });

    await persistItemsToBackend(updatedItems);
  }

  function updateAmountForUser(userId: string, newAmount: number) {
    setAmounts((prev) =>
      prev.map((a) => (a.user === userId ? { ...a, amount: newAmount } : a))
    );
  }

  function calculateTotal() {
    return items.reduce(
      (acc, i) =>
        acc +
        (i.priceAtPurchase ??
          (typeof i.item === "object" ? i.item.price : 0)) *
          i.quantity,
      0
    );
  }

  async function updateOrder() {
    if (!groupOrder || !token) return;
    setPaymentProcessing(true);

    try {
      const updatePayload = {
        groupOrderId: groupOrder._id,
        items,
        splitType,
        amounts:
          splitType === "custom"
            ? amounts
            : groupOrder.members.map((m) => ({
                user: m._id,
                amount: calculateTotal() / groupOrder.members.length,
              })),
        payer: payer || groupOrder.creator,
        pickupTime: new Date().toISOString(),
        canteen: groupOrder.canteen,
      };

      const res = await fetch(
        `http://localhost:8080/api/v1/groupOrder/add-items-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!res.ok) {
        const errResp = await res.json();
        throw new Error(errResp.message || "Failed to update group order");
      }
      const data = await res.json();

      setGroupOrder(data.data.groupOrder);

      if (data.data.transactions.length === 0) {
        toast({
          variant: "default",
          title: "Update successful",
          description: "Group order updated but no new transactions created",
        });
        return;
      }

      for (const txn of data.data.transactions) {
        if (txn.userId !== user?.id) continue;
        await openRazorpayCheckout(txn);
      }

      toast({
        title: "Payment initiated",
        description: "Please complete your payment(s) to confirm the order.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: (e as Error).message,
      });
    } finally {
      setPaymentProcessing(false);
    }
  }

  const openRazorpayCheckout = (transaction: {
    transactionId: string;
    razorpayOrderId: string;
    amount: number;
    orderId: string;
    userId: string;
  }) =>
    new Promise<void>((resolve, reject) => {
      if (!window.Razorpay) {
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: "Razorpay SDK not loaded",
        });
        return reject(new Error("Razorpay SDK not loaded"));
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_bnxn34fZ9ODg4f",
        amount: Math.round(transaction.amount * 100),
        currency: "INR",
        name: "Campus Bites",
        description: "Group Order Payment",
        order_id: transaction.razorpayOrderId,
        handler: async function (response: any) {
          try {
            await fetch(`http://localhost:8080/api/v1/payments/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                transactionId: transaction.transactionId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            toast({
              title: "Payment successful",
              description: "Thank you for completing the payment!",
            });

            router.push("/thank-you");

            resolve();
          } catch (err) {
            toast({
              variant: "destructive",
              title: "Payment verification failed",
              description: (err as Error).message,
            });
            reject(err);
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#F44336" },
        modal: {
          ondismiss: () => {
            toast({
              variant: "destructive",
              title: "Payment cancelled",
              description: "You cancelled the Razorpay payment.",
            });
            reject(new Error("Payment cancelled"));
          },
        },
      };

      new window.Razorpay(options).open();
    });

  async function handleJoinGroup() {
    try {
      if (!token) throw new Error("Not authenticated");
      if (groupOrder && groupOrder.members.find((m) => m._id === user?.id)) {
        toast({ title: "Already a member" });
        return;
      }
      const res = await fetch("http://localhost:8080/api/v1/groupOrder/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ link: groupLink }),
      });
      if (!res.ok) {
        const errResp = await res.json();
        throw new Error(errResp.message || "Failed to join group");
      }
      toast({ title: "Joined group successfully" });
      await fetchGroupOrder(); // Await to guarantee state updated before render
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Join failed",
        description: (e as Error).message,
      });
    }
  }

  if (loading) return <div>Loading...</div>;

  if (!groupOrder) {
    return (
      <div>
        <h2>Group Order Not Found</h2>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    );
  }

  const userIsMember = groupOrder.members.some((m) => m._id === user?.id);

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Group Order</h1>

      {/* Group info */}
      <div className="flex items-center space-x-6 mb-6">
        <div>
          <img src={groupOrder.qrCodeUrl} alt="Group QR Code" className="w-32 h-32" />
          <p className="mt-2 break-all text-sm">Group Link: {groupOrder.groupLink}</p>
        </div>
        <div>
          <h2 className="font-semibold">Canteen:</h2>
          <p>{groupOrder.canteen}</p>
        </div>
        <div>
          <h2 className="font-semibold">Status:</h2>
          <p>{groupOrder.status}</p>
        </div>
      </div>

      {!userIsMember ? (
        <Button onClick={handleJoinGroup}>Join Group Order</Button>
      ) : (
        <>
          {/* Add Item Section */}
          <Card className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Add Item to Your Share</h3>
            <div className="flex space-x-3 items-center">
              <select
                className="border rounded p-2 flex-grow"
                value={selectedMenuItemId || ""}
                onChange={(e) => setSelectedMenuItemId(e.target.value)}
                disabled={savingItems}
              >
                {menuItems.map((mi) => (
                  <option key={mi._id} value={mi._id}>
                    {mi.name} - ₹{mi.price.toFixed(2)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                className="w-20 border rounded p-2"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(Math.max(1, +e.target.value))}
                disabled={savingItems}
              />
              <Button
                onClick={addItem}
                className="bg-green-600 hover:bg-green-700"
                disabled={savingItems}
              >
                {savingItems ? "Saving..." : "Add"}
              </Button>
            </div>
          </Card>

          {/* Items List */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p>No items added yet.</p>
              ) : (
                items.map((item, idx) => {
                  let displayName = "Unknown item";
                  let displayPrice = 0;

                  if (typeof item.item === "object" && item.item !== null) {
                    displayName = item.item.name;
                    displayPrice = item.item.price;
                  } else if (item.nameAtPurchase) {
                    displayName = item.nameAtPurchase;
                    displayPrice = item.priceAtPurchase ?? 0;
                  }

                  return (
                    <div key={item._id || idx} className="flex justify-between mb-2 items-center">
                      <div>
                        <strong>{displayName}</strong> - ₹{displayPrice.toFixed(2)}
                      </div>
                      <Input
                        type="number"
                        min={1}
                        className="w-20"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantityDebounced(
                          typeof item.item === "object" ? item.item._id : item.item,
                          +e.target.value
                        )}
                        disabled={savingItems}
                      />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Payment Split */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Split</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>
                  <input
                    type="radio"
                    checked={splitType === "equal"}
                    onChange={() => setSplitType("equal")}
                    name="splitType"
                    disabled={savingItems}
                  />{" "}
                  Equal split
                </Label>
                <Label className="ml-4">
                  <input
                    type="radio"
                    checked={splitType === "custom"}
                    onChange={() => setSplitType("custom")}
                    name="splitType"
                    disabled={savingItems}
                  />{" "}
                  Custom split
                </Label>
              </div>
              {splitType === "custom" &&
                groupOrder.members.map((member) => {
                  const userAmount =
                    amounts.find((a) => a.user === member._id) || { user: member._id, amount: 0 };
                  return (
                    <div key={member._id} className="flex items-center space-x-2 mb-2">
                      <span>{member.name}</span>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={userAmount.amount}
                        onChange={(e) =>
                          updateAmountForUser(member._id, parseFloat(e.target.value) || 0)
                        }
                        disabled={savingItems}
                        className="w-24"
                      />
                    </div>
                  );
                })}
            </CardContent>
          </Card>

          {/* Payer Select */}
          <Card>
            <CardHeader>
              <CardTitle>Payee Payer</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={payer || ""}
                onChange={(e) => setPayer(e.target.value)}
                className="w-full border rounded p-2"
                disabled={savingItems}
              >
                {groupOrder.members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Update & Pay */}
          <Button
            disabled={paymentProcessing || savingItems}
            onClick={updateOrder}
            className="mt-6 w-full bg-red-600 text-white font-bold"
          >
            {paymentProcessing ? "Processing..." : "Update & Pay"}
          </Button>

          {/* Transaction Summary */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Transaction Summary</h2>
            {groupOrder.paymentDetails.transactions.length === 0 ? (
              <p>No transactions initiated yet.</p>
            ) : (
              groupOrder.paymentDetails.transactions.map((txn) => {
                const member = groupOrder.members.find((m) => m._id === txn.user);
                return (
                  <div key={txn.transactionId} className="mb-2">
                    <strong>{member?.name}:</strong> {txn.status}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
