"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import { ArrowLeft, Store, Users, DollarSign, Star, Phone, Building, UserCircle2 } from "lucide-react";

export default function AdminCanteenAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const canteenId = params.canteenId as string;
  const [canteen, setCanteen] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [payoutsError, setPayoutsError] = useState("");

  useEffect(() => {
    async function fetchCanteen() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/v1/admin/vendors/${canteenId}/details`);
        setCanteen(res.data.data.canteen);
        setStats(res.data.data.statistics);
      } catch (err: any) {
        setError(err.message || "Failed to load canteen details");
      } finally {
        setLoading(false);
      }
    }
    async function fetchPayouts() {
      setPayoutsLoading(true);
      setPayoutsError("");
      try {
        const res = await api.get(`/api/v1/admin/payouts/canteen/${canteenId}`);
        setPayouts(res.data.payouts || []);
      } catch (err: any) {
        setPayoutsError(err.message || "Failed to load payouts");
      } finally {
        setPayoutsLoading(false);
      }
    }
    if (canteenId) {
      fetchCanteen();
      fetchPayouts();
    }
  }, [canteenId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-slate-300 py-12 text-center">Loading canteen details...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-red-400 py-12 text-center">{error}</div>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }
  if (!canteen) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-slate-400 py-12 text-center">Canteen not found</div>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
            <Store className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              {canteen.name}
              <Badge variant={canteen.isOpen ? 'default' : 'destructive'} className="ml-2">
                {canteen.isOpen ? 'Open' : 'Closed'}
              </Badge>
            </h1>
            <div className="flex items-center gap-3 text-slate-300 mt-1">
              <span className="flex items-center gap-1"><Building className="w-4 h-4" />{canteen.campus?.name || '-'}</span>
              <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{canteen.contactPhone || '-'}</span>
              <span className="flex items-center gap-1"><UserCircle2 className="w-4 h-4" />{canteen.owner?.name || '-'}</span>
            </div>
          </div>
        </div>
        <Button onClick={() => router.back()} variant="ghost" className="text-slate-400 hover:text-white border border-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" />Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalOrders || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-400" />Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{stats?.totalRevenue || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400" />Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.completedOrders || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Details & Description */}
      <Card className="bg-white/10 border-white/20 mb-8">
        <CardHeader>
          <CardTitle className="text-white text-lg">Canteen Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            <div>
              <div className="mb-2"><span className="font-semibold">Owner:</span> {canteen.owner?.name || '-'}</div>
              <div className="mb-2"><span className="font-semibold">Campus:</span> {canteen.campus?.name || '-'}</div>
              <div className="mb-2"><span className="font-semibold">Contact:</span> {canteen.contactPhone || '-'}</div>
              <div className="mb-2"><span className="font-semibold">Description:</span> {canteen.description || '-'}</div>
            </div>
            <div>
              <div className="mb-2"><span className="font-semibold">Business License:</span> {canteen.businessLicense || '-'}</div>
              <div className="mb-2"><span className="font-semibold">Operating Hours:</span> {canteen.operatingHours?.open || '-'} - {canteen.operatingHours?.close || '-'}</div>
              <div className="mb-2"><span className="font-semibold">Approval By:</span> admin</div>
              <div className="mb-2"><span className="font-semibold">Rejection Reason:</span> {canteen.rejectionReason || '-'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ratings Section (if available) */}
      {canteen.adminRatings && canteen.adminRatings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400" /> Admin Ratings</h2>
          <div className="flex flex-col md:flex-row gap-4">
            {canteen.adminRatings.map((r: any, idx: number) => (
              <Card key={idx} className="bg-white/10 border-white/20 flex-1 min-w-[220px]">
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold text-white">{r.rating} / 5</span>
                  </div>
                  <div className="text-slate-300">{r.feedback}</div>
                  <div className="text-slate-400 text-xs">{r.date ? new Date(r.date).toLocaleDateString() : ''}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <section className="mt-8">
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle>Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            {payoutsLoading ? (
              <div className="text-slate-400">Loading payouts...</div>
            ) : payoutsError ? (
              <div className="text-red-400">{payoutsError}</div>
            ) : payouts.length === 0 ? (
              <div className="text-slate-400">No payouts found for this canteen.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white/5 rounded-xl overflow-hidden border border-white/10 text-white">
                  <thead>
                    <tr className="bg-white/10">
                      <th className="px-4 py-2 font-semibold">Transaction ID</th>
                      <th className="px-4 py-2 font-semibold">Date</th>
                      <th className="px-4 py-2 font-semibold">Amount</th>
                      <th className="px-4 py-2 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p: any) => (
                      <tr key={p._id} className="border-b border-white/10 hover:bg-white/10 transition group">
                        <td className="px-4 py-2">{p.trnId}</td>
                        <td className="px-4 py-2">{p.date ? new Date(p.date).toLocaleDateString() : "-"}</td>
                        <td className="px-4 py-2">₹{p.amount}</td>
                        <td className="px-4 py-2">{p.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
} 