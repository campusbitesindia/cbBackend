"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { ArrowLeft, CreditCard, Smartphone, Truck, Loader2, Shield, CheckCircle } from "lucide-react"
import Image from "next/image"
import { createOrder } from "@/services/orderService"
import { User } from "@/types";

interface PaymentData {
  method: "cod" | "upi" | "card"
  upiDetails?: {
    upiId: string
    paymentApp: string
  }
  cardDetails?: {
    cardNumber: string
    expiryMonth: string
    expiryYear: string
    cvv: string
    holderName: string
  }
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { cart, clearCart, totalPrice } = useCart()
  const { toast } = useToast()
  const { isAuthenticated, token, user } = useAuth();
  const [latestUser, setLatestUser] = useState<User | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi" | "card">("cod")
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderTotal, setOrderTotal] = useState(0)

  // UPI Form State
  const [upiId, setUpiId] = useState("")
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay")

  // Card Form State
  const [cardNumber, setCardNumber] = useState("")
  const [expiryMonth, setExpiryMonth] = useState("")
  const [expiryYear, setExpiryYear] = useState("")
  const [cvv, setCvv] = useState("")
  const [holderName, setHolderName] = useState("")

  useEffect(() => {
    // Auth guard
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search)
      router.replace(`/login?redirect=${redirect}`)
      return
    }

    // Fetch latest user info
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8080/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLatestUser(data.user || null);
        }
      } catch (e) { /* ignore */ }
    };
    fetchUser();

    // Get order total from URL params or calculate from cart
    const total = searchParams.get('total')
    setOrderTotal(total ? parseFloat(total) : totalPrice + 25)
  }, [searchParams, totalPrice, isAuthenticated, token])

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      let paymentData: PaymentData = { method: paymentMethod }

      // Validate and prepare payment data based on method
      if (paymentMethod === "upi") {
        if (!upiId.trim()) {
          throw new Error("Please enter a valid UPI ID")
        }
        if (!upiId.includes("@")) {
          throw new Error("Please enter a valid UPI ID (e.g., user@paytm)")
        }
        paymentData.upiDetails = {
          upiId: upiId.trim(),
          paymentApp: selectedUpiApp
        }
      } else if (paymentMethod === "card") {
        // Basic card validation
        if (!cardNumber.replace(/\s/g, "").match(/^\d{16}$/)) {
          throw new Error("Please enter a valid 16-digit card number")
        }
        if (!expiryMonth || !expiryYear) {
          throw new Error("Please enter card expiry date")
        }
        if (!cvv.match(/^\d{3,4}$/)) {
          throw new Error("Please enter a valid CVV")
        }
        if (!holderName.trim()) {
          throw new Error("Please enter cardholder name")
        }

        paymentData.cardDetails = {
          cardNumber: cardNumber.replace(/\s/g, ""),
          expiryMonth,
          expiryYear,
          cvv,
          holderName: holderName.trim()
        }
      }

      // Process the order with payment information
      await processOrder(paymentData)

    } catch (error: any) {
      console.error("Payment error:", error)
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const processOrder = async (paymentData: PaymentData) => {
    // Simulate payment processing for UPI and Card
    if (paymentData.method === "upi") {
      // Simulate UPI payment confirmation
      await new Promise(resolve => setTimeout(resolve, 2000))
      // In real implementation, this would integrate with UPI payment gateway
    } else if (paymentData.method === "card") {
      // Simulate card payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      // In real implementation, this would integrate with card payment gateway
    }

    // Get cart data and canteen information
    if (cart.length === 0) {
      throw new Error('Cart is empty')
    }

    const firstItemId = cart[0].id
    const itemResponse = await fetch(`http://localhost:8080/api/menu/item/${firstItemId}`)
    let canteenId

    if (itemResponse.ok) {
      const itemData = await itemResponse.json()
      canteenId = itemData.data.canteen
    } else {
              const canteensResponse = await fetch('http://localhost:8080/api/v1/canteens')
      const canteensData = await canteensResponse.json()
              if (canteensData.canteens && canteensData.canteens.length > 0) {
          canteenId = canteensData.canteens[0]._id
      } else {
        throw new Error('No canteens available')
      }
    }

    // Create order with payment information
    const orderData = {
      canteen: canteenId,
      items: cart.map(item => ({ item: item.id, quantity: item.quantity })),
      total: orderTotal,
      payment: {
        method: paymentData.method,
        status: (paymentData.method === "cod" ? "pending" : "completed") as "pending" | "completed",
        transactionId: paymentData.method !== "cod" ? `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}` : undefined,
        upiDetails: paymentData.upiDetails || undefined,
        cardDetails: paymentData.cardDetails ? {
          lastFourDigits: paymentData.cardDetails.cardNumber.slice(-4),
          cardType: getCardType(paymentData.cardDetails.cardNumber),
          holderName: paymentData.cardDetails.holderName
        } : undefined,
        paidAt: paymentData.method !== "cod" ? new Date().toISOString() : undefined
      }
    }

    if (!token) {
      throw new Error('Authentication token not found')
    }

    const response = await createOrder(orderData, token)

    // Success
    toast({
      title: "Order Placed Successfully!",
      description: `Your order has been placed with ${paymentData.method.toUpperCase()} payment.`
    })

    clearCart()
    router.push("/orders")
  }

  const getCardType = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, "")
    if (number.startsWith("4")) return "visa"
    if (number.startsWith("5") || number.startsWith("2")) return "mastercard"
    return "other"
  }

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Payment</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>Order Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Items ({cart.length})</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹25.00</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span>₹{orderTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Payment Method</CardTitle>
            <CardDescription>Select your preferred payment option</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value: "cod" | "upi" | "card") => setPaymentMethod(value)}
              className="space-y-4"
            >
              {/* Cash on Delivery */}
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Truck className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-gray-500">Pay when your order arrives</div>
                    </div>
                  </div>
                </Label>
              </div>

              {/* UPI Payment */}
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">UPI Payment</div>
                      <div className="text-sm text-gray-500">Pay using GPay, PhonePe, Paytm</div>
                    </div>
                  </div>
                </Label>
              </div>

              {/* Card Payment */}
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-sm text-gray-500">Visa, Mastercard, Rupay</div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {/* UPI Form */}
            {paymentMethod === "upi" && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
                <h4 className="font-medium mb-4">UPI Payment Details</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Preferred UPI App</Label>
                    <RadioGroup
                      value={selectedUpiApp}
                      onValueChange={setSelectedUpiApp}
                      className="flex flex-wrap gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gpay" id="gpay" />
                        <Label htmlFor="gpay">Google Pay</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phonepe" id="phonepe" />
                        <Label htmlFor="phonepe">PhonePe</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paytm" id="paytm" />
                        <Label htmlFor="paytm">Paytm</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Card Form */}
            {paymentMethod === "card" && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border">
                <h4 className="font-medium mb-4">Card Payment Details</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expiryMonth">Month</Label>
                      <select
                        id="expiryMonth"
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                            {String(i + 1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="expiryYear">Year</Label>
                      <select
                        id="expiryYear"
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">YY</option>
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                            {String(new Date().getFullYear() + i).slice(-2)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        maxLength={4}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="holderName">Cardholder Name</Label>
                    <Input
                      id="holderName"
                      placeholder="John Doe"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Button */}
            {latestUser?.isBanned && (
              <div className="w-full mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 font-semibold text-center">
                You are banned by admin and cannot place orders.
              </div>
            )}
            <Button
              onClick={handlePayment}
              disabled={isProcessing || latestUser?.isBanned}
              className={`w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-base ${latestUser?.isBanned ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {paymentMethod === "cod" ? "Place Order" : `Pay ₹${orderTotal.toFixed(2)}`}
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-green-700">
                <Shield className="h-4 w-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 