"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"
import { Order } from "@/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Loader2, 
  Inbox, 
  AlertCircle, 
  Eye, 
  Clock, 
  MapPin, 
  CreditCard, 
  Package, 
  ChefHat, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Receipt,
  Calendar,
  ShoppingBag,
  Star,
  ArrowRight,
  RefreshCw
} from "lucide-react"
import { getMyOrders, getOrderById, AuthError } from "@/services/orderService"
import { motion, AnimatePresence, useInView, useSpring, useTransform } from "framer-motion"

// Animated Counter Component
function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 })
  const display = useTransform(spring, (current) => Math.round(current))

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
}

export default function OrdersPage() {
  const { isAuthenticated, token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderDetailLoading, setOrderDetailLoading] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders()
    }
  }, [isAuthenticated, token])

      const fetchOrders = async () => {
        try {
          setLoading(true)
          setError(null)
      const response = await getMyOrders(token!)
          setOrders(response.data)
        } catch (err: any) {
          if (err instanceof AuthError) {
        setError("Session expired. Please login again to view your orders.")
          } else {
            setError(err.message || "Failed to fetch orders")
          }
        } finally {
          setLoading(false)
        }
      }

  const handleViewDetails = async (orderId: string) => {
    try {
      setOrderDetailLoading(true)
      setSelectedOrder(null) // Clear previous order
      setIsDetailModalOpen(true) // Open modal immediately to show loading
      const response = await getOrderById(orderId, token!)
      setSelectedOrder(response.data)
    } catch (err: any) {
      console.error("Failed to fetch order details:", err)
      setIsDetailModalOpen(false) // Close modal on error
      // Show error toast or message
      alert("Failed to load order details. Please try again.")
    } finally {
      setOrderDetailLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center relative overflow-hidden transition-colors duration-500">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-orange-200/30 to-red-200/30 dark:from-orange-200/20 dark:to-red-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 dark:from-blue-200/20 dark:to-purple-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <Card className="w-full max-w-md mx-4 shadow-2xl border-0 bg-white/90 dark:bg-white/80 backdrop-blur-xl relative z-10">
          <CardContent className="pt-12 pb-8 px-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-900">Please Sign In</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-700 mb-8 text-lg">
              You need to be logged in to view your order history and track your delicious meals.
            </CardDescription>
            <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Link href="/login">
                <ArrowRight className="w-5 h-5 mr-2" />
                Sign In to Continue
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not available"
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"
    
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      placed: {
        color: "bg-blue-500",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        icon: Receipt,
        label: "Order Placed",
        description: "Your order has been received"
      },
      preparing: {
        color: "bg-yellow-500",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        icon: ChefHat,
        label: "Preparing",
        description: "Your food is being prepared"
      },
      ready: {
        color: "bg-purple-500",
        bgColor: "bg-purple-50",
        textColor: "text-purple-700",
        icon: Package,
        label: "Ready for Pickup",
        description: "Your order is ready"
      },
      completed: {
        color: "bg-green-500",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        icon: CheckCircle2,
        label: "Completed",
        description: "Order delivered successfully"
      },
      cancelled: {
        color: "bg-red-500",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        icon: XCircle,
        label: "Cancelled",
        description: "Order was cancelled"
      }
    }
    return configs[status as keyof typeof configs] || configs.placed
  }

  const getPaymentConfig = (method: string) => {
    const configs = {
      cod: {
        icon: Package,
        label: "Cash on Delivery",
        color: "text-green-600 bg-green-50"
      },
      upi: {
        icon: CreditCard,
        label: "UPI Payment",
        color: "text-blue-600 bg-blue-50"
      },
      card: {
        icon: CreditCard,
        label: "Card Payment",
        color: "text-purple-600 bg-purple-50"
      }
    }
    return configs[method as keyof typeof configs] || configs.cod
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 transition-colors duration-500">
        {/* Modern Header */}
        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/20 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  My Orders
                </h1>
                <p className="text-gray-600 dark:text-blue-200 mt-1">Track your delicious journey</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          <motion.div 
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-6"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Loader2 className="h-8 w-8 text-white" />
              </motion.div>
              <motion.div 
                className="absolute -inset-4 bg-gradient-to-r from-orange-200 to-red-200 rounded-full blur-xl opacity-20"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
          </div>
            <motion.p 
              className="text-gray-600 dark:text-blue-200 text-lg font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Loading your orders...
            </motion.p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 transition-colors duration-500">
        {/* Modern Header */}
        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/20 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              My Orders
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          <Alert className="max-w-2xl mx-auto border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-800 dark:text-red-300 font-semibold">Oops! Something went wrong</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-400 mb-4">{error}</AlertDescription>
            <div className="flex gap-3">
            {error.includes("Session expired") && (
                <Button asChild className="bg-red-600 hover:bg-red-700">
                <Link href="/login">Login Again</Link>
              </Button>
            )}
              <Button onClick={fetchOrders} variant="outline" className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Light mode background */}
        <div className="absolute inset-0 opacity-100 dark:opacity-0 transition-opacity duration-500">
          <motion.div
            className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        {/* Dark mode background */}
        <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500">
          <motion.div
            className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-2xl"
            animate={{
              x: [-100, 100, -100],
              y: [-50, 50, -50],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </div>

      {/* Modern Header with Stats */}
      <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                My Orders
              </h1>
              <p className="text-gray-600 dark:text-blue-200 mt-1">Track your delicious journey</p>
            </div>
            <div className="flex items-center gap-6">
                              <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    <AnimatedCounter value={orders.length} />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-blue-200">Total Orders</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-2xl font-bold text-green-500 dark:text-green-400">
                    <AnimatedCounter value={orders.filter(o => o.status === 'completed').length} />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-blue-200">Completed</div>
                </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {orders.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative mb-8">
              <motion.div 
                className="w-32 h-32 bg-gradient-to-r from-blue-200 to-purple-300 rounded-full flex items-center justify-center mx-auto shadow-lg"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Inbox className="w-16 h-16 text-white" />
              </motion.div>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 to-purple-300 rounded-full blur-xl opacity-30"></div>
            </div>
            <motion.h3 
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              No orders yet
            </motion.h3>
            <motion.p 
              className="text-gray-600 dark:text-blue-200 text-lg mb-8 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your delicious orders will appear here. Start exploring our amazing restaurants!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl shadow-lg">
                <Link href="/menu">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Start Ordering
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status)
              const StatusIcon = statusConfig.icon
              
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: [0.32, 0.72, 0, 1]
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
                  }}
                  className="cursor-pointer"
                >
                <Card className="overflow-hidden border-0 shadow-lg bg-white/90 backdrop-blur-sm group relative">
                  <CardHeader className={`${statusConfig.bgColor} border-b border-gray-100`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${statusConfig.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          <StatusIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-800">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 text-gray-600 mt-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.createdAt)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0 px-4 py-2 font-semibold`}>
                          {statusConfig.label}
                        </Badge>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">₹{order.total.toFixed(2)}</div>
                          {order.payment && (
                            <div className="text-sm text-gray-500 capitalize">
                              {getPaymentConfig(order.payment.method).label}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-gray-800">{order.canteen?.name || 'Unknown Restaurant'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{order.items.length} items</span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="space-y-3 mb-6">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            <Image
                              src={item.item?.image || "/placeholder.svg"}
                              alt={item.item?.name || 'Item'}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 truncate">
                              {item.item?.name || 'Item No Longer Available'}
                            </h4>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-700">
                              ₹{(item.quantity * (item.item?.price || 0)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-center py-2 text-gray-500 text-sm">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{statusConfig.description}</span>
                      </div>
                      
                      <div className="flex gap-3">
                        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                          <DialogTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                variant="outline" 
                                className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 group"
                                onClick={() => handleViewDetails(order._id)}
                                disabled={orderDetailLoading}
                              >
                                {orderDetailLoading ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Loader2 className="w-4 h-4 mr-2" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    whileHover={{ scale: 1.2 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                  </motion.div>
                                )}
                                View Details
                              </Button>
                            </motion.div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
                            {orderDetailLoading ? (
                              <>
                                <DialogHeader>
                                  <DialogTitle>Loading Order Details...</DialogTitle>
                                </DialogHeader>
                                <div className="flex items-center justify-center py-20">
                                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                                </div>
                              </>
                            ) : selectedOrder ? (
                              <>
                                <DialogHeader className="border-b pb-6 dark:border-slate-700">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 ${getStatusConfig(selectedOrder.status).color} rounded-xl flex items-center justify-center shadow-lg`}>
                                      {(() => {
                                        const StatusIcon = getStatusConfig(selectedOrder.status).icon;
                                        return <StatusIcon className="w-7 h-7 text-white" />;
                                      })()}
                                    </div>
                                    <div>
                                      <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                        Order #{selectedOrder._id.slice(-8).toUpperCase()}
                                      </DialogTitle>
                                      <p className="text-gray-600 dark:text-gray-400 mt-1">{formatDate(selectedOrder.createdAt)}</p>
                                    </div>
                                  </div>
                                </DialogHeader>
                                <OrderDetailsContent order={selectedOrder} />
                              </>
                            ) : (
                              <>
                                <DialogHeader>
                                  <DialogTitle>Order Details</DialogTitle>
                                </DialogHeader>
                                <div className="flex items-center justify-center py-20">
                                  <p className="text-gray-500 dark:text-gray-400">No order selected</p>
                                </div>
                              </>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {order.status === "completed" && (
                          <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Order Details Content Component
function OrderDetailsContent({ order }: { order: Order | null }) {
  if (!order) return null

  const getStatusConfig = (status: string) => {
    const configs = {
      placed: { color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-50", icon: Receipt, label: "Order Placed" },
      preparing: { color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50", icon: ChefHat, label: "Preparing" },
      ready: { color: "bg-purple-500", textColor: "text-purple-700", bgColor: "bg-purple-50", icon: Package, label: "Ready for Pickup" },
      completed: { color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50", icon: CheckCircle2, label: "Completed" },
      cancelled: { color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50", icon: XCircle, label: "Cancelled" }
    }
    return configs[status as keyof typeof configs] || configs.placed
  }

  const getOrderTimeline = (order: Order) => {
    const timeline = [
      { status: 'placed', label: 'Order Placed', icon: Receipt, completed: ['placed', 'preparing', 'ready', 'completed'].includes(order.status) },
      { status: 'preparing', label: 'Preparing', icon: ChefHat, completed: ['preparing', 'ready', 'completed'].includes(order.status) },
      { status: 'ready', label: 'Ready', icon: Package, completed: ['ready', 'completed'].includes(order.status) },
      { status: 'completed', label: 'Completed', icon: CheckCircle2, completed: order.status === 'completed' }
    ]

    if (order.status === 'cancelled') {
      return [
        { status: 'placed', label: 'Order Placed', icon: Receipt, completed: true },
        { status: 'cancelled', label: 'Cancelled', icon: XCircle, completed: true }
      ]
    }

    return timeline
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 py-6">
      {/* Order Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Order Timeline
        </h3>
        <div className="space-y-6 relative">
          {/* Progress Line */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200 dark:bg-slate-700">
            <motion.div
              className="bg-gradient-to-b from-green-500 to-blue-500 w-full origin-top"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: getOrderTimeline(order).filter(s => s.completed).length / getOrderTimeline(order).length }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
                </div>
          
          {getOrderTimeline(order).map((step, index) => {
            const StepIcon = step.icon
            return (
              <motion.div 
                key={step.status} 
                className="flex items-center gap-4 relative z-10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <motion.div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg ${
                    step.completed 
                      ? step.status === 'cancelled' 
                        ? 'bg-red-500' 
                        : 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <StepIcon className={`w-5 h-5 ${step.completed ? 'text-white' : 'text-gray-400 dark:text-slate-500'}`} />
                </motion.div>
                <div className="flex-1">
                  <motion.div 
                    className={`font-medium ${step.completed ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-slate-500'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.5 }}
                  >
                    {step.label}
                  </motion.div>
                  {step.completed && order.status === step.status && (
                    <motion.div 
                      className="text-sm text-green-600 font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.2 + 0.7 }}
                    >
                      Current Status
                    </motion.div>
                   )}
                 </div>
              </motion.div>
            )
          })}
                 </div>
              </div>

      {/* Restaurant & Payment Info */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Restaurant Details
          </h3>
          <Card className="p-4 bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
                 </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{order.canteen?.name || 'Unknown Restaurant'}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Campus Restaurant</p>
              </div>
            </div>
          </Card>
        </div>

        {order.payment && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Information
            </h3>
            <Card className="p-4 bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Method:</span>
                  <span className="font-medium capitalize dark:text-gray-200">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge className={`${
                    order.payment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                    order.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                  } border-0`}>
                    {order.payment.status}
                  </Badge>
                </div>
                {order.payment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                    <span className="font-mono text-sm dark:text-gray-300">{order.payment.transactionId}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
          </div>
          
      {/* Order Items */}
      <div className="md:col-span-2 border-t pt-6 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Order Items ({order.items.length})
        </h3>
            <div className="space-y-4">
          {order.items.map((item) => (
            <Card key={item._id} className="p-4 border-gray-200 dark:border-slate-700 dark:bg-slate-800/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-slate-700 flex-shrink-0">
                     <Image
                       src={item.item?.image || "/placeholder.svg"}
                    alt={item.item?.name || 'Item'}
                       fill
                       className="object-cover"
                     />
                   </div>
                   <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                       {item.item?.name || 'Item No Longer Available'}
                     </h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Quantity: {item.quantity || 'N/A'}</span>
                    <span className="text-gray-600 dark:text-gray-400">Price: ₹{item.item?.price || 0}</span>
                  </div>
                     {(!item.item || item.item.name === 'Item No Longer Available') && (
                    <p className="text-sm text-red-500 italic mt-1">This item may have been removed from the menu</p>
                     )}
                   </div>
                   <div className="text-right">
                  <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    ₹{((item.quantity || 0) * (item.item?.price || 0)).toFixed(2)}
            </div>
                </div>
              </div>
            </Card>
          ))}
            </div>

        {/* Order Total */}
        <Card className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-700 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">Total Amount</div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">₹{order.total.toFixed(2)}</div>
          </div>
        </Card>
        </div>
    </div>
  )
}
