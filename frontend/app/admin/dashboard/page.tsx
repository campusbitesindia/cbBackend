"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Users, Store, ShoppingCart, DollarSign } from "lucide-react"
import { Line, Bar } from "react-chartjs-2"
import { motion, Variants } from "framer-motion"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Tick,
} from "chart.js"
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/context/admin-auth-context"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
}

interface SummaryData {
  totalUsers: number
  totalCanteens: number
  totalOrders: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const { checkAdmin } = useAdminAuth()
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const ok = await checkAdmin()
      if (!ok) router.replace("/admin/login")
    })()
  }, [checkAdmin, router])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [summaryRes, revenueRes] = await Promise.all([
          fetch("https://campusbites-mxpe.onrender.com/api/v1/admin/totals"),
          fetch("https://campusbites-mxpe.onrender.com/api/v1/admin/revenue/monthly"),
        ])

        const summaryData = await summaryRes.json()
        const revenueData = await revenueRes.json()

        if (!summaryRes.ok || !revenueRes.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        setSummary(summaryData.data)
        setMonthlyRevenue(revenueData.data || [])
      } catch (err: any) {
        setError(err.message)
        toast({ title: "Error", description: `Failed to load dashboard data: ${err.message}`, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const monthlyRevenueChartData = {
    labels: monthlyRevenue.map((r) => r._id || r.month || "Unknown"),
    datasets: [
      {
        label: "Monthly Revenue",
        data: monthlyRevenue.map((r) => r.revenue || r.total || 0),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderWidth: 2,
        fill: false,
      },
    ],
  }

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#fff" },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        type: "category",
        grid: { display: false },
        ticks: { color: "#fff" },
      },
      y: {
        type: "linear",
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: {
          color: "#fff",
          callback: (tickValue: string | number): string => {
            const value = Number(tickValue)
            return `₹${value >= 1000000 ? (value / 1000000).toFixed(1) + "M" : value >= 1000 ? (value / 1000).toFixed(0) + "K" : value}`
          },
        },
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-lg">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-red-400 text-lg">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gray-900">
      <motion.div className="max-w-7xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="mb-12" variants={itemVariants}>
          <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
          <p className="text-lg text-gray-300">Monitor and manage your campus food ecosystem</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {summary && (
            <>
              <motion.div variants={cardVariants}>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 uppercase">Total Users</p>
                        <p className="text-2xl font-bold text-white">{summary.totalUsers.toLocaleString()}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariants}>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 uppercase">Total Canteens</p>
                        <p className="text-2xl font-bold text-white">{summary.totalCanteens.toLocaleString()}</p>
                      </div>
                      <Store className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariants}>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 uppercase">Total Orders</p>
                        <p className="text-2xl font-bold text-white">{summary.totalOrders.toLocaleString()}</p>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={cardVariants}>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 uppercase">Total Revenue</p>
                        <p className="text-2xl font-bold text-white">₹{summary.totalRevenue.toLocaleString()}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        <motion.div variants={cardVariants}>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Monthly Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {monthlyRevenue.length === 0 ? (
                  <p className="text-gray-400 text-center">No revenue data available</p>
                ) : (
                  <Line data={monthlyRevenueChartData} options={chartOptions} />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}