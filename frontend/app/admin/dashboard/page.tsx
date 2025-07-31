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
  Tooltip,
} from "chart.js"
// @ts-ignore
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Legend, BarElement, ArcElement, ChartDataLabels, Tooltip)

// @ts-ignore
import annotationPlugin from 'chartjs-plugin-annotation';
ChartJS.register(annotationPlugin);

// This section is commented out as it is redundant after the global ChartJS.register call above.
/*
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
*/

import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/admin-auth-context";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
function CountUp({ end, duration = 1.2, className = "", decimals = 0 }: { end: number, duration?: number, className?: string, decimals?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = (end - start) / (duration * 60); // Calculate increment based on difference
    let frame: any;
    function animate() {
      start += increment;
      if (start < end) {
        setValue(parseFloat(start.toFixed(decimals)));
        frame = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, [end, duration, decimals]);
  return <span className={className}>{value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
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
  const [totalRevenueValue, setTotalRevenueValue] = useState<number>(0);
  const [dailyRevenueValue, setDailyRevenueValue] = useState<number>(0);
  const [averageOrderValue, setAverageOrderValue] = useState<number>(0);
  const [peakOrderTimes, setPeakOrderTimes] = useState<any[]>([]);
  const [revenueByPaymentMethod, setRevenueByPaymentMethod] = useState<any[]>([]);
  const [suspectedUsers, setSuspectedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderStatus, setOrderStatus] = useState<any>(null)
  const [userRoles, setUserRoles] = useState<any>(null)
  const [topSpenders, setTopSpenders] = useState<any[]>([])
  const [topCanteens, setTopCanteens] = useState<any[]>([])
  const [topCampusesByRevenue, setTopCampusesByRevenue] = useState<any[]>([]);
  const [revenueByCampusCanteen, setRevenueByCampusCanteen] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([])
  const [actionLoading, setActionLoading] = useState<{[userId: string]: boolean}>({});
  const [canteens, setCanteens] = useState<any[]>([]);
  const [canteenActionLoading, setCanteenActionLoading] = useState<{[canteenId: string]: boolean}>({});
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [ordersByCampusCanteen, setOrdersByCampusCanteen] = useState<any[]>([]);
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);

  const [selectedCanteenForRating, setSelectedCanteenForRating] = useState<string>("");
  const [vendorRating, setVendorRating] = useState<number>(0);
  const [ratingLoading, setRatingLoading] = useState<boolean>(false);

  async function handleRateVendor() {
    if (!selectedCanteenForRating || vendorRating === 0 || vendorRating < 1 || vendorRating > 5) {
      toast({ title: "Error", description: "Please select a canteen and provide a rating between 1 and 5.", variant: "destructive" });
      return;
    }

    setRatingLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/v1/admin/rateVendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canteenId: selectedCanteenForRating,
          rating: vendorRating,
        }),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Vendor rated successfully!" });
        setSelectedCanteenForRating("");
        setVendorRating(0);
      } else {
        const errorData = await res.json();
        toast({ title: "Error", description: errorData.message || "Failed to rate vendor", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error rating vendor:", err);
      toast({ title: "Error", description: "Failed to connect to server for rating.", variant: "destructive" });
    } finally {
      setRatingLoading(false);
    }
  }

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
      } else {
        console.error("Failed to fetch user list:", res.status, res.statusText);
        toast({ title: "Error", description: "Failed to fetch user list.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error fetching user list:", err);
      toast({ title: "Error", description: "Failed to connect to server for user list.", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchUsersByRole();
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/admin/canteens")
      .then(res => res.json())
      .then(data => setCanteens(data.canteens || []))
      .catch(err => console.error("Error fetching all canteens:", err));
  }, []);

  // Fetch total orders from /api/v1/admin/orders/by-campus-canteen
  useEffect(() => {
    fetch("http://localhost:8080/api/v1/admin/orders/by-campus-canteen")
      .then(res => res.json())
      .then(data => {
        setOrdersByCampusCanteen(data || []);
        const total = (data || []).reduce((sum: number, item: any) => sum + (item.totalOrders || 0), 0);
        setTotalOrders(total);
      })
      .catch(err => console.error("Error fetching orders by campus/canteen:", err));
  }, []);

  function updateUserInList(userId: string, updates: any) {
    setUsersList(users => users.map(u => u._id === userId ? { ...u, ...updates } : u));
  }

  async function handleBanUser(userId: string, ban: boolean) {
    setActionLoading(l => ({ ...l, [userId]: true }));
    try {
    const res = await fetch("http://localhost:8080/api/v1/admin/banUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ban }),
    });
    if (res.ok) {
      toast({ title: ban ? "User banned" : "User unbanned" });
        fetchUsersByRole();
      } else {
        const errorData = await res.json();
        toast({ title: "Error", description: errorData.message || "Failed to update user status", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error banning user:", err);
      toast({ title: "Error", description: "Failed to connect to server.", variant: "destructive" });
    } finally {
      setActionLoading(l => ({ ...l, [userId]: false }));
    }
  }

  async function handleApproveCanteen(canteenId: string, approved: boolean, rejectionReason: string = "") {
    setCanteenActionLoading(l => ({ ...l, [canteenId]: true }));
    try {
      const res = await fetch(`http://localhost:8080/api/v1/admin/vendors/${canteenId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved, rejectionReason }),
    });
    if (res.ok) {
        toast({ title: approved ? "Canteen approved" : "Canteen rejected" });
        fetchPendingVendors();
        setCanteens(prevCanteens => prevCanteens.map(c => c._id === canteenId ? { ...c, approvalStatus: approved ? "approved" : "rejected", isApproved: approved } : c));
      } else {
        const errorData = await res.json();
        toast({ title: "Error", description: errorData.message || "Failed to update vendor status", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error approving canteen:", err);
      toast({ title: "Error", description: "Failed to connect to server.", variant: "destructive" });
    } finally {
      setCanteenActionLoading(l => ({ ...l, [canteenId]: false }));
    }
  }

  async function handleBanCanteen(canteenId: string, suspend: boolean) {
    setCanteenActionLoading(l => ({ ...l, [canteenId]: true }));
    try {
    const res = await fetch("http://localhost:8080/api/v1/admin/suspendCanteen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canteenId, suspend }),
      });
      if (res.ok) {
        toast({ title: suspend ? "Canteen suspended" : "Canteen unsuspended" });
        setCanteens(canteens => canteens.map(c => c._id === canteenId ? { ...c, isSuspended: suspend } : c));
      } else {
        const errorData = await res.json();
        toast({ title: "Error", description: errorData.message || "Failed to suspend canteen", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error suspending canteen:", err);
      toast({ title: "Error", description: "Failed to connect to server.", variant: "destructive" });
    } finally {
    setCanteenActionLoading(l => ({ ...l, [canteenId]: false }));
    }
  }

  async function fetchPendingVendors() {
    try {
      const res = await fetch("http://localhost:8080/api/v1/admin/vendors/pending");
    if (res.ok) {
        const data = await res.json();
        setPendingVendors(data.data || []);
      } else {
        console.error("Failed to fetch pending vendors:", res.status, res.statusText);
        setPendingVendors([]);
      }
    } catch (err) {
      console.error("Error fetching pending vendors:", err);
      setPendingVendors([]);
    }
  }

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [
          summaryRes,
          usersRes,
          userRolesRes,
          topSpendersRes,
          ordersRes,
          orderStatusRes,
          topCanteensRes,
          revenueDailyRes,
          revenueWeeklyRes,
          revenueMonthlyRes,
          totalRevenueRes,
          averageOrderValueRes,
          peakOrderTimesRes,
          revenueByPaymentMethodRes,
          suspectedUsersRes,
          topCampusesByRevenueRes,
          revenueByCampusCanteenRes,
        ] = await Promise.all([
          fetch("http://localhost:8080/api/v1/admin/totals"),
          fetch("http://localhost:8080/api/v1/admin/users/monthly"),
          fetch("http://localhost:8080/api/v1/admin/users/count-by-role"),
          fetch("http://localhost:8080/api/v1/admin/users/top-spenders"),
          fetch("http://localhost:8080/api/v1/admin/orders/monthly"),
          fetch("http://localhost:8080/api/v1/admin/orders/status-wise"),
          fetch("http://localhost:8080/api/v1/admin/orders/top-tcanteens"),
          fetch("http://localhost:8080/api/v1/admin/revenue/daily"), 
          fetch("http://localhost:8080/api/v1/admin/revenue/weekly"),
          fetch("http://localhost:8080/api/v1/admin/revenue/monthly"),
          fetch("http://localhost:8080/api/v1/admin/revenue/total"),
          fetch("http://localhost:8080/api/v1/admin/orders/average-order-value"),
          fetch("http://localhost:8080/api/v1/admin/orders/peak-hours"),
          fetch("http://localhost:8080/api/v1/admin/revenue/payment-breakdown"),
          fetch("http://localhost:8080/api/v1/admin/users/getSuspectedUser"),
          fetch("http://localhost:8080/api/v1/admin/revenue/top-campuses"),
          fetch("http://localhost:8080/api/v1/admin/revenue/by-campus-canteen"),
        ])

        const checkResponse = async (res: Response, name: string) => {
          try {
            const data = await res.json();
            if (!res.ok) {
                console.error(`Error fetching ${name}:`, res.status, res.statusText, data);
            }
            // If data object has a 'data' property that is an array, use that. Otherwise, use the data itself.
            if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
                return data.data;
            }
            return data; // Return the data as is (could be array or other object)
          } catch (error) {
            console.error(`Error parsing JSON for ${name}:`, error, res.status, res.statusText);
            return null; // Return null if JSON parsing fails
          }
        };

        const [
          summaryData,
          usersData,
          userRolesData,
          topSpendersData,
          ordersData,
          orderStatusData,
          topCanteensData,
          revenueDailyData,
          revenueWeeklyData,
          revenueMonthlyData,
          totalRevenueData,
          averageOrderValueData,
          peakOrderTimesData,
          revenueByPaymentMethodData,
          suspectedUsersData,
          topCampusesByRevenueData,
          revenueByCampusCanteenData,
        ] = await Promise.all([
          checkResponse(summaryRes, "summary"),
          checkResponse(usersRes, "monthly users"),
          checkResponse(userRolesRes, "user roles"),
          checkResponse(topSpendersRes, "top spenders"),
          checkResponse(ordersRes, "monthly orders"),
          checkResponse(orderStatusRes, "order status"),
          checkResponse(topCanteensRes, "top canteens"),
          checkResponse(revenueDailyRes, "daily revenue"),
          checkResponse(revenueWeeklyRes, "weekly revenue"),
          checkResponse(revenueMonthlyRes, "monthly revenue"),
          checkResponse(totalRevenueRes, "total revenue"),
          checkResponse(averageOrderValueRes, "average order value"),
          checkResponse(peakOrderTimesRes, "peak order times"),
          checkResponse(revenueByPaymentMethodRes, "revenue by payment method"),
          checkResponse(suspectedUsersRes, "suspected users"),
          checkResponse(topCampusesByRevenueRes, "top campuses by revenue"),
          checkResponse(revenueByCampusCanteenRes, "revenue by campus and canteen"),
        ])

        setSummary(summaryData)
        setUsersMonthly(usersData || [])
        const userRolesObj: Record<string, number> = {}
        if (userRolesData) {
        userRolesData.forEach((item: any) => { userRolesObj[item._id] = item.count })
        }
        setUserRoles(userRolesObj)
        setTopSpenders(topSpendersData || [])
        setOrdersMonthly(ordersData || [])
        const orderStatusObj: Record<string, number> = {}
        if (orderStatusData) {
        orderStatusData.forEach((item: any) => { orderStatusObj[item._id] = item.count })
        }
        setOrderStatus(orderStatusObj)
        setTopCanteens(topCanteensData || [])

        setRevenueDaily(revenueDailyData || []);
        setRevenueWeekly(revenueWeeklyData || []);
        setRevenueMonthly(revenueMonthlyData || []);
        setTotalRevenueValue(totalRevenueData?.totalRevenue || 0);
        
        const latestDailyRevenue = revenueDailyData && revenueDailyData.length > 0 
          ? (revenueDailyData.sort((a: any, b: any) => (b._id || b.date).localeCompare(a._id || a.date)))[0]?.revenue || 0
          : 0;
        setDailyRevenueValue(latestDailyRevenue);

        setAverageOrderValue(averageOrderValueData?.averageOrderValue || 0);
        setPeakOrderTimes(peakOrderTimesData || []);
        setRevenueByPaymentMethod(revenueByPaymentMethodData || []);
        setTopCampusesByRevenue(topCampusesByRevenueData || []);
        setRevenueByCampusCanteen(revenueByCampusCanteenData || []);
        if (suspectedUsersData && Array.isArray(suspectedUsersData.data)) {
          setSuspectedUsers(suspectedUsersData.data);
        } else if (Array.isArray(suspectedUsersData)) {
          setSuspectedUsers(suspectedUsersData);
        } else {
          setSuspectedUsers([]);
        }

      } catch (err: any) {
        setError(err.message)
        toast({ title: "Data Fetch Error", description: `Failed to load some dashboard data: ${err.message}`, variant: "destructive" });
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

  // New Combined Revenue Chart Data
  const combinedRevenueChartData = {
    labels: Array.from(new Set([
      ...revenueWeekly.map(r => r._id || r.week),
      ...revenueMonthly.map(r => r._id || r.month),
    ])).sort((a, b) => a.localeCompare(b)), // Sort labels chronologically
    datasets: [
      {
        label: "Weekly Revenue",
        data: revenueWeekly.map((r) => ({ x: r._id || r.week, y: r.revenue || r.total || r.totalAmount })),
        borderColor: "#bae6fd", // Light Blue
        backgroundColor: "rgba(186, 230, 253, 0.2)",
        borderWidth: 3,
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: "Monthly Revenue",
        data: revenueMonthly.map((r) => ({ x: r._id || r.month, y: r.revenue || r.total || r.totalAmount })),
        borderColor: "#bbf7d0", // Light Green
        backgroundColor: "rgba(187, 247, 208, 0.2)",
        borderWidth: 3,
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  }

  const combinedRevenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: { size: 14, weight: 'bold' as const },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        caretPadding: 10,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        type: 'category',
        ticks: { color: '#fff', font: { size: 12, weight: 'bold' as const } },
        grid: { color: 'rgba(255,255,255,0.1)' },
        title: { display: true, text: 'Period', color: '#fff', font: { size: 14, weight: 'bold' as const } },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#fff',
          font: { size: 12, weight: 'bold' as const },
          callback: function(value) {
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value as number);
          }
        },
        grid: { color: 'rgba(255,255,255,0.1)' },
        title: { display: true, text: 'Revenue (₹)', color: '#fff', font: { size: 14, weight: 'bold' as const } },
      },
    },
  };


  const orderStatusChartData = orderStatus
    ? {
        labels: Object.keys(orderStatus),
        datasets: [
          {
            label: "Order Status",
            data: Object.values(orderStatus),
            backgroundColor: ["#fbbf24", "#34d399", "#f87171", "#a78bfa"],
            borderColor: "#fff",
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
            borderColor: "#fff",
            borderWidth: 3,
          },
        ],
      }
    : { labels: [], datasets: [] }

  const peakOrderTimesChartData = {
    labels: peakOrderTimes.map((item) => `${item._id}:00 - ${item._id + 1}:00`),
    datasets: [
      {
        label: "Number of Orders",
        data: peakOrderTimes.map((item) => item.count),
        backgroundColor: "#60a5fa",
        borderColor: "#fff",
        borderWidth: 3,
      },
    ],
  };

  const revenueByPaymentMethodChartData = {
    labels: revenueByPaymentMethod.map((item) => item.paymentMethod),
    datasets: [
      {
        label: "Revenue",
        data: revenueByPaymentMethod.map((item) => item.totalRevenue),
        backgroundColor: ["#34d399", "#fbbf24", "#a78bfa", "#f87171"],
        borderColor: "#fff",
        borderWidth: 3,
      },
    ],
  };

  const topSpendersChartData = {
    labels: topSpenders.length > 0 ? [topSpenders[0].name || topSpenders[0].username || topSpenders[0].email] : [],
    datasets: [
      {
        label: "Amount Spent",
        data: topSpenders.length > 0 ? [topSpenders[0].amount || topSpenders[0].totalSpent] : [],
        backgroundColor: "#ef4444",
        borderColor: "#fff",
        borderWidth: 3,
      },
    ],
  }

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
        backgroundColor: "#ef4444",
        borderColor: "#fff",
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
        align: 'center',
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

  // Top Campuses by Revenue Chart Data
  const topCampusesByRevenueChartData = {
    labels: topCampusesByRevenue.map((c) => c._id || c.campusName || 'Unknown'),
    datasets: [
      {
        label: "Revenue",
        data: topCampusesByRevenue.map((c) => c.totalRevenue || 0),
        backgroundColor: "#34d399", // Green color
        borderColor: "#fff",
        borderWidth: 3,
      },
    ],
  };

  const topCampusesByRevenueChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#fff',
        anchor: 'end',
        align: 'center',
        font: { weight: 'bold', size: 14 },
        formatter: (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value),
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
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
        ticks: {
          color: '#fff',
          callback: function(value) {
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value as number);
          },
        },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
  };

  // --- Revenue Chart Data Mapping ---
  const weeklyRevenueChartData = {
    labels: revenueWeekly.map(r => r._id || r.week),
    datasets: [
      {
        label: "Weekly Revenue",
        data: revenueWeekly.map((r) => r.revenue || r.total || r.totalAmount),
        borderColor: "#bae6fd", // Light Blue
        backgroundColor: "rgba(186, 230, 253, 0.2)",
        borderWidth: 3,
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const monthlyRevenueChartData = {
    labels: revenueMonthly.map(r => r._id || r.month),
    datasets: [
      {
        label: "Monthly Revenue",
        data: revenueMonthly.map((r) => r.revenue || r.total || r.totalAmount),
        borderColor: "#bbf7d0", // Light Green
        backgroundColor: "rgba(187, 247, 208, 0.2)",
        borderWidth: 3,
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const revenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: { size: 14, weight: 'bold' as const },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        caretPadding: 10,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        type: 'category',
        ticks: { color: '#fff', font: { size: 12, weight: 'bold' as const } },
        grid: { color: 'rgba(255,255,255,0.1)' },
        title: { display: true, text: 'Period', color: '#fff', font: { size: 14, weight: 'bold' as const } },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#fff',
          font: { size: 12, weight: 'bold' as const },
          callback: function(value) {
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value as number);
          }
        },
        grid: { color: 'rgba(255,255,255,0.1)' },
        title: { display: true, text: 'Revenue (₹)', color: '#fff', font: { size: 14, weight: 'bold' as const } },
      },
    },
  };

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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
            {summary && typeof summary.totalUsers !== 'undefined' && (
              <motion.div variants={cardVariants}>
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-red-500/30 transition-all duration-300 group cursor-pointer" onClick={() => router.push('/admin/users')}>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg text-slate-300 font-bold uppercase tracking-wider mb-2">Total Users</p>
                        <p className="text-3xl font-bold text-white">{summary.totalUsers.toLocaleString()}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                          <span className="text-green-400 text-sm font-medium">+12% this month</span>
                        </div>
                      </div>
                      <div className="w-16 h-11 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-8 h-6 text-white" />
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
                        <p className="text-3xl font-bold text-white">{summary.totalCanteens.toLocaleString()}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                          <span className="text-green-400 text-sm font-medium">+8% this month</span>
            </div>
          </div>
                      <div className="w-16 h-11 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Store className="w-8 h-6 text-white" />
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
                        <p className="text-3xl font-bold text-white"><CountUp end={totalOrders} /></p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                          <span className="text-green-400 text-sm font-medium">Monthly order volume</span>
            </div>
          </div>
                      <div className="w-16 h-11 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ShoppingCart className="w-8 h-6 text-white" />
          </div>
        </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {typeof totalRevenueValue !== 'undefined' && (
              <motion.div variants={cardVariants}>
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-yellow-500/30 transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg text-slate-300 font-bold uppercase tracking-wider mb-2">Total Revenue</p>
                        <p className="text-3xl font-bold text-white">₹<CountUp end={totalRevenueValue} /></p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                          <span className="text-green-400 text-sm font-medium">Cumulative earnings</span>
                        </div>
                      </div>
                      <div className="mx-3 w-24 h-11 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="w-8 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {typeof averageOrderValue !== 'undefined' && (
              <motion.div variants={cardVariants}>
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:border-cyan-500/30 transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg text-slate-300 font-bold uppercase tracking-wider mb-2">Avg. Order Value</p>
                        <p className="text-3xl font-bold text-white">₹<CountUp end={averageOrderValue} decimals={2} /></p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="w-4 h-4 text-red-400 mr-1" />
                          <span className="text-red-400 text-sm font-medium">Avg. value per order</span>
                        </div>
                      </div>
                      <div className="mx-2 w-20 h-11 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Award className="w-8 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
              </div>
              
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <motion.div variants={cardVariants}>
              <Card className="bg-gradient-to-br from-purple-500/80 to-violet-400/80 shadow-2xl border-0 rounded-2xl flex items-center justify-center h-full">
                  <CardContent className="flex flex-col items-center justify-center h-72 w-full">
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <div className="flex items-center justify-center mb-4">
                          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 shadow-lg">
                        <DollarSign className="w-10 h-10 text-black drop-shadow-lg" />
                          </span>
                        </div>
                    <span className="text-4xl font-extrabold text-black mb-2">Daily Revenue</span>
                    <span className="text-3xl font-bold text-black">₹<CountUp end={dailyRevenueValue} decimals={2} /></span>
                    <div className="flex items-center mt-4 text-black">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      <span className="text-base font-medium">Today's Earnings</span>
                </div>
                  </div>
                  </CardContent>
                </Card>
              </motion.div>

            {topSpenders.length > 0 && (
            <motion.div variants={cardVariants}>
                <Card className="bg-gradient-to-br from-red-500/80 to-red-500/80 shadow-2xl border-0 rounded-2xl flex items-center justify-center h-full">
                <CardContent className="flex flex-col items-center justify-center h-72 w-full">
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <div className="flex items-center justify-center mb-4">
                        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 shadow-lg">
                          <Crown className="w-10 h-10 text-black drop-shadow-lg" />
                        </span>
                      </div>
                      <span className="text-4xl font-extrabold text-black mb-2">Top Spender</span>
                      <span className="text-3xl font-bold text-black">{topSpenders[0].name || topSpenders[0].username}</span>
                      <span className="text-xl font-medium text-black mt-2">₹<CountUp end={topSpenders[0].amount || topSpenders[0].totalSpent} decimals={2} /></span>
                      <div className="flex items-center mt-4 text-black">
                        <Star className="w-5 h-5 mr-2" />
                        <span className="text-base font-medium">Highest Spending User</span>
                    </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <motion.div variants={cardVariants}>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Weekly Revenue Trends</h3>
                      <p className="text-slate-400 text-sm">Aggregated Weekly Earnings</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-72 w-full">
                  {weeklyRevenueChartData.labels.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-lg font-semibold text-white">
                      No weekly revenue data available
            </div>
                  ) : (
                    <Line data={weeklyRevenueChartData} options={revenueChartOptions} />
                  )}
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
                      <h3 className="text-lg font-semibold text-white">Monthly Revenue Trends</h3>
                      <p className="text-slate-400 text-sm">Aggregated Monthly Earnings</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-72 w-full">
                  {monthlyRevenueChartData.labels.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-lg font-semibold text-white">
                      No monthly revenue data available
                    </div>
                  ) : (
                    <Line data={monthlyRevenueChartData} options={revenueChartOptions} />
                  )}
                </CardContent>
              </Card>
            </motion.div>
              </div>

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
                      <h3 className="text-lg font-semibold text-white">Top Canteens by Orders</h3>
                      <p className="text-slate-400 text-sm">Canteens with highest order volume</p>
                  </div>
                </div>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '300px' }} className="flex items-center justify-center h-full">
                    {topCanteens.length === 0 ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No data available</div> : 
                      <Bar 
                        data={topCanteensChartData} 
                        options={topCanteensChartOptions} 
                      />
                    }
                  </div>
                </CardContent>
              </Card>
            </motion.div>
              </div>
              
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
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
                    {!orderStatus || Object.keys(orderStatus).length === 0 ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No data available</div> : 
                      <Pie 
                        data={orderStatusChartData} 
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: { color: '#fff', font: { size: 14, weight: 'bold' } },
                            },
                            datalabels: {
                              color: '#111',
                              font: { size: 22, weight: 'bold' },
                              formatter: (value, ctx) => {
                                const sum = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                                const percentage = (value * 100 / sum).toFixed(1) + '%';
                                return percentage;
                              },
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
                    {!userRoles || Object.keys(userRoles).length === 0 ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No data available</div> : 
                      <Pie 
                        data={userRolesChartData} 
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: { color: '#fff', font: { size: 14, weight: 'bold' } },
                            },
                            datalabels: {
                              color: '#111',
                              font: { size: 22, weight: 'bold' },
                              formatter: (value, ctx) => {
                                const sum = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                                const percentage = (value * 100 / sum).toFixed(1) + '%';
                                return percentage;
                              },
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
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Revenue by Payment Method</h3>
                      <p className="text-slate-400 text-sm">Breakdown of revenue sources</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center w-full" style={{ height: '340px', width: '340px', margin: '0 auto' }}>
                    {!revenueByPaymentMethod || revenueByPaymentMethod.length === 0 ? 
                      <div className="flex items-center justify-center h-full text-slate-400">No payment data available</div> : 
                      <Pie 
                        data={revenueByPaymentMethodChartData} 
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: { color: '#fff', font: { size: 14, weight: 'bold' } },
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.raw as number;
                                  return `${label}: ₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                }
                              }
                            }
                          },
                        }}
                      />
                    }
                  </div>
                </CardContent>
              </Card>
            </motion.div>
                </div>

          <motion.div variants={itemVariants} className="mb-12 my-20 w-full">
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 w-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <UserX className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Suspected Users</h3>
                    <p className="text-slate-400 text-sm">Users with suspicious activity or unpaid penalties</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 w-full">
                {Array.isArray(suspectedUsers) && suspectedUsers.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">No suspected users found.</div>
                ) : Array.isArray(suspectedUsers) && suspectedUsers.length > 0 ? (
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-white/20">
                      <thead className="bg-white/15">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Suspicious Count</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Penalty Amount</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Penalty Order</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Penalty Paid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {suspectedUsers.map((user, index) => (
                          <tr key={user.email + index} className="hover:bg-white/5">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.suspiciousCount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">₹{user.penalty?.Amount ?? user.penalty?.amount ?? 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.penalty?.Order?.OrderNumber ?? user.penalty?.order?.orderNumber ?? 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Badge variant={user.penalty?.isPaid === false ? "destructive" : "default"}>
                                {user.penalty?.isPaid === false ? "Unpaid" : "Paid"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400">No suspected users found.</div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Revenue by Campus and Canteen</h3>
                      <p className="text-slate-400 text-sm">Detailed revenue breakdown</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {revenueByCampusCanteen.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">No revenue by campus and canteen data available.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-white/20">
                        <thead className="bg-white/15">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Campus</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Canteen</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Total Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {revenueByCampusCanteen.map((data, index) => (
                            <tr key={data.campusId + data.canteenId + index} className="hover:bg-white/5">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{data.campusName || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{data.canteenName || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data.revenue || data.totalRevenue || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

    
        </motion.div>
      </motion.div>
    </div>
  )
}
