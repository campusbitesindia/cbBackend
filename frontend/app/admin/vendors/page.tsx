"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [vendorId: string]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    async function fetchVendors() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/v1/admin/users/list-by-role");
        const data = res.data;
        const canteenOwners = (data.canteenOwners || []).map((u: any) => ({ ...u, role: "canteen" }));
        setVendors(canteenOwners);
        setFilteredVendors(canteenOwners);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
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

  async function handleBanVendor(vendorId: string, ban: boolean) {
    setActionLoading((l) => ({ ...l, [vendorId]: true }));
    const res = await api.post("/api/v1/admin/banUser", { userId: vendorId, ban });
    setActionLoading((l) => ({ ...l, [vendorId]: false }));
    if (res.status === 200) {
      toast({ title: res.data.message || (ban ? "Vendor banned" : "Vendor unbanned") });
      setVendors((vendors) =>
        vendors.map((u) => (u._id === vendorId ? { ...u, isBanned: ban } : u))
      );
    } else {
      toast({ title: res.data.message || "Failed to update vendor", variant: "destructive" });
    }
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
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Email</th>
                <th className="px-4 py-2 font-semibold">Banned</th>
                <th className="px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">No vendors found.</td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor._id} className="border-b border-white/10 hover:bg-white/10 transition group">
                    <td className="px-4 py-2 font-medium cursor-pointer" onClick={() => setSelectedVendor(vendor)}>{vendor.name}</td>
                    <td className="px-4 py-2">{vendor.email}</td>
                    <td className="px-4 py-2">
                      <Badge variant={vendor.isBanned ? "destructive" : "secondary"} className={vendor.isBanned ? "bg-red-500/90 text-white" : "bg-gray-700/80 text-white"}>
                        {vendor.isBanned ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`rounded-full border ${vendor.isBanned ? 'text-green-400 border-green-400 hover:bg-green-600/20' : 'text-red-400 border-red-400 hover:bg-red-600/20'}`}
                        onClick={() => handleBanVendor(vendor._id, !vendor.isBanned)}
                        aria-label={vendor.isBanned ? "Unban Vendor" : "Ban Vendor"}
                        disabled={actionLoading[vendor._id]}
                      >
                        {actionLoading[vendor._id]
                          ? <span className={`animate-spin w-5 h-5 border-2 ${vendor.isBanned ? 'border-green-400' : 'border-red-400'} border-t-transparent rounded-full`}></span>
                          : vendor.isBanned
                            ? <UserCheck className="w-5 h-5" />
                            : <UserX className="w-5 h-5" />}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Vendor Details Modal */}
      <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-2">
              <div><span className="font-semibold">Name:</span> {selectedVendor.name}</div>
              <div><span className="font-semibold">Email:</span> {selectedVendor.email}</div>
              <div><span className="font-semibold">Banned:</span> {selectedVendor.isBanned ? "Yes" : "No"}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 