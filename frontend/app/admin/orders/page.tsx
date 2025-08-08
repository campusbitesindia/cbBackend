"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/context/admin-auth-context";
import { useRouter } from "next/navigation";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { checkAdmin } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const ok = await checkAdmin();
      if (!ok) router.replace("/admin/login");
    })();
  }, [checkAdmin, router]);

  useEffect(() => {
    setLoading(true);
    fetch("https://campusbites-mxpe.onrender.com/api/v1/admin/orders/by-campus-canteen")
      .then(res => res.json())
      .then(data => {
        setOrders(data || []);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch orders");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Orders by Campus & Canteen</h1>
      {loading ? (
        <div className="text-slate-300 py-12 text-center">Loading orders...</div>
      ) : error ? (
        <div className="text-red-400 py-12 text-center">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-slate-400 py-12 text-center">No orders found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {orders.map((order, idx) => (
            <Card key={idx} className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  {order.campusName} &mdash; {order.canteenName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white mb-2">
                  <span className="font-semibold">Campus:</span> {order.campusName}<br />
                  <span className="font-semibold">Canteen:</span> {order.canteenName}<br />
                  <span className="font-semibold">Total Orders:</span> {order.totalOrders}
                </div>
                <div className="text-slate-300 text-sm">
                  <span className="font-semibold">Campus ID:</span> {order.campusId}<br />
                  <span className="font-semibold">Canteen ID:</span> {order.canteenId}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 