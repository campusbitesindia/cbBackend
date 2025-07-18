"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { useAdminAuth } from "@/context/admin-auth-context";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Loader2, Eye } from "lucide-react";

export default function AdminPayoutsPage() {
  const { checkAdmin } = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [canteens, setCanteens] = useState<any[]>([]);
  const [filteredCanteens, setFilteredCanteens] = useState<any[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<any>(null);
  const [form, setForm] = useState({ trnId: "", date: "", amount: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [payouts, setPayouts] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ amount?: string; date?: string }>({});

  useEffect(() => {
    (async () => {
      const ok = await checkAdmin();
      if (!ok) router.replace("/admin/login");
    })();
  }, [checkAdmin, router]);

  useEffect(() => {
    async function fetchCanteens() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/v1/admin/canteens?includeUnapproved=true");
        setCanteens(res.data.canteens || []);
        setFilteredCanteens(res.data.canteens || []);
      } catch (err: any) {
        setError(err.message || "Failed to load canteens");
      } finally {
        setLoading(false);
      }
    }
    fetchCanteens();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredCanteens(canteens);
    } else {
      setFilteredCanteens(
        canteens.filter(
          (c) =>
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c._id?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, canteens]);

  async function fetchPayouts() {
    setPayoutsLoading(true);
    try {
      const res = await api.get("/api/v1/admin/payouts");
      setPayouts(res.data.payouts || []);
    } catch (err: any) {
      toast({ title: "Failed to load payouts", description: err.message, variant: "destructive" });
    } finally {
      setPayoutsLoading(false);
    }
  }

  useEffect(() => {
    fetchPayouts();
  }, []);

  function validateForm() {
    const errors: { amount?: string; date?: string } = {};
    const amountNum = Number(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      errors.amount = "Amount must be a positive number.";
    }
    if (!form.date) {
      errors.date = "Date is required.";
    } else {
      const selectedDate = new Date(form.date);
      const today = new Date();
      selectedDate.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      if (selectedDate > today) {
        errors.date = "Date cannot be in the future.";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!selectedCanteen) {
      toast({ title: "Select a canteen/vendor first", variant: "destructive" });
      return;
    }
    if (!form.trnId || !form.date || !form.amount) {
      toast({ title: "All fields except notes are required", variant: "destructive" });
      return;
    }
    if (!validateForm()) {
      toast({ title: "Please fix the errors in the form.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/v1/admin/payouts", {
        canteenId: selectedCanteen._id,
        trnId: form.trnId,
        date: form.date,
        amount: Number(form.amount),
        notes: form.notes,
      });
      toast({ title: "Payout recorded successfully" });
      setForm({ trnId: "", date: "", amount: "", notes: "" });
      setSelectedCanteen(null);
      fetchPayouts();
      setFormErrors({});
    } catch (err: any) {
      toast({ title: "Failed to record payout", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Payouts</h1>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Search and select canteen/vendor */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Search className="w-5 h-5" /> Search Vendor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
            />
            {loading ? (
              <div className="text-slate-300 py-4 text-center flex items-center justify-center"><Loader2 className="animate-spin mr-2" />Loading...</div>
            ) : error ? (
              <div className="text-red-400 py-4 text-center">{error}</div>
            ) : (
              <div className="max-h-[32rem] overflow-y-auto">
                {filteredCanteens.length === 0 ? (
                  <div className="text-slate-400 text-center">No vendors found.</div>
                ) : (
                  filteredCanteens.map((c) => (
                    <div
                      key={c._id}
                      className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer mb-1 ${selectedCanteen?._id === c._id ? "bg-blue-600 text-white" : "hover:bg-white/20 text-white"}`}
                      onClick={() => setSelectedCanteen(c)}
                    >
                      <span className="font-semibold">{c.name}</span>
                      <Badge variant="secondary" className="ml-2">{c._id.slice(-6)}</Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Payout form */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-lg">Record Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-1">Selected Vendor</label>
                <div className="bg-white/20 rounded px-3 py-2 text-white font-semibold min-h-[40px]">
                  {selectedCanteen ? selectedCanteen.name : <span className="text-slate-300">None selected</span>}
                </div>
              </div>
              <div>
                <label className="block text-white mb-1">Transaction ID</label>
                <Input
                  value={form.trnId}
                  onChange={e => setForm(f => ({ ...f, trnId: e.target.value }))}
                  placeholder="Transaction ID"
                  className="bg-white/20 text-white placeholder:text-slate-300"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Amount</label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="Amount"
                  className="bg-white/20 text-white placeholder:text-slate-300"
                  min={1}
                  step="any"
                />
                {formErrors.amount && <div className="text-red-400 text-sm mt-1">{formErrors.amount}</div>}
              </div>
              <div>
                <label className="block text-white mb-1">Date</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="bg-white/20 text-white placeholder:text-slate-300"
                  max={new Date().toISOString().split('T')[0]}
                />
                {formErrors.date && <div className="text-red-400 text-sm mt-1">{formErrors.date}</div>}
              </div>
              <div>
                <label className="block text-white mb-1">Notes (optional)</label>
                <Input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notes"
                  className="bg-white/20 text-white placeholder:text-slate-300"
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
                Record Payout
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      {/* Payouts List */}
      <div className="mt-12 bg-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">All Payouts</h2>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={fetchPayouts} disabled={payoutsLoading}>
            {payoutsLoading ? <Loader2 className="animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-1" />} View All
          </Button>
        </div>
        {payoutsLoading ? (
          <div className="text-slate-300 py-8 text-center flex items-center justify-center"><Loader2 className="animate-spin mr-2" />Loading payouts...</div>
        ) : payouts.length === 0 ? (
          <div className="text-slate-400 py-8 text-center">No payouts found.</div>
        ) : (
          <div className="overflow-x-auto bg-white/5 rounded-xl">
            <table className="min-w-full text-white bg-white/5 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-white/10">
                  <th className="px-4 py-2 font-semibold text-black">Vendor</th>
                  <th className="px-4 py-2 font-semibold text-black">Transaction ID</th>
                  <th className="px-4 py-2 font-semibold text-black">Date</th>
                  <th className="px-4 py-2 font-semibold text-black">Amount</th>
                  <th className="px-4 py-2 font-semibold text-black">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p._id} className="border-b border-white/10 hover:bg-white/10 transition group">
                    <td className="px-4 py-2">
                      <span
                        className="text-green-500 font-semibold cursor-pointer hover:underline"
                        onClick={() => router.push(`/admin/vendors/${p.canteen?._id}/details`)}
                      >
                        {p.canteen?.name || "-"}
                      </span>
                    </td>
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
      </div>
    </div>
  );
}
