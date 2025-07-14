"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Ban, ShieldCheck, UserX, UserCheck, Clock, Store, Mail, Phone, MapPin, FileText, Users, TrendingUp, BarChart3, ShoppingCart, Crown, Star, Activity, DollarSign, Award } from "lucide-react"
import { Line, Pie, Bar } from "react-chartjs-2"
import { motion, Variants } from "framer-motion"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
  BarElement,
  ArcElement,
  ChartOptions,
} from "chart.js"
// @ts-ignore
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Legend, BarElement, ArcElement, ChartDataLabels)

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// Register Chart.js components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
  BarElement,
  ArcElement
)

import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/admin-auth-context";

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
}

// Add a simple CountUp component for animated numbers
function CountUp({ end, duration = 1.2, className = "" }: { end: number, duration?: number, className?: string }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    let frame: any;
    function animate() {
      start += increment;
      if (start < end) {
        setValue(Math.floor(start));
        frame = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);
  return <span className={className}>{value.toLocaleString()}</span>;
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const router = useRouter();
  const { checkAdmin } = useAdminAuth();

  useEffect(() => {
    (async () => {
      const ok = await checkAdmin();
      if (!ok) router.replace("/admin/login");
    })();
  }, [checkAdmin, router]);

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
  const [usersList, setUsersList] = useState<any[]>([])
  const [actionLoading, setActionLoading] = useState<{[userId: string]: boolean}>({});
  const [canteens, setCanteens] = useState<any[]>([]);
  const [canteenActionLoading, setCanteenActionLoading] = useState<{[canteenId: string]: boolean}>({});
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [ordersByCampusCanteen, setOrdersByCampusCanteen] = useState<any[]>([]);

  // Fetch users/vendors from backend
  const fetchUsersByRole = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/admin/users/list-by-role");
      if (res.ok) {
        const data = await res.json();
        const combined = [
          ...(data.students || []).map((u: any) => ({ ...u, role: 'student' })),
          ...(data.canteenOwners || []).map((u: any) => ({ ...u, role: 'canteen' }))
        ];
        setUsersList(combined);
      }
    } catch (err) {
      // handle error
    }
  };

  useEffect(() => {
    fetchUsersByRole();
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/admin/canteens")
      .then(res => res.json())
      .then(data => setCanteens(data.canteens || []));
  }, []);

  // Fetch total orders from /api/v1/admin/orders/by-campus-canteen
  useEffect(() => {
    fetch("http://localhost:8080/api/v1/admin/orders/by-campus-canteen")
      .then(res => res.json())
      .then(data => {
        setOrdersByCampusCanteen(data || []);
        // Calculate total orders
        const total = (data || []).reduce((sum: number, item: any) => sum + (item.totalOrders || 0), 0);
        setTotalOrders(total);
      });
  }, []);

  // Helper to update a single user in usersList
  function updateUserInList(userId: string, updates: any) {
    setUsersList(users => users.map(u => u._id === userId ? { ...u, ...updates } : u));
  }

  async function handleBanUser(userId: string, ban: boolean) {
    setActionLoading(l => ({ ...l, [userId]: true }));
    const res = await fetch("http://localhost:8080/api/v1/admin/banUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ban }),
    });
    setActionLoading(l => ({ ...l, [userId]: false }));
    if (res.ok) {
      toast({ title: ban ? "User banned" : "User unbanned" });
      fetchUsersByRole(); // Re-fetch from backend for fresh data
    }
  }

  async function handleApproveCanteen(canteenId: string) {
    setCanteenActionLoading(l => ({ ...l, [canteenId]: true }));
    const res = await fetch("http://localhost:8080/api/v1/admin/ApproveCanteen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canteenId, approve: true }),
    });
    setCanteenActionLoading(l => ({ ...l, [canteenId]: false }));
    if (res.ok) {
      toast({ title: "Canteen approved" });
      setCanteens(canteens => canteens.map(c => c._id === canteenId ? { ...c, is_verified: true } : c));
    }
  }

  async function handleBanCanteen(canteenId: string, ban: boolean) {
    setCanteenActionLoading(l => ({ ...l, [canteenId]: true }));
    const res = await fetch("http://localhost:8080/api/v1/admin/suspendCanteen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canteenId, ban }),
    });
    setCanteenActionLoading(l => ({ ...l, [canteenId]: false }));
    if (res.ok) {
      toast({ title: ban ? "Canteen banned" : "Canteen unbanned" });
      setCanteens(canteens => canteens.map(c => c._id === canteenId ? { ...c, isBanned: ban } : c));
    }
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [summaryRes, usersRes, userRolesRes, topSpendersRes, ordersRes, orderStatusRes, topCanteensRes, revenueDailyRes] = await Promise.all([
          fetch("http://localhost:8080/api/v1/admin/totals"),
          fetch("http://localhost:8080/api/v1/admin/users/monthly"),
          fetch("http://localhost:8080/api/v1/admin/users/count-by-role"),
          fetch("http://localhost:8080/api/v1/admin/users/top-spenders"),
          fetch("http://localhost:8080/api/v1/admin/orders/monthly"),
          fetch("http://localhost:8080/api/v1/admin/orders/status-wise"),
          fetch("http://localhost:8080/api/v1/admin/orders/top-tcanteens"),
          fetch("http://localhost:8080/api/v1/admin/revenue/daily"), // Use daily revenue
        ])
        if (!summaryRes.ok || !usersRes.ok || !userRolesRes.ok || !topSpendersRes.ok || !ordersRes.ok || !orderStatusRes.ok || !topCanteensRes.ok || !revenueDailyRes.ok) {
          throw new Error("API error")
        }
        const [summaryData, usersData, userRolesData, topSpendersData, ordersData, orderStatusData, topCanteensData, revenueDailyData] = await Promise.all([
          summaryRes.json(),
          usersRes.json(),
          userRolesRes.json(),
          topSpendersRes.json(),
          ordersRes.json(),
          orderStatusRes.json(),
          topCanteensRes.json(),
          revenueDailyRes.json(),
        ])
        setSummary(summaryData)
        setUsersMonthly(usersData)
        const userRolesObj: Record<string, number> = {}
        userRolesData.forEach((item: any) => { userRolesObj[item._id] = item.count })
        setUserRoles(userRolesObj)
        setTopSpenders(topSpendersData)
        setOrdersMonthly(ordersData)
        const orderStatusObj: Record<string, number> = {}
        orderStatusData.forEach((item: any) => { orderStatusObj[item._id] = item.count })
        setOrderStatus(orderStatusObj)
        setTopCanteens(topCanteensData)
        // Filter revenueDaily to only today's date
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10); // 'YYYY-MM-DD'
        const todayRevenue = revenueDailyData.filter((r: any) => (r._id || r.date) === todayStr);
        setRevenueDaily(todayRevenue);
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // --- Chart Data Mapping: Always show all backend data, label null _id as 'Unknown' ---
  // Users per month
  const usersChartData = {
    labels: usersMonthly.map((u) => u._id || 'Unknown'),
    datasets: [
      {
        label: "New Users",
        data: usersMonthly.map((u) => u.count),
        borderColor: "#fff", // white border
        backgroundColor: "#f87171",
        borderWidth: 3, // thicker border
      },
    ],
  }
  // Orders per month
  const ordersChartData = {
    labels: ordersMonthly.map((o) => o._id || 'Unknown'),
    datasets: [
      {
        label: "Orders",
        data: ordersMonthly.map((o) => o.count),
        borderColor: "#fff", // white border
        backgroundColor: "#60a5fa",
        borderWidth: 3,
      },
    ],
  }
  // Daily revenue
  const revenueChartData = {
    labels: revenueDaily.map((r) => r._id || 'Unknown'),
    datasets: [
      {
        label: "Daily Revenue",
        data: revenueDaily.map((r) => r.revenue),
        borderColor: "#fff", // white border
        backgroundColor: "#34d399",
        borderWidth: 3,
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
            borderColor: "#fff", // white border
            borderWidth: 3,
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
            borderColor: "#fff", // white border
            borderWidth: 3,
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
        borderColor: "#fff", // white border
        backgroundColor: "#ef4444", // red
        borderWidth: 3,
      },
    ],
  }
  const revenueWeeklyChartData = {
    labels: revenueWeekly.map((r) => r._id || r.week),
    datasets: [
      {
        label: "Weekly Revenue",
        data: revenueWeekly.map((r) => r.revenue || r.total || r.totalAmount),
        borderColor: "#fff", // white border
        backgroundColor: "#bae6fd",
        borderWidth: 3,
      },
    ],
  }
  const revenueMonthlyChartData = {
    labels: revenueMonthly.map((r) => r._id || r.month),
    datasets: [
      {
        label: "Monthly Revenue",
        data: revenueMonthly.map((r) => r.revenue || r.total || r.totalAmount),
        borderColor: "#fff", // white border
        backgroundColor: "#bbf7d0",
        borderWidth: 3,
      },
    ],
  }
  const topSpendersChartData = {
    labels: topSpenders.map((u) => u.name || u.username || u.email),
    datasets: [
      {
        label: "Amount Spent",
        data: topSpenders.map((u) => u.amount || u.totalSpent),
        backgroundColor: "#ef4444", // red
        borderColor: "#fff", // white border
        borderWidth: 3,
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
        borderWidth: 3,
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
    <div className="min-h-screen p-6 bg-white/80 dark:bg-gradient-to-br dark:from-[#0a192f] dark:via-[#1e3a5f] dark:to-[#2d4a6b] transition-colors duration-500">
      {/* Background Elements */}
      {/* No gradients or floating backgrounds for a clean look */}

      <motion.div 
        className="relative z-10 max-w-7xl mx-auto p-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div className="mb-12" variants={itemVariants}>
          <div className="flex items-center gap-6 mb-8">
            <motion.div 
              className="w-20 h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <BarChart3 className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-xl text-slate-300">Monitor and manage your campus food ecosystem</p>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {summary && typeof summary.totalUsers !== 'undefined' && (
              <motion.div variants={cardVariants}>
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-red-500/30 transition-all duration-300 group cursor-pointer" onClick={() => router.push('/admin/users')}>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg text-slate-300 font-bold uppercase tracking-wider mb-2">Total Users</p>
                        <p className="text-4xl font-bold text-white">{summary.totalUsers.toLocaleString()}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                          <span className="text-green-400 text-sm font-medium">+12% this month</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {summary && typeof summary.totalCanteens !== 'undefined' && (
              <motion.div variants={cardVariants}>
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-red-500/30 transition-all duration-300 group cursor-pointer" onClick={() => router.push('/admin/vendors')}>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg text-slate-300 font-bold uppercase tracking-wider mb-2">Total Canteens</p>
                        <p className="text-4xl font-bold text-white">{summary.totalCanteens.toLocaleString()}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                          <span className="text-green-400 text-sm font-medium">+8% this month</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Store className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {typeof totalOrders !== 'undefined' && (
              <motion.div variants={cardVariants}>
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-purple-500/30 transition-all duration-300 group cursor-pointer" onClick={() => router.push('/admin/orders')}>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg text-slate-300 font-bold uppercase tracking-wider mb-2">Total Orders</p>
                        <p className="text-4xl font-bold text-white">{totalOrders.toLocaleString()}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                          <span className="text-green-400 text-sm font-medium">+15% this month</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ShoppingCart className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Core Analytics Charts */}
          {/* Move Performance Charts (Top Spenders and Daily Revenue) above the three main analytics charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {topSpenders.length > 0 && (
              <motion.div variants={cardVariants}>
                <Card className="bg-gradient-to-br from-rose-500/80 to-red-400/80 shadow-2xl border-0 rounded-2xl flex items-center justify-center h-full">
                  <CardContent className="flex flex-col items-center justify-center h-72 w-full">
                    {topSpenders.length === 1 ? (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <div className="flex items-center justify-center mb-4">
                          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 shadow-lg">
                            <Crown className="w-10 h-10 text-black drop-shadow-lg" />
                          </span>
                        </div>
                        <span className="text-4xl font-extrabold text-black mb-2">Top Spender</span>
                        <span className="text-3xl font-bold text-white mb-1">
                          <CountUp end={topSpenders[0].amount || topSpenders[0].totalSpent} />
                        </span>
                        <span className="text-lg font-semibold text-white mb-1">{topSpenders[0].name || topSpenders[0].email}</span>
                      </div>
                    ) : (
                      <Bar data={topSpendersChartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#000' } }, y: { ticks: { color: '#000' } } } }} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {/* Daily Revenue Chart */}
            <motion.div variants={cardVariants}>
              <Card className="bg-gradient-to-br from-green-400/80 to-emerald-500/80 shadow-2xl border-0 rounded-2xl flex items-center justify-center h-full">
                <CardContent className="flex flex-col items-center justify-center h-72 w-full">
                  {revenueDaily.length === 1 ? (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <div className="flex items-center justify-center mb-4">
                        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 shadow-lg">
                          <span className="text-5xl text-black font-extrabold">₹</span>
                        </span>
                      </div>
                      <span className="text-4xl font-extrabold text-black mb-2">Daily Revenue</span>
                      <span className="text-3xl font-bold text-white mb-1">
                        <CountUp end={revenueDaily[0].revenue || revenueDaily[0].total || revenueDaily[0].totalAmount} />
                      </span>
                      <span className="text-lg font-semibold text-white mb-1">{revenueDaily[0]._id || revenueDaily[0].date}</span>
                    </div>
                  ) : (
                    <Bar data={revenueDailyChartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#000' } }, y: { ticks: { color: '#000' } } } }} />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Place the three analytics charts (New Users, Orders, Revenue) below */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <motion.div variants={cardVariants}>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">New Users</h3>
                      <p className="text-slate-400 text-sm">Monthly growth trend</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '300px' }} className="flex items-center justify-center h-full">
                    {usersMonthly.length === 0 ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No data available</div> : 
                      <Line 
                        data={usersChartData} 
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false } },
                          elements: { line: { borderColor: '#fff', borderWidth: 4 }, point: { backgroundColor: '#fff', radius: 6 } },
                          scales: {
                            x: {
                              ticks: { color: '#fff', font: { size: 16, weight: 'bold' } },
                              grid: { color: 'rgba(0,0,0,0.3)' },
                              title: { display: false },
                            },
                            y: {
                              ticks: { color: '#fff', font: { size: 16, weight: 'bold' }, stepSize: 2, maxTicksLimit: 10 },
                              grid: { color: 'rgba(0,0,0,0.3)' },
                              title: { display: false },
                              suggestedMin: 0,
                              suggestedMax: Math.max(...(usersMonthly.map(u => u.count)), 20) * 2,
                            },
                          },
                          layout: { padding: 24 },
                          backgroundColor: 'transparent',
                        }}
                      />
                    }
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Orders</h3>
                      <p className="text-slate-400 text-sm">Monthly order volume</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '300px' }} className="flex items-center justify-center h-full">
                    {ordersMonthly.length === 0 ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No data available</div> : 
                      <Line 
                        data={ordersChartData} 
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false } },
                          elements: { line: { borderColor: '#fff', borderWidth: 4 }, point: { backgroundColor: '#fff', radius: 6 } },
                          scales: {
                            x: {
                              ticks: { color: '#fff', font: { size: 16, weight: 'bold' } },
                              grid: { color: 'rgba(0,0,0,0.3)' },
                              title: { display: false },
                            },
                            y: {
                              ticks: { color: '#fff', font: { size: 16, weight: 'bold' }, stepSize: 1, maxTicksLimit: 10 },
                              grid: { color: 'rgba(0,0,0,0.3)' },
                              title: { display: false },
                              suggestedMin: 0,
                              suggestedMax: Math.max(...(ordersMonthly.map(o => o.count)), 20) * 2,
                            },
                          },
                          layout: { padding: 24 },
                          backgroundColor: 'transparent',
                        }}
                      />
                    }
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Revenue</h3>
                      <p className="text-slate-400 text-sm">Monthly earnings</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '300px' }} className="flex items-center justify-center h-full">
                    {revenueMonthly.length === 0 ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No data available</div> : 
                      <Line 
                        data={revenueChartData} 
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false } },
                          elements: { line: { borderColor: '#fff', borderWidth: 4 }, point: { backgroundColor: '#fff', radius: 6 } },
                          scales: {
                            x: {
                              ticks: { color: '#fff', font: { size: 16, weight: 'bold' } },
                              grid: { color: 'rgba(255,255,255,0.08)' },
                              title: { display: false },
                            },
                            y: {
                              ticks: { color: '#fff', font: { size: 16, weight: 'bold' }, stepSize: 1000, maxTicksLimit: 10 },
                              grid: { color: 'rgba(255,255,255,0.08)' },
                              title: { display: false },
                              suggestedMin: 0,
                              suggestedMax: Math.max(...(revenueMonthly.map(r => r.revenue || r.total || r.totalAmount)), 10000) * 2,
                            },
                          },
                          layout: { padding: 24 },
                          backgroundColor: 'transparent',
                        }}
                      />
                    }
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <motion.div variants={cardVariants}>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Order Status</h3>
                      <p className="text-slate-400 text-sm">Distribution breakdown</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center w-full" style={{ height: '340px', width: '340px', margin: '0 auto' }}>
                    {!orderStatus ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No data available</div> : 
                      <Pie 
                        data={orderStatusChartData} 
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: { color: '#000', font: { size: 18, weight: 'bold' } },
                            },
                            datalabels: {
                              color: '#111',
                              font: { size: 22, weight: 'bold' },
                            },
                          },
                        }}
                      />
                    }
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">User Roles</h3>
                      <p className="text-slate-400 text-sm">Role distribution</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center w-full" style={{ height: '340px', width: '340px', margin: '0 auto' }}>
                    {!userRoles ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No data available</div> : 
                      <Pie 
                        data={userRolesChartData} 
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: { color: '#000', font: { size: 18, weight: 'bold' } },
                            },
                            datalabels: {
                              color: '#111',
                              font: { size: 22, weight: 'bold' },
                            },
                          },
                        }}
                      />
                    }
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Performance Charts */}

    
        </motion.div>
      </motion.div>
    </div>
  )
}
