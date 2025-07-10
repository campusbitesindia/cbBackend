"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Clock, Store, Mail, Phone, MapPin, FileText, Users, TrendingUp } from "lucide-react"
import { Line, Pie, Bar } from "react-chartjs-2"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement, // <-- add this
  ArcElement, // <-- add this for Pie charts
  ChartOptions,
} from "chart.js"
// @ts-ignore
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement, ChartDataLabels)

interface PendingRequest {
  id: string
  restaurantName: string
  ownerName: string
  email: string
  phone: string
  address: string
  description: string
  operatingHours: string
  cuisineType: string
  submittedAt: string
  status: "pending" | "approved" | "rejected"
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [summary, setSummary] = useState<any>(null)
  const [usersMonthly, setUsersMonthly] = useState<any[]>([])
  const [ordersMonthly, setOrdersMonthly] = useState<any[]>([])
  const [revenueDaily, setRevenueDaily] = useState<any[]>([])
  const [revenueWeekly, setRevenueWeekly] = useState<any[]>([])
  const [revenueMonthly, setRevenueMonthly] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderStatus, setOrderStatus] = useState<any>(null)
  const [userRoles, setUserRoles] = useState<any>(null)
  const [topSpenders, setTopSpenders] = useState<any[]>([])
  const [topCanteens, setTopCanteens] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        // Use only the correct endpoints as provided
        const [summaryRes, usersRes, userRolesRes, topSpendersRes, ordersRes, orderStatusRes, topCanteensRes, revenueTotalRes, revenueByCampusCanteenRes, revenueTopCanteensRes, revenueTopCampusesRes, revenuePaymentBreakdownRes, revenueDailyRes, revenueWeeklyRes, revenueMonthlyRes] = await Promise.all([
          fetch("/api/v1/admin/totals"),
          fetch("/api/v1/admin/users/monthly"),
          fetch("/api/v1/admin/users/count-by-role"),
          fetch("/api/v1/admin/users/top-spenders"),
          fetch("/api/v1/admin/orders/monthly"),
          fetch("/api/v1/admin/orders/status-wise"),
          fetch("/api/v1/admin/orders/top-tcanteens"),
          fetch("/api/v1/admin/revenue/total"),
          fetch("/api/v1/admin/revenue/by-campus-canteen"),
          fetch("/api/v1/admin/revenue/top-canteens"),
          fetch("/api/v1/admin/revenue/top-campuses"),
          fetch("/api/v1/admin/revenue/payment-breakdown"),
          fetch("/api/v1/admin/revenue/daily"),
          fetch("/api/v1/admin/revenue/weekly"),
          fetch("/api/v1/admin/revenue/monthly"),
        ])
        if (!summaryRes.ok || !usersRes.ok || !userRolesRes.ok || !topSpendersRes.ok || !ordersRes.ok || !orderStatusRes.ok || !topCanteensRes.ok || !revenueTotalRes.ok || !revenueByCampusCanteenRes.ok || !revenueTopCanteensRes.ok || !revenueTopCampusesRes.ok || !revenuePaymentBreakdownRes.ok || !revenueDailyRes.ok || !revenueWeeklyRes.ok || !revenueMonthlyRes.ok) {
          throw new Error("API error")
        }
        const [summaryData, usersData, userRolesData, topSpendersData, ordersData, orderStatusData, topCanteensData, revenueTotalData, revenueByCampusCanteenData, revenueTopCanteensData, revenueTopCampusesData, revenuePaymentBreakdownData, revenueDailyData, revenueWeeklyData, revenueMonthlyData] = await Promise.all([
          summaryRes.json(),
          usersRes.json(),
          userRolesRes.json(),
          topSpendersRes.json(),
          ordersRes.json(),
          orderStatusRes.json(),
          topCanteensRes.json(),
          revenueTotalRes.json(),
          revenueByCampusCanteenRes.json(),
          revenueTopCanteensRes.json(),
          revenueTopCampusesRes.json(),
          revenuePaymentBreakdownRes.json(),
          revenueDailyRes.json(),
          revenueWeeklyRes.json(),
          revenueMonthlyRes.json(),
        ])
        setSummary(summaryData)
        setUsersMonthly(usersData)
        // Transform userRolesData array to object: [{_id: 'student', count: 5}] => {student: 5}
        const userRolesObj: Record<string, number> = {}
        userRolesData.forEach((item: any) => { userRolesObj[item._id] = item.count })
        setUserRoles(userRolesObj)
        setTopSpenders(topSpendersData)
        setOrdersMonthly(ordersData)
        // Transform orderStatusData array to object: [{_id: 'completed', count: 10}] => {completed: 10}
        const orderStatusObj: Record<string, number> = {}
        orderStatusData.forEach((item: any) => { orderStatusObj[item._id] = item.count })
        setOrderStatus(orderStatusObj)
        setTopCanteens(topCanteensData)
        setRevenueDaily(revenueDailyData)
        setRevenueWeekly(revenueWeeklyData)
        setRevenueMonthly(revenueMonthlyData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Remove handleApprove and handleReject
  // Remove formatDate if not used elsewhere

  // Remove pendingCount, approvedCount, rejectedCount, and pendingRequests.length usages
  // Instead, use summary data for the cards

  // Chart data helpers (fix field names)
  const usersChartData = {
    labels: usersMonthly.map((u) => u._id),
    datasets: [
      {
        label: "New Users",
        data: usersMonthly.map((u) => u.count),
        borderColor: "#f87171",
        backgroundColor: "#f87171",
      },
    ],
  }
  const ordersChartData = {
    labels: ordersMonthly.map((o) => o._id),
    datasets: [
      {
        label: "Orders",
        data: ordersMonthly.map((o) => o.count),
        borderColor: "#60a5fa",
        backgroundColor: "#60a5fa",
      },
    ],
  }
  const revenueChartData = {
    labels: revenueMonthly.map((r) => r._id),
    datasets: [
      {
        label: "Revenue",
        data: revenueMonthly.map((r) => r.revenue || r.total || r.totalAmount),
        borderColor: "#34d399",
        backgroundColor: "#34d399",
      },
    ],
  }

  // New chart data helpers
  const orderStatusChartData = orderStatus
    ? {
        labels: Object.keys(orderStatus),
        datasets: [
          {
            label: "Order Status",
            data: Object.values(orderStatus),
            backgroundColor: ["#fbbf24", "#34d399", "#f87171", "#a78bfa"],
            borderColor: ["#f59e42", "#059669", "#ef4444", "#7c3aed"],
            borderWidth: 1,
          },
        ],
      }
    : { labels: [], datasets: [] }


  const userRolesChartData = userRoles
    ? {
        labels: Object.keys(userRoles),
        datasets: [
          {
            label: "User Roles",
            data: Object.values(userRoles),
            backgroundColor: ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"],
            borderColor: ["#ef4444", "#2563eb", "#059669", "#f59e42", "#7c3aed"],
            borderWidth: 1,
          },
        ],
      }
    : { labels: [], datasets: [] }

  const revenueDailyChartData = {
    labels: revenueDaily.map((r) => r._id || r.date),
    datasets: [
      {
        label: "Daily Revenue",
        data: revenueDaily.map((r) => r.revenue || r.total || r.totalAmount),
        borderColor: "#fbbf24",
        backgroundColor: "#fde68a",
      },
    ],
  }
  const revenueWeeklyChartData = {
    labels: revenueWeekly.map((r) => r._id || r.week),
    datasets: [
      {
        label: "Weekly Revenue",
        data: revenueWeekly.map((r) => r.revenue || r.total || r.totalAmount),
        borderColor: "#60a5fa",
        backgroundColor: "#bae6fd",
      },
    ],
  }
  const revenueMonthlyChartData = {
    labels: revenueMonthly.map((r) => r._id || r.month),
    datasets: [
      {
        label: "Monthly Revenue",
        data: revenueMonthly.map((r) => r.revenue || r.total || r.totalAmount),
        borderColor: "#34d399",
        backgroundColor: "#bbf7d0",
      },
    ],
  }
  const topSpendersChartData = {
    labels: topSpenders.map((u) => u.name || u.username || u.email),
    datasets: [
      {
        label: "Amount Spent",
        data: topSpenders.map((u) => u.amount || u.totalSpent),
        backgroundColor: "#a78bfa",
        borderColor: "#7c3aed",
        borderWidth: 1,
      },
    ],
  }
  // Top Canteens by Order Volume chart data with red and white colors and percentage display
  const totalCanteenOrders = topCanteens.reduce((sum: number, c: any) => sum + (c.totalOrders || c.count || c.orderCount || 0), 0);
  const topCanteensChartData = {
    labels: topCanteens.map((c) => c.name || c.canteenName),
    datasets: [
      {
        label: "Order Volume (%)",
        data: topCanteens.map((c) => {
          const value = c.totalOrders || c.count || c.orderCount || 0;
          return totalCanteenOrders > 0 ? (value / totalCanteenOrders) * 100 : 0;
        }),
        backgroundColor: "#ef4444", // red
        borderColor: "#fff", // white border
        borderWidth: 2,
      },
    ],
  }

  const topCanteensChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#fff',
        anchor: 'end',
        align: 'center', // changed from 'end' to 'center' for compatibility
        font: { weight: 'bold', size: 14 },
        formatter: (value: number) => value ? value.toFixed(1) + '%' : '',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.parsed.y.toFixed(1) + '%';
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#fff', font: { weight: 'bold' as const } },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#fff',
          callback: function(tickValue: string | number) { return tickValue + '%'; },
        },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
  }

  return (
    <div className="min-h-screen bg-black p-6">
      {/* Background Elements */}
      {/* No gradients or floating backgrounds for a clean look */}

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#ef4444] rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-lg text-white">Manage campus restaurant applications</p>
            </div>
          </div>

          {/* Stats Cards: Only backend fields, subtle red border, black text */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {typeof summary?.totalUsers !== 'undefined' && (
              <Card className="bg-white border border-[#ef4444]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ef4444] rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-black text-sm font-semibold">Total Users</p>
                      <p className="text-2xl font-bold text-black">{summary.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {typeof summary?.totalCanteens !== 'undefined' && (
              <Card className="bg-white border border-[#ef4444]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ef4444] rounded-xl flex items-center justify-center">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-black text-sm font-semibold">Total Canteens</p>
                      <p className="text-2xl font-bold text-black">{summary.totalCanteens}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {typeof summary?.totalCampuses !== 'undefined' && (
              <Card className="bg-white border border-[#ef4444]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ef4444] rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-black text-sm font-semibold">Total Campuses</p>
                      <p className="text-2xl font-bold text-black">{summary.totalCampuses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            <div className="bg-white p-6 rounded-xl border border-[#ef4444]">
              <h3 className="text-lg text-black mb-2 font-semibold">New Users Per Month</h3>
              {usersMonthly.length === 0 ? <div className="text-gray-400">No data</div> : <Line data={{...usersChartData, datasets: usersChartData.datasets.map((ds: typeof usersChartData.datasets[0]) => ({...ds, borderColor: '#000', backgroundColor: 'rgba(0,0,0,0.05)'}))}} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#000' } }, y: { ticks: { color: '#000' } } } }} />}
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#ef4444]">
              <h3 className="text-lg text-black mb-2 font-semibold">Orders Per Month</h3>
              {ordersMonthly.length === 0 ? <div className="text-gray-400">No data</div> : <Line data={{...ordersChartData, datasets: ordersChartData.datasets.map((ds: typeof ordersChartData.datasets[0]) => ({...ds, borderColor: '#000', backgroundColor: 'rgba(0,0,0,0.05)'}))}} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#000' } }, y: { ticks: { color: '#000' } } } }} />}
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#ef4444]">
              <h3 className="text-lg text-black mb-2 font-semibold">Revenue Per Month</h3>
              {revenueMonthly.length === 0 ? <div className="text-gray-400">No data</div> : <Line data={{...revenueChartData, datasets: revenueChartData.datasets.map((ds: typeof revenueChartData.datasets[0]) => ({...ds, borderColor: '#000', backgroundColor: 'rgba(0,0,0,0.05)'}))}} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#000' } }, y: { ticks: { color: '#000' } } } }} />}
            </div>
          </div>

          {/* New Diverse Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            <div className="bg-white p-6 rounded-xl border border-[#ef4444]">
              <h3 className="text-lg text-black mb-2 font-semibold">Order Status Distribution</h3>
              <Pie data={{...orderStatusChartData, datasets: orderStatusChartData.datasets.map(ds => ({...ds, backgroundColor: ['#fbbf24', '#fde68a', '#34d399', '#ef4444'], borderColor: ['#fbbf24', '#fde68a', '#34d399', '#ef4444']}))}} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#000' } } } }} />
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#ef4444] flex flex-col justify-center items-center min-h-[400px]">
              <h3 className="text-lg text-black mb-6 font-semibold w-full">Top Restaurants by Orders</h3>
              <div className="flex-1 w-full flex items-center justify-center">
                <Bar data={{...topCanteensChartData, datasets: topCanteensChartData.datasets.map(ds => ({...ds, backgroundColor: '#ef4444', borderColor: '#fff'}))}} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#000' } }, y: { ticks: { color: '#000' } } } }} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#ef4444]">
              <h3 className="text-lg text-black mb-2 font-semibold">User Roles Distribution</h3>
              <Pie data={{...userRolesChartData, datasets: userRolesChartData.datasets.map(ds => ({...ds, backgroundColor: ['#fbbf24', '#fde68a', '#34d399', '#ef4444'], borderColor: ['#fbbf24', '#fde68a', '#34d399', '#ef4444']}))}} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#000' } } } }} />
            </div>
          </div>

          {/* Even More Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            <div className="bg-white p-6 rounded-xl border border-[#ef4444]">
              <h3 className="text-lg text-black mb-2 font-semibold">Daily Revenue</h3>
              {revenueDaily.length === 0 ? <div className="text-gray-400">No data</div> : <Line data={{...revenueDailyChartData, datasets: revenueDailyChartData.datasets.map(ds => ({...ds, borderColor: '#000', backgroundColor: 'rgba(0,0,0,0.05)'}))}} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#000' } }, y: { ticks: { color: '#000' } } } }} />}
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#ef4444]">
              <h3 className="text-lg text-black mb-2 font-semibold">Weekly Revenue</h3>
              {revenueWeekly.length === 0 ? <div className="text-gray-400">No data</div> : <Line data={{...revenueWeeklyChartData, datasets: revenueWeeklyChartData.datasets.map(ds => ({...ds, borderColor: '#000', backgroundColor: 'rgba(0,0,0,0.05)'}))}} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#000' } }, y: { ticks: { color: '#000' } } } }} />}
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#ef4444]">
              <h3 className="text-lg text-black mb-2 font-semibold">Monthly Revenue</h3>
              {revenueMonthly.length === 0 ? <div className="text-gray-400">No data</div> : <Line data={{...revenueMonthlyChartData, datasets: revenueMonthlyChartData.datasets.map(ds => ({...ds, borderColor: '#000', backgroundColor: 'rgba(0,0,0,0.05)'}))}} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#000' } }, y: { ticks: { color: '#000' } } } }} />}
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#ef4444]">
              <h3 className="text-lg text-black mb-2 font-semibold">Top Spending Users</h3>
              {topSpenders.length === 0 ? <div className="text-gray-400">No data</div> : <Bar data={{...topSpendersChartData, datasets: topSpendersChartData.datasets.map(ds => ({...ds, backgroundColor: '#ef4444', borderColor: '#fff'}))}} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#000' } }, y: { ticks: { color: '#000' } } } }} />}
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#ef4444]">
              <h3 className="text-lg text-black mb-2 font-semibold">Top Canteens by Order Volume</h3>
              {topCanteens.length === 0 ? <div className="text-gray-400">No data</div> : <Bar data={{...topCanteensChartData, datasets: topCanteensChartData.datasets.map((ds: typeof topCanteensChartData.datasets[0]) => ({...ds, backgroundColor: '#ef4444', borderColor: '#fff'}))}} options={{...topCanteensChartOptions, scales: { x: { ticks: { color: '#000' } }, y: { ...(topCanteensChartOptions.scales?.y || {}), ticks: { color: '#000', callback: function(tickValue: string | number) { return tickValue + '%'; } } } } }} plugins={[ChartDataLabels]} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
