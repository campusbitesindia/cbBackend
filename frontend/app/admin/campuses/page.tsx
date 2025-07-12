"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function AdminCampusesPage() {
  const [campuses, setCampuses] = useState<any[]>([]);
  const [filteredCampuses, setFilteredCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCampus, setSelectedCampus] = useState<any | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", code: "", city: "" });
  const [addLoading, setAddLoading] = useState(false);
  const { toast } = useToast();
  const [campusRequests, setCampusRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");

  useEffect(() => {
    async function fetchCampuses() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/v1/campuses");
        const data = res.data;
        setCampuses(data.campuses || []);
        setFilteredCampuses(data.campuses || []);
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
  }, []);

  async function handleAddCampus() {
    setAddLoading(true);
    try {
      const res = await api.post("/api/v1/campus/create", addForm);
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
                {/* <th className="px-4 py-2 font-semibold">Actions</th> */}
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
                    <td className="px-4 py-2 font-medium cursor-pointer" onClick={() => setSelectedCampus(campus)}>{campus.name}</td>
                    <td className="px-4 py-2">{campus.code}</td>
                    <td className="px-4 py-2">{campus.city}</td>
                    {/* <td className="px-4 py-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedCampus(campus)}>View Details</Button>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Campus Requests Section */}
      {/*
      <div className="mt-12 bg-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Campus Requests</h2>
        {requestsLoading ? (
          <div className="text-slate-300 py-8 text-center">Loading campus requests...</div>
        ) : requestsError ? (
          <div className="text-red-400 py-8 text-center">{requestsError}</div>
        ) : campusRequests.length === 0 ? (
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
                  <th className="px-4 py-2 font-semibold">Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {campusRequests.map((req) => (
                  <tr key={req._id} className="border-b border-white/10 hover:bg-white/10 transition group">
                    <td className="px-4 py-2">{req.name}</td>
                    <td className="px-4 py-2">{req.email}</td>
                    <td className="px-4 py-2">{req.mobile}</td>
                    <td className="px-4 py-2">{req.role}</td>
                    <td className="px-4 py-2">{req.collegeName}</td>
                    <td className="px-4 py-2">{req.city}</td>
                    <td className="px-4 py-2">{req.message || '-'}</td>
                    <td className="px-4 py-2">{req.isReviewed ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      */}
      {/* Campus Details Modal */}
      <Dialog open={!!selectedCampus} onOpenChange={() => setSelectedCampus(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Campus Details</DialogTitle>
          </DialogHeader>
          {selectedCampus && (
            <div className="space-y-2">
              <div><span className="font-semibold">Name:</span> {selectedCampus.name}</div>
              <div><span className="font-semibold">Code:</span> {selectedCampus.code}</div>
              <div><span className="font-semibold">City:</span> {selectedCampus.city}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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