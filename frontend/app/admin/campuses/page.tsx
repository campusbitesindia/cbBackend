"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { useAdminAuth } from "@/context/admin-auth-context";
import { useRouter } from "next/navigation";

export default function AdminCampusesPage() {
  const [campuses, setCampuses] = useState<any[]>([]);
  const [filteredCampuses, setFilteredCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", code: "", city: "" });
  const [addLoading, setAddLoading] = useState(false);
  const { toast } = useToast();
  const [campusRequests, setCampusRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");
  const { checkAdmin } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const ok = await checkAdmin();
      if (!ok) router.replace("/admin/login");
    })();
  }, [checkAdmin, router]);

  useEffect(() => {
    async function fetchCampuses() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/v1/admin/campuses-summary");
        const campusSummaries = res.data.campuses || [];

        const campusesWithStudentCount = await Promise.all(
          campusSummaries.map(async (campus: any) => {
            try {
              const usersRes = await api.get(`/api/v1/admin/campus/${campus.campusId}/users`);
              const studentUsers = (usersRes.data.users || []).filter((u: any) => u.role === 'student');
              return { ...campus, userCount: studentUsers.length };
            } catch (error) {
              console.error(`Failed to fetch users for campus ${campus.name}:`, error);
              return { ...campus }; 
            }
          })
        );

        setCampuses(campusesWithStudentCount);
        setFilteredCampuses(campusesWithStudentCount);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchCampuses();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredCampuses(campuses);
    } else {
      setFilteredCampuses(
        campuses.filter(
          (c) =>
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.code?.toLowerCase().includes(search.toLowerCase()) ||
            c.city?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, campuses]);

  useEffect(() => {
    async function fetchCampusRequests() {
      setRequestsLoading(true);
      setRequestsError("");
      try {
        const res = await api.get("/api/v1/admin/campus-requests");
        setCampusRequests(res.data.requests || []);
      } catch (err: any) {
        setRequestsError(err.message || "Unknown error");
      } finally {
        setRequestsLoading(false);
      }
    }
    fetchCampusRequests();
    // Expose for manual refresh
    setRefreshCampusRequests(() => fetchCampusRequests);
  }, []);

  // Add refresh state
  const [refreshCampusRequests, setRefreshCampusRequests] = useState<() => void>(() => () => {});

  async function handleAddCampus() {
    setAddLoading(true);
    try {
      const res = await api.post("/api/v1/campuses/create", addForm);
      if (res.data.campus) {
        toast({ title: "Campus added" });
        setCampuses((prev) => [...prev, res.data.campus]);
        setAddDialogOpen(false);
        setAddForm({ name: "", code: "", city: "" });
      } else {
        toast({ title: "Failed to add campus", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Failed to add campus", description: err.message, variant: "destructive" });
    } finally {
      setAddLoading(false);
    }
  }

  async function handleCampusClick(campus: any) {
    router.push(`/admin/campuses/${campus.campusId}`);
  }

  // Approve campus request
  async function handleApproveRequest(req: any) {
    try {
      // Only create campus on approve
      const res = await api.post("/api/v1/campuses/create", {
        name: req.collegeName,
        code: req.collegeName.replace(/\s+/g, "_").toUpperCase().slice(0, 8),
        city: req.city,
      });
      await api.patch(`/api/v1/admin/campus-requests/${req._id}/review`, { approved: true });
      toast({ title: "Campus approved and created!" });
      setCampusRequests((prev) => prev.filter((r) => r._id !== req._id));
      const campusesRes = await api.get("/api/v1/admin/campuses-summary");
      setCampuses(campusesRes.data.campuses || []);
      setFilteredCampuses(campusesRes.data.campuses || []);
    } catch (err: any) {
      toast({ title: "Failed to approve campus", description: err.message, variant: "destructive" });
    }
  }
  // Reject campus request (mark as reviewed/rejected in backend)
  async function handleRejectRequest(req: any) {
    try {
      // Only mark as reviewed/rejected, do NOT create campus
      await api.patch(`/api/v1/admin/campus-requests/${req._id}/review`, { approved: false });
      setCampusRequests((prev) => prev.filter((r) => r._id !== req._id));
      toast({ title: "Campus request rejected" });
    } catch (err: any) {
      toast({ title: "Failed to reject campus request", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Registered Campuses</h1>
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <Input
          placeholder="Search by name, code, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80"
        />
        <Button onClick={() => setAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-semibold">Add Campus</Button>
      </div>
      {loading ? (
        <div className="text-slate-300 py-12 text-center">Loading campuses...</div>
      ) : error ? (
        <div className="text-red-400 py-12 text-center">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white/10 rounded-xl">
          <table className="min-w-full text-white bg-white/5 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-white/10">
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Code</th>
                <th className="px-4 py-2 font-semibold">City</th>
                <th className="px-4 py-2 font-semibold">Outlets</th>
                <th className="px-4 py-2 font-semibold">Users</th>
                <th className="px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampuses.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-slate-400">No campuses found.</td>
                </tr>
              ) : (
                filteredCampuses.map((campus) => (
                  <tr key={campus._id} className="border-b border-white/10 hover:bg-white/10 transition group">
                    <td className="px-4 py-2 font-medium">{campus.name}</td>
                    <td className="px-4 py-2">{campus.code}</td>
                    <td className="px-4 py-2">{campus.city}</td>
                    <td className="px-4 py-2">{campus.canteenCount}</td>
                    <td className="px-4 py-2">{campus.userCount}</td>
                    <td className="px-4 py-2">
                      <Button size="sm" className="bg-black hover:bg-neutral-900 text-white font-semibold" onClick={() => handleCampusClick(campus)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Campus Requests Section */}
      <div className="mt-12 bg-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Campus Requests</h2>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => refreshCampusRequests()}>Refresh</Button>
        </div>
        {requestsLoading ? (
          <div className="text-slate-300 py-8 text-center">Loading campus requests...</div>
        ) : requestsError ? (
          <div className="text-red-400 py-8 text-center">{requestsError}</div>
        ) : campusRequests.filter(r => r.isReviewed === false).length === 0 ? (
          <div className="text-slate-400 py-8 text-center">No campus requests found.</div>
        ) : (
          <div className="overflow-x-auto bg-white/5 rounded-xl">
            <table className="min-w-full text-white bg-white/5 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-white/10">
                  <th className="px-4 py-2 font-semibold">Name</th>
                  <th className="px-4 py-2 font-semibold">Email</th>
                  <th className="px-4 py-2 font-semibold">Mobile</th>
                  <th className="px-4 py-2 font-semibold">Role</th>
                  <th className="px-4 py-2 font-semibold">College</th>
                  <th className="px-4 py-2 font-semibold">City</th>
                  <th className="px-4 py-2 font-semibold">Message</th>
                  <th className="px-4 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campusRequests.filter(r => r.isReviewed === false).map((req) => (
                  <tr key={req._id} className="border-b border-white/10 hover:bg-white/10 transition group">
                    <td className="px-4 py-2">{req.name}</td>
                    <td className="px-4 py-2">{req.email}</td>
                    <td className="px-4 py-2">{req.mobile}</td>
                    <td className="px-4 py-2">{req.role}</td>
                    <td className="px-4 py-2">{req.collegeName}</td>
                    <td className="px-4 py-2">{req.city}</td>
                    <td className="px-4 py-2">{req.message || '-'}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproveRequest(req)}>Approve</Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleRejectRequest(req)}>Reject</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Campus Modal */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Campus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Campus Name"
              value={addForm.name}
              onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
            />
            <Input
              placeholder="Campus Code"
              value={addForm.code}
              onChange={e => setAddForm(f => ({ ...f, code: e.target.value }))}
            />
            <Input
              placeholder="City"
              value={addForm.city}
              onChange={e => setAddForm(f => ({ ...f, city: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddCampus} disabled={addLoading} className="bg-green-600 hover:bg-green-700 text-white font-semibold w-full">
              {addLoading ? "Adding..." : "Add Campus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 