"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { useAdminAuth } from "@/context/admin-auth-context";
import { ArrowLeft, Users } from "lucide-react";

export default function CampusUsersPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { checkAdmin } = useAdminAuth();
  const campusId = params.campusId as string;

  const [users, setUsers] = useState<any[]>([]);
  const [campusName, setCampusName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const ok = await checkAdmin();
      if (!ok) router.replace("/admin/login");
    })();
  }, [checkAdmin, router]);

  useEffect(() => {
    async function fetchUsers() {
      if (!campusId) return;
      setLoading(true);
      setError("");
      try {
        // Fetch campus details to get the name
        const campusRes = await api.get(`/api/v1/admin/campuses-summary`);
        const campusData = campusRes.data.campuses?.find((c: any) => c.campusId === campusId);
        if (campusData) {
          setCampusName(campusData.name);
        } else {
          setError("Campus not found");
          setLoading(false);
          return;
        }

        // Fetch users for the campus
        const usersRes = await api.get(`/api/v1/admin/campus/${campusId}/users`);
        const studentUsers = (usersRes.data.users || []).filter((u: any) => u.role === 'student');
        setUsers(studentUsers);
      } catch (err: any) {
        setError(err.message || "Failed to load users");
        toast({
          title: "Error",
          description: "Could not fetch users for the campus.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [campusId, toast, checkAdmin, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-slate-300 py-12 text-center">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-red-400 py-12 text-center">{error}</div>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <Button 
          onClick={() => router.push(`/admin/campuses/${campusId}`)} 
          variant="ghost" 
          className="mb-4 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {campusName || 'Campus'}
        </Button>
        <h1 className="text-3xl font-bold text-red-500 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            Users for {campusName} ({users.length})
        </h1>
      </div>

      {users.length === 0 ? (
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-6">
            <p className="text-slate-400 text-center">No users found for this campus.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user._id} className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2 ">
                  <h3 className="font-semibold text-white">{user.name}</h3>               
                </div>
                <p className="text-slate-300 text-sm">{user.email}</p>
                {user.phone && (
                  <p className="text-slate-400 text-sm mt-1">{user.phone}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
