"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserCheck, UserX, ChevronDown, ChevronUp, CheckCircle2, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<{ [vendorId: string]: boolean }>({});
  const [expanded, setExpanded] = useState<{ [vendorId: string]: boolean }>({});
  const [payouts, setPayouts] = useState<{ [vendorId: string]: any[] }>({});
  const [payoutsLoading, setPayoutsLoading] = useState<{ [vendorId: string]: boolean }>({});
  const [approveLoading, setApproveLoading] = useState<{ [vendorId: string]: boolean }>({});
  const [owners, setOwners] = useState<any[]>([]); // <-- new
  const { toast } = useToast();

  async function fetchVendors() {
    setLoading(true);
    setError("");
    try {
      const vendorsRes = await api.get("/api/v1/admin/canteens?includeUnapproved=true");
      const canteens = vendorsRes.data.canteens || [];
      setVendors(canteens);
      setFilteredVendors(canteens);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  // Fetch all canteen owners for mapping
  async function fetchOwners() {
    try {
      const res = await api.get("/api/v1/admin/users/list-by-role");
      setOwners(res.data.canteenOwners || []);
    } catch (err) {
      // ignore for now
    }
  }

  useEffect(() => {
    fetchVendors();
    fetchOwners();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredVendors(vendors);
    } else {
      setFilteredVendors(
        vendors.filter(
          (u) =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, vendors]);

  async function handleBanVendor(userId: string, ban: boolean, canteenId: string) {
    setActionLoading((l) => ({ ...l, [userId]: true }));
    const res = await api.post("/api/v1/admin/suspendCanteen", { canteenId, suspend: ban });
    setActionLoading((l) => ({ ...l, [userId]: false }));
    if (res.status === 200) {
      toast({ title: res.data.message || (ban ? "Vendor banned" : "Vendor unbanned") });
      setVendors((vendors) =>
        vendors.map((v) =>
          v.owner && v.owner._id === userId
            ? { ...v, owner: { ...v.owner, isBanned: ban } }
            : v
        )
      );
      setFilteredVendors((vendors) =>
        vendors.map((v) =>
          v.owner && v.owner._id === userId
            ? { ...v, owner: { ...v.owner, isBanned: ban } }
            : v
        )
      );
      fetchVendors();
    } else {
      toast({ title: res.data.message || "Failed to update vendor", variant: "destructive" });
    }
  }

  async function handleApproveVendor(canteenId: string) {
    setApproveLoading((l) => ({ ...l, [canteenId]: true }));
    try {
      const approveRes = await api.post(`/api/v1/admin/vendors/${canteenId}/approve`, { approved: true });
      if (approveRes.status === 200) {
        toast({ title: approveRes.data.message || "Vendor approved" });
        setVendors((vendors) =>
          vendors.map((v) =>
            v._id === canteenId ? { ...v, approvalStatus: "approved" } : v
          )
        );
      } else {
        toast({ title: approveRes.data.message || "Failed to approve vendor", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: err.message || "Failed to approve vendor", variant: "destructive" });
    } finally {
      setApproveLoading((l) => ({ ...l, [canteenId]: false }));
    }
  }

  async function fetchVendorPayouts(vendor: any) {
    const canteenId = vendor.canteenId || vendor.canteen || vendor._id;
    setPayoutsLoading((l) => ({ ...l, [vendor._id]: true }));
    try {
      const res = await api.get(`/api/v1/admin/payouts/canteen/${canteenId}`);
      setPayouts((p) => ({ ...p, [vendor._id]: res.data.payouts || [] }));
    } catch (err) {
      setPayouts((p) => ({ ...p, [vendor._id]: [] }));
    } finally {
      setPayoutsLoading((l) => ({ ...l, [vendor._id]: false }));
    }
  }

  function handleExpand(vendor: any) {
    setExpanded((e) => {
      const next = { ...e, [vendor._id]: !e[vendor._id] };
      if (!e[vendor._id]) fetchVendorPayouts(vendor);
      return next;
    });
  }

  // Map ownerId to name (handle both string and object cases)
  const ownerMap = Object.fromEntries((owners || []).map((o: any) => [o._id, o.name]));

  // Helper to get owner name from vendor.owner (ID or object)
  function getOwnerName(owner: any) {
    if (!owner) return '-';
    if (typeof owner === 'string') return ownerMap[owner] || '-';
    if (typeof owner === 'object' && owner._id) return ownerMap[owner._id] || owner.name || '-';
    return '-';
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">All Vendors</h1>
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80"
        />
      </div>
      {loading ? (
        <div className="text-slate-300 py-12 text-center">Loading vendors...</div>
      ) : error ? (
        <div className="text-red-400 py-12 text-center">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white/10 rounded-xl">
          <table className="min-w-full text-white bg-white/5 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-white/10">
                <th className="px-4 py-2 font-semibold text-black">Name</th>
                <th className="px-4 py-2 font-semibold text-black">Owner</th>
                <th className="px-4 py-2 font-semibold text-black">Banned</th>
                <th className="px-4 py-2 font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">No vendors found.</td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor._id} className="border-b border-white/10 hover:bg-blue-900/40 transition group bg-blue-900/30 text-white">
                    <td className="px-4 py-2 font-medium text-white">
                      <Link href={`/admin/canteens/${vendor._id}`} className="hover:underline">
                        {vendor.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-white">{getOwnerName(vendor.owner)}</td>
                    <td className="px-4 py-2">
                      <Badge
                        variant={vendor.isSuspended || vendor.isBanned ? "destructive" : "secondary"}
                        className={vendor.isSuspended || vendor.isBanned ? "bg-green-500/90 text-white" : "bg-gray-700/80 text-white"}
                      >
                        {(vendor.isSuspended || vendor.isBanned) ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2 items-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className={`rounded-full border ${vendor.isSuspended ? 'text-green-400 border-green-400 hover:bg-green-600/20' : 'text-red-400 border-red-400 hover:bg-red-600/20'}`}
                                onClick={() => handleBanVendor(vendor.owner?._id, !vendor.isSuspended, vendor._id)}
                                aria-label={vendor.isSuspended ? "Unsuspend Vendor" : "Suspend Vendor"}
                                disabled={actionLoading[vendor.owner?._id]}
                              >
                                {actionLoading[vendor.owner?._id]
                                  ? <span className={`animate-spin w-5 h-5 border-2 ${vendor.isSuspended ? 'border-green-400' : 'border-red-400'} border-t-transparent rounded-full`}></span>
                                  : vendor.isSuspended
                                    ? <UserCheck className="w-5 h-5" />
                                    : <UserX className="w-5 h-5" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {vendor.isSuspended ? "Unsuspend Vendor" : "Suspend Vendor"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {vendor.approvalStatus !== "approved" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="rounded-full border text-white border-green-400 hover:bg-green-600/20"
                                  onClick={() => handleApproveVendor(vendor._id)}
                                  aria-label="Approve Vendor"
                                  disabled={approveLoading[vendor._id]}
                                >
                                  {approveLoading[vendor._id]
                                    ? <span className="animate-spin w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full"></span>
                                    : <CheckCircle2 className="w-5 h-5 text-green-400" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Approve
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useEffect as useEffect2, useState as useState2 } from "react";

function VendorMetrics({ vendor }: { vendor: any }) {
  const [metrics, setMetrics] = useState2<any>(null);
  const [loading, setLoading] = useState2(true);
  const [error, setError] = useState2("");
  useEffect2(() => {
    async function fetchMetrics() {
      setLoading(true);
      setError("");
      try {
        // Fetch vendor canteen details and stats
        const res = await api.get(`/api/v1/admin/vendors/${vendor.canteenId || vendor.canteen || vendor._id}/details`);
        setMetrics(res.data.data);
      } catch (err: any) {
        setError(err.message || "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, [vendor]);
  if (loading) return <div className="text-slate-400">Loading metrics...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!metrics) return <div className="text-slate-400">No metrics found.</div>;
  const { statistics, canteen } = metrics;
  return (
    <div className="space-y-2">
      <div><span className="font-semibold">Today's Revenue:</span> ₹{statistics?.totalRevenue || 0}</div>
      <div><span className="font-semibold">Total Orders:</span> {statistics?.totalOrders || 0}</div>
      <div><span className="font-semibold">Completed Orders:</span> {statistics?.completedOrders || 0}</div>
      <div><span className="font-semibold">Canteen Name:</span> {canteen?.name || '-'}</div>
      <div><span className="font-semibold">Approval Status:</span> {canteen?.approvalStatus || '-'}</div>
      <div><span className="font-semibold">Owner:</span> {canteen?.owner?.name || '-'}</div>
      {/* Add more metrics as needed */}
    </div>
  );
}

function VendorPayouts({ vendor }: { vendor: any }) {
  const [payouts, setPayouts] = useState2<any[]>([]);
  const [loading, setLoading] = useState2(true);
  const [error, setError] = useState2("");
  useEffect2(() => {
    async function fetchPayouts() {
      setLoading(true);
      setError("");
      try {
        const canteenId = vendor.canteenId || vendor.canteen || vendor._id;
        const res = await api.get(`/api/v1/admin/payouts/canteen/${canteenId}`);
        setPayouts(res.data.payouts || []);
      } catch (err: any) {
        setError(err.message || "Failed to load payouts");
      } finally {
        setLoading(false);
      }
    }
    fetchPayouts();
  }, [vendor]);
  if (loading) return <div className="text-slate-400">Loading payouts...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!payouts.length) return <div className="text-slate-400">No payouts found.</div>;
  return (
    <div className="overflow-x-auto bg-white/5 rounded-xl">
      <table className="min-w-full text-white bg-white/5 rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-white/10">
            <th className="px-4 py-2 font-semibold">Transaction ID</th>
            <th className="px-4 py-2 font-semibold">Date</th>
            <th className="px-4 py-2 font-semibold">Amount</th>
            <th className="px-4 py-2 font-semibold">Notes</th>
            <th className="px-4 py-2 font-semibold">Admin</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((p) => (
            <tr key={p._id} className="border-b border-white/10 hover:bg-white/10 transition group">
              <td className="px-4 py-2">{p.trnId}</td>
              <td className="px-4 py-2">{p.date ? new Date(p.date).toLocaleDateString() : "-"}</td>
              <td className="px-4 py-2">₹{p.amount}</td>
              <td className="px-4 py-2">{p.notes || "-"}</td>
              <td className="px-4 py-2">{p.admin?.name || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 