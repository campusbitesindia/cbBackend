"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { useAdminAuth } from "@/context/admin-auth-context";
import { ArrowLeft, Users, Store, MapPin, Building } from "lucide-react";

export default function CampusDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { checkAdmin } = useAdminAuth();
  const campusId = params.campusId as string;

  const [campus, setCampus] = useState<any>(null);

  const [canteens, setCanteens] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const ok = await checkAdmin();
      if (!ok) router.replace("/admin/login");
    })();
  }, [checkAdmin, router]);

  useEffect(() => {
    async function fetchCampusDetails() {
      setLoading(true);
      setError("");
      try {
        const [campusRes, canteensRes, usersRes] = await Promise.all([
          api.get(`/api/v1/admin/campuses-summary`),
          api.get(`/api/v1/admin/campus/${campusId}/canteens`),
          api.get(`/api/v1/admin/campus/${campusId}/users`),
        ]);

        const campusData = campusRes.data.campuses?.find((c: any) => c.campusId === campusId);
        if (!campusData) {
          setError("Campus not found");
          return;
        }

        setCampus(campusData);
        setCanteens(canteensRes.data.canteens || []);
        const studentUsers = (usersRes.data.users || []).filter((u: any) => u.role === 'student');
        setStudentCount(studentUsers.length);
      } catch (err: any) {
        setError(err.message || "Failed to load campus details");
      } finally {
        setLoading(false);
      }
    }

    if (campusId) {
      fetchCampusDetails();
    }
  }, [campusId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-slate-300 py-12 text-center">Loading campus details...</div>
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

  if (!campus) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-slate-400 py-12 text-center">Campus not found</div>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          onClick={() => router.push('/admin/campuses')} 
          variant="ghost" 
          className="mb-4 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campuses
        </Button>
        <h1 className="text-3xl font-bold text-red-500 mb-2">{campus.name}</h1>
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{campus.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span>Code: {campus.code}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card 
          className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
          onClick={() => router.push(`/admin/campuses/${campusId}/users`)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              <span className="text-2xl font-bold text-white">{studentCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Total Canteens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold text-white">{campus.canteenCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Campus ID</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs font-mono">
              {campus.campusId}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Canteens Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-red-500 mb-4 flex items-center gap-2">
          <Store className="w-6 h-6 text-green-400" />
          Canteens ({canteens.length})
        </h2>
        {canteens.length === 0 ? (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <p className="text-slate-400 text-center">No canteens found for this campus.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {canteens.map((canteen) => (
              <Card
                key={canteen._id}
                className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                onClick={() => router.push(`/admin/canteens/${canteen._id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{canteen.name}</h3>
                    <Badge variant={canteen.isOpen ? 'default' : 'destructive'}>
                      {canteen.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  {canteen.owner && canteen.owner.name && (
                    <p className="text-slate-300 text-sm">Owner: {canteen.owner.name}</p>
                  )}
                  {canteen.cuisine && (
                    <p className="text-slate-400 text-sm mt-1">Cuisine: {canteen.cuisine}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 