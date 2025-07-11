"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, TrendingUp, DollarSign, Package, Users, Star, Eye } from "lucide-react"

export default function CampusDashboard() {
  const [activeOrders] = useState([
    {
      id: "ORD001",
      customer: "John Doe",
      items: "2x Butter Chicken, 1x Naan",
      amount: "₹450",
      time: "5 min ago",
      status: "preparing",
    },
    {
      id: "ORD002",
      customer: "Sarah Wilson",
      items: "1x Margherita Pizza",
      amount: "₹320",
      time: "12 min ago",
      status: "ready",
    },
    {
      id: "ORD003",
      customer: "Mike Johnson",
      items: "3x Veg Biryani",
      amount: "₹540",
      time: "18 min ago",
      status: "delivered",
    },
  ])

  const stats = {
    todayRevenue: "₹12,450",
    todayOrders: 28,
    avgRating: 4.8,
    totalCustomers: 156,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Campus Partner Dashboard</h1>
              <p className="text-gray-400 text-lg">Manage your restaurant operations</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Today's Revenue</p>
                    <p className="text-2xl font-bold text-white">{stats.todayRevenue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Today's Orders</p>
                    <p className="text-2xl font-bold text-white">{stats.todayOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Average Rating</p>
                    <p className="text-2xl font-bold text-white">{stats.avgRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-red-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Customers</p>
                    <p className="text-2xl font-bold text-white">{stats.totalCustomers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              Recent Orders
            </TabsTrigger>
            <TabsTrigger
              value="menu"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              Menu Management
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <div className="grid gap-4">
              {activeOrders.map((order) => (
                <Card key={order.id} className="bg-gray-800/30 border-gray-700/30 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{order.id}</h3>
                          <p className="text-gray-400">{order.customer}</p>
                          <p className="text-gray-300 text-sm">{order.items}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{order.amount}</p>
                        <p className="text-gray-400 text-sm">{order.time}</p>
                        <Badge
                          className={`mt-2 ${
                            order.status === "preparing"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : order.status === "ready"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <Card className="bg-gray-800/30 border-gray-700/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Menu Management</CardTitle>
                <CardDescription className="text-gray-400">Add, edit, or remove items from your menu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Menu Management</h3>
                  <p className="text-gray-400 mb-6">This feature is coming soon!</p>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    Add New Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gray-800/30 border-gray-700/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Analytics & Insights</CardTitle>
                <CardDescription className="text-gray-400">Track your restaurant's performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-400 mb-6">Detailed analytics coming soon!</p>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    <Eye className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
