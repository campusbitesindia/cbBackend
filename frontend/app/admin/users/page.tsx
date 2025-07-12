"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [userId: string]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/v1/admin/users/list-by-role");
        const data = res.data;
        const students = (data.students || []).map((u: any) => ({ ...u, role: "student" }));
        setUsers(students);
        setFilteredUsers(students);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter(
          (u) =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.role?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, users]);

  async function handleBanUser(userId: string, ban: boolean) {
    setActionLoading((l) => ({ ...l, [userId]: true }));
    const res = await api.post("/api/v1/admin/banUser", { userId, ban });
    setActionLoading((l) => ({ ...l, [userId]: false }));
    if (res.status === 200) {
      toast({ title: res.data.message || (ban ? "User banned" : "User unbanned") });
      setUsers((users) =>
        users.map((u) => (u._id === userId ? { ...u, isBanned: ban } : u))
      );
    } else {
      toast({ title: res.data.message || "Failed to update user", variant: "destructive" });
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">All Users</h1>
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <Input
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80"
        />
      </div>
      {loading ? (
        <div className="text-slate-300 py-12 text-center">Loading users...</div>
      ) : error ? (
        <div className="text-red-400 py-12 text-center">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white/10 rounded-xl">
          <table className="min-w-full text-white bg-white/5 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-white/10">
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Email</th>
                <th className="px-4 py-2 font-semibold">Role</th>
                <th className="px-4 py-2 font-semibold">Banned</th>
                <th className="px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-white/10 hover:bg-white/10 transition group">
                    <td className="px-4 py-2 font-medium cursor-pointer" onClick={() => setSelectedUser(user)}>{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2 capitalize">{user.role}</td>
                    <td className="px-4 py-2">
                      <Badge variant={user.isBanned ? "destructive" : "secondary"} className={user.isBanned ? "bg-red-500/90 text-white" : "bg-gray-700/80 text-white"}>
                        {user.isBanned ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-2">
              <div><span className="font-semibold">Name:</span> {selectedUser.name}</div>
              <div><span className="font-semibold">Email:</span> {selectedUser.email}</div>
              <div><span className="font-semibold">Role:</span> {selectedUser.role}</div>
              <div><span className="font-semibold">Banned:</span> {selectedUser.isBanned ? "Yes" : "No"}</div>
              {selectedUser.campus && <div><span className="font-semibold">Campus:</span> {selectedUser.campus.name || selectedUser.campus}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 