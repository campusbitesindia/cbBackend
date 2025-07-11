"use client"

<<<<<<< HEAD
import { useState, useEffect } from "react"
=======
import { useState, useEffect, useRef } from "react"
>>>>>>> 61fc9cdbb03ff6fcad5081f603d409f75e6ac11f
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
<<<<<<< HEAD
import { CheckCircle, XCircle, Clock, Store, Mail, Phone, MapPin, FileText, Users, TrendingUp } from "lucide-react"
import { Line, Pie, Bar } from "react-chartjs-2"
=======
import { CheckCircle, XCircle, Ban, ShieldCheck, UserX, UserCheck, Clock, Store, Mail, Phone, MapPin, FileText, Users, TrendingUp, BarChart3, ShoppingCart, Crown, Star, Activity, DollarSign, Award } from "lucide-react"
import { Line, Pie, Bar } from "react-chartjs-2"
import { motion, Variants } from "framer-motion"
>>>>>>> 61fc9cdbb03ff6fcad5081f603d409f75e6ac11f

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
<<<<<<< HEAD
  Tooltip,
  Legend,
  BarElement, // <-- add this
  ArcElement, // <-- add this for Pie charts
  ChartOptions,
} from "chart.js"
// @ts-ignore
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement, ChartDataLabels)
=======
  Legend,
  BarElement,
  ArcElement,
  ChartOptions,
} from "chart.js"

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
>>>>>>> 61fc9cdbb03ff6fcad5081f603d409f75e6ac11f

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

export default function AdminDashboard() {
  const { toast } = useToast()
  const [summary, setSummary] = useState<any>(null)
  const [usersMonthly, setUsersMonthly] = useState<any[]>([])
  const [ordersMonthly, setOrdersMonthly] = useState<any[]>([])
<<<<<<< HEAD
  const [revenueDaily, setRevenueDaily] = useState<any[]>([])
  const [revenueWeekly, setRevenueWeekly] = useState<any[]>([])
=======
>>>>>>> 61fc9cdbb03ff6fcad5081f603d409f75e6ac11f
  const [revenueMonthly, setRevenueMonthly] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderStatus, setOrderStatus] = useState<any>(null)
  const [userRoles, setUserRoles] = useState<any>(null)
  const [topSpenders, setTopSpenders] = useState<any[]>([])
  const [topCanteens, setTopCanteens] = useState<any[]>([])
<<<<<<< HEAD

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
=======
  const [usersList, setUsersList] = useState<any[]>([]) // New state for users table
  const [actionLoading, setActionLoading] = useState<{[userId: string]: boolean}>({});
  const [canteens, setCanteens] = useState<any[]>([]);
  const [canteenActionLoading, setCanteenActionLoading] = useState<{[canteenId: string]: boolean}>({});

  // Refs for chart cleanup
  const chartRefs = useRef<any[]>([])

  // Fetch users/vendors from backend
  const fetchUsersByRole = async () => {
    try {
      const res = await fetch("/api/v1/admin/users/list-by-role");
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
            fetch("/api/v1/canteens")
      .then(res => res.json())
              .then(data => setCanteens(data.canteens || []));
  }, []);

  // Helper to update a single user in usersList
  function updateUserInList(userId: string, updates: any) {
    setUsersList(users => users.map(u => u._id === userId ? { ...u, ...updates } : u));
  }


  async function handleSuspendCanteen(canteenId: string, userId: string) {
    setActionLoading(l => ({ ...l, [userId]: true }));
    const res = await fetch("/api/v1/admin/suspendCanteen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canteenId }),
    });
    setActionLoading(l => ({ ...l, [userId]: false }));
    if (res.ok) {
      toast({ title: "Canteen suspended and owner banned" });
      updateUserInList(userId, { isBanned: true });
    }
  }

  async function handleBanUser(userId: string, ban: boolean) {
    setActionLoading(l => ({ ...l, [userId]: true }));
    const res = await fetch("/api/v1/admin/banUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ban }),
    });
    setActionLoading(l => ({ ...l, [userId]: false }));
    if (res.ok) {
      toast({ title: ban ? "User banned" : "User unbanned" });
      updateUserInList(userId, { isBanned: ban });
    }
  }


  async function handleApproveCanteen(canteenId: string) {
    setCanteenActionLoading(l => ({ ...l, [canteenId]: true }));
    const res = await fetch("/api/v1/admin/approveCanteen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canteenId }),
    });
    setCanteenActionLoading(l => ({ ...l, [canteenId]: false }));
    if (res.ok) {
      toast({ title: "Canteen approved" });
      setCanteens(canteens => canteens.map(c => c._id === canteenId ? { ...c, is_verified: true } : c));
    }
  }

  async function handleBanCanteen(canteenId: string, ban: boolean) {
    setCanteenActionLoading(l => ({ ...l, [canteenId]: true }));
    const res = await fetch("/api/v1/admin/banCanteen", {
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
        // Batch API calls to reduce memory pressure - fetch core data first
        const corePromises = [
          fetch("/api/v1/admin/totals"),
          fetch("/api/v1/admin/users/monthly"),
          fetch("/api/v1/admin/users/count-by-role"),
          fetch("/api/v1/admin/orders/monthly"),
          fetch("/api/v1/admin/orders/status-wise"),
        ]
        
        const coreResponses = await Promise.all(corePromises)
        
        if (!coreResponses.every(res => res.ok)) {
          throw new Error("Core API error")
        }
        
        const [summaryData, usersData, userRolesData, ordersData, orderStatusData] = await Promise.all(
          coreResponses.map(res => res.json())
        )
        
        // Set core data immediately
        setSummary(summaryData)
        setUsersMonthly(usersData)
        
        // Transform userRolesData array to object
        const userRolesObj: Record<string, number> = {}
        userRolesData.forEach((item: any) => { userRolesObj[item._id] = item.count })
        setUserRoles(userRolesObj)
        
        setOrdersMonthly(ordersData)
        
        // Transform orderStatusData array to object
        const orderStatusObj: Record<string, number> = {}
        orderStatusData.forEach((item: any) => { orderStatusObj[item._id] = item.count })
        setOrderStatus(orderStatusObj)
        
        // Fetch additional data with delay to reduce memory pressure
        setTimeout(async () => {
          try {
            const additionalPromises = [
              fetch("/api/v1/admin/users/top-spenders"),
              fetch("/api/v1/admin/orders/top-tcanteens"),
              fetch("/api/v1/admin/revenue/monthly"),
            ]
            
            const additionalResponses = await Promise.all(additionalPromises)
            
            if (additionalResponses.every(res => res.ok)) {
              const [topSpendersData, topCanteensData, revenueMonthlyData] = await Promise.all(
                additionalResponses.map(res => res.json())
              )
              
              setTopSpenders(topSpendersData)
              setTopCanteens(topCanteensData)
              setRevenueMonthly(revenueMonthlyData)
            }
          } catch (err) {
            console.warn("Additional data fetch failed:", err)
          }
        }, 500)
        
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    
    // Enhanced cleanup function for better memory management
    return () => {
      // Destroy all chart instances
      chartRefs.current.forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          try {
            chart.destroy()
          } catch (error) {
            console.warn('Chart cleanup error:', error)
          }
        }
      })
      chartRefs.current = []
      
      // Force garbage collection on cleanup
      if (window.gc) {
        window.gc()
      }
    }
  }, [])

  // Enhanced chart data helpers with better styling
  const usersChartData = usersMonthly.length ? {
    labels: usersMonthly.map((u) => u._id),
    datasets: [
      {
        label: "New Users",
        data: usersMonthly.map((u) => u.count),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  } : { labels: [], datasets: [] }

  const ordersChartData = ordersMonthly.length ? {
    labels: ordersMonthly.map((o) => o._id),
    datasets: [
      {
        label: "Orders",
        data: ordersMonthly.map((o) => o.count),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  } : { labels: [], datasets: [] }

  const revenueChartData = revenueMonthly.length ? {
    labels: revenueMonthly.map((r) => r._id),
    datasets: [
      {
        label: "Revenue",
        data: revenueMonthly.map((r) => r.revenue || r.total || r.totalAmount),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  } : { labels: [], datasets: [] }

  const orderStatusChartData = orderStatus ? {
    labels: Object.keys(orderStatus),
    datasets: [
      {
        label: "Order Status",
        data: Object.values(orderStatus),
        backgroundColor: ["#fbbf24", "#10b981", "#ef4444", "#8b5cf6"],
        borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 3,
        hoverBorderWidth: 4,
      },
    ],
  } : { labels: [], datasets: [] }

  const userRolesChartData = userRoles ? {
    labels: Object.keys(userRoles),
    datasets: [
      {
        label: "User Roles",
        data: Object.values(userRoles),
        backgroundColor: ["#ef4444", "#10b981", "#3b82f6", "#f59e0b"],
        borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 3,
        hoverBorderWidth: 4,
      },
    ],
  } : { labels: [], datasets: [] }

  const topSpendersChartData = topSpenders.length ? {
    labels: topSpenders.map((u) => u.name || u.username || u.email),
    datasets: [
      {
        label: "Amount Spent",
        data: topSpenders.map((u) => u.amount || u.totalSpent),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "#ef4444",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  } : { labels: [], datasets: [] }

  const topCanteensChartData = topCanteens.length ? {
    labels: topCanteens.map((c) => c.name || c.canteenName),
    datasets: [
      {
        label: "Orders",
        data: topCanteens.map((c) => c.totalOrders || c.count || c.orderCount || 0),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "#10b981",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  } : { labels: [], datasets: [] }

  const enhancedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        display: false 
      },
      tooltip: { 
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: '#ef4444',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: false,
      }
    },
    scales: { 
      x: { 
        ticks: { color: '#94a3b8', fontSize: 12 },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        border: { display: false }
      }, 
      y: { 
        ticks: { color: '#94a3b8', fontSize: 12 },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        border: { display: false }
      } 
    },
    elements: {
      point: {
        hoverBackgroundColor: '#ffffff',
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'bottom' as const, 
        labels: { 
          color: '#e2e8f0',
          padding: 20,
          font: {
            size: 12,
            weight: 500,
          },
      }
    },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: '#ef4444',
        borderWidth: 1,
        cornerRadius: 12,
      }
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#0f172a] flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <Activity className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="text-white text-xl font-semibold">Loading Dashboard...</div>
          <div className="text-slate-400 text-sm mt-2">Fetching your analytics</div>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#0f172a] flex items-center justify-center">
        <motion.div 
          className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 text-xl font-semibold mb-2">Dashboard Error</div>
          <div className="text-slate-400">{error}</div>
        </motion.div>
      </div>
    )
  }

  // Split usersList into students and vendors
  const students = usersList.filter(u => u.role === 'student');
  const vendors = usersList.filter(u => u.role === 'canteen');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#0f172a] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
>>>>>>> 61fc9cdbb03ff6fcad5081f603d409f75e6ac11f

      <motion.div 
        className="relative z-10 max-w-7xl mx-auto p-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
<<<<<<< HEAD
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
=======
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
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-red-500/30 transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-2">Total Users</p>
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
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-red-500/30 transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-2">Total Canteens</p>
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
            {summary && typeof summary.totalCampuses !== 'undefined' && (
              <motion.div variants={cardVariants}>
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-red-500/30 transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-2">Total Campuses</p>
                        <p className="text-4xl font-bold text-white">{summary.totalCampuses.toLocaleString()}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                          <span className="text-green-400 text-sm font-medium">+5% this month</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Core Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <motion.div variants={cardVariants}>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-red-500/30 transition-all duration-300">
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
                  <div style={{ height: '300px' }}>
                    {usersMonthly.length === 0 ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No data available</div> : 
                      <Line data={usersChartData} options={enhancedChartOptions} />
                    }
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-blue-500/30 transition-all duration-300">
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
                  <div style={{ height: '300px' }}>
                    {ordersMonthly.length === 0 ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No data available</div> : 
                      <Line data={ordersChartData} options={enhancedChartOptions} />
                    }
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-green-500/30 transition-all duration-300">
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
                  <div style={{ height: '300px' }}>
                    {revenueMonthly.length === 0 ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No data available</div> : 
                      <Line data={revenueChartData} options={enhancedChartOptions} />
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
              <div style={{ height: '300px' }}>
                {!orderStatus ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No data available</div> : 
                  <Pie data={orderStatusChartData} options={pieChartOptions} />
                }
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">User Roles</h3>
                      <p className="text-slate-400 text-sm">Role distribution</p>
              </div>
            </div>
                </CardHeader>
                <CardContent>
              <div style={{ height: '300px' }}>
                {!userRoles ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No data available</div> : 
                  <Pie data={userRolesChartData} options={pieChartOptions} />
                }
              </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Performance Charts */}
          {(topSpenders.length > 0 || topCanteens.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {topSpenders.length > 0 && (
                <motion.div variants={cardVariants}>
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                          <Crown className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Top Spenders</h3>
                          <p className="text-slate-400 text-sm">Highest value customers</p>
                  </div>
                </div>
                    </CardHeader>
                    <CardContent>
                      <div style={{ height: '300px' }}>
                        <Bar data={topSpendersChartData} options={enhancedChartOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {topCanteens.length > 0 && (
                <motion.div variants={cardVariants}>
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <Award className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Top Canteens</h3>
                          <p className="text-slate-400 text-sm">Most popular destinations</p>
                  </div>
                </div>
                    </CardHeader>
                    <CardContent>
                      <div style={{ height: '300px' }}>
                        <Bar data={topCanteensChartData} options={enhancedChartOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          )}

          {/* Students Table Section */}
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 my-8">
            <h2 className="text-2xl font-bold mb-4 text-white">All Students</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-white bg-white/5 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-white/10">
                    <th className="px-4 py-2 font-semibold">Name</th>
                    <th className="px-4 py-2 font-semibold">Email</th>
                    <th className="px-4 py-2 font-semibold">Campus</th>
                    <th className="px-4 py-2 font-semibold">Banned</th>
                    <th className="px-4 py-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">No students found.</td>
                    </tr>
                  ) : (
                    students.map((user, idx) => (
                      <tr key={user._id} className="border-b border-white/10 hover:bg-white/10 transition group">
                        <td className="px-4 py-2 font-medium flex items-center gap-2">
                          {user.isBanned && <span className="inline-block bg-red-600 text-xs text-white px-2 py-0.5 rounded-full mr-1">Banned</span>}
                          {!user.isBanned && <span className="inline-block bg-green-600 text-xs text-white px-2 py-0.5 rounded-full mr-1">Active</span>}
                          {user.name}
                        </td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.campus?.name || "-"}</td>
                        <td className="px-4 py-2">
                          <Badge variant={user.isBanned ? "destructive" : "secondary"} className={user.isBanned ? "bg-red-500/90 text-white" : "bg-gray-700/80 text-white"}>
                            {user.isBanned ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`rounded-full border ${user.isBanned ? 'text-green-400 border-green-400 hover:bg-green-600/20' : 'text-red-400 border-red-400 hover:bg-red-600/20'}`}
                                    onClick={() => handleBanUser(user._id, !user.isBanned)}
                                    aria-label={user.isBanned ? "Unban User" : "Ban User"}
                                    disabled={actionLoading[user._id]}
                                  >
                                    {actionLoading[user._id]
                                      ? <span className={`animate-spin w-5 h-5 border-2 ${user.isBanned ? 'border-green-400' : 'border-red-400'} border-t-transparent rounded-full`}></span>
                                      : user.isBanned
                                        ? <UserCheck className="w-5 h-5" />
                                        : <UserX className="w-5 h-5" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{user.isBanned ? "Unban user" : "Ban user"}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        {/* Canteens Table Section */}
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 my-8">
            <h2 className="text-2xl font-bold mb-4 text-white">All Canteens</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-white bg-white/5 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-white/10">
                    <th className="px-4 py-2 font-semibold">Name</th>
                    <th className="px-4 py-2 font-semibold">Campus</th>
                    <th className="px-4 py-2 font-semibold">Verified</th>
                    <th className="px-4 py-2 font-semibold">Banned</th>
                    <th className="px-4 py-2 font-semibold">Open</th>
                    <th className="px-4 py-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {canteens.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">No canteens found.</td>
                    </tr>
                  ) : (
                    canteens.map((canteen) => (
                      <tr key={canteen._id} className="border-b border-white/10 hover:bg-white/10 transition group">
                        <td className="px-4 py-2 font-medium">{canteen.name}</td>
                        <td className="px-4 py-2">{canteen.campus?.name || "-"}</td>
                        <td className="px-4 py-2">
                          <Badge variant={canteen.is_verified ? "default" : "secondary"} className={canteen.is_verified ? "bg-green-500/90 text-white" : "bg-gray-700/80 text-white"}>
                            {canteen.is_verified ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant={canteen.isBanned ? "destructive" : "secondary"} className={canteen.isBanned ? "bg-red-500/90 text-white" : "bg-gray-700/80 text-white"}>
                            {canteen.isBanned ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant={canteen.isOpen ? "default" : "secondary"} className={canteen.isOpen ? "bg-green-500/90 text-white" : "bg-gray-700/80 text-white"}>
                            {canteen.isOpen ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-2">
                            {/* Approve button */}
                            {!canteen.is_verified && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="hover:bg-green-600/20 text-green-400 border border-green-400 rounded-full" onClick={() => handleApproveCanteen(canteen._id)} aria-label="Approve Canteen" disabled={canteenActionLoading[canteen._id]}>
                                      {canteenActionLoading[canteen._id] ? <span className="animate-spin w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full"></span> : <ShieldCheck className="w-5 h-5" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Approve canteen</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {/* Ban/Unban button */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost" className={`rounded-full border ${canteen.isBanned ? 'text-green-400 border-green-400 hover:bg-green-600/20' : 'text-red-400 border-red-400 hover:bg-red-600/20'}`} onClick={() => handleBanCanteen(canteen._id, !canteen.isBanned)} aria-label={canteen.isBanned ? "Unban Canteen" : "Ban Canteen"} disabled={canteenActionLoading[canteen._id]}>
                                    {canteenActionLoading[canteen._id]
                                      ? <span className={`animate-spin w-5 h-5 border-2 ${canteen.isBanned ? 'border-green-400' : 'border-red-400'} border-t-transparent rounded-full`}></span>
                                      : canteen.isBanned
                                        ? <UserCheck className="w-5 h-5" />
                                        : <UserX className="w-5 h-5" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{canteen.isBanned ? "Unban canteen" : "Ban canteen"}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </motion.div>
>>>>>>> 61fc9cdbb03ff6fcad5081f603d409f75e6ac11f
    </div>
  )
}
