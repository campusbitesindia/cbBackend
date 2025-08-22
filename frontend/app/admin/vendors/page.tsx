"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserCheck, UserX, ChevronDown, ChevronUp, CheckCircle2, Ban, Star, StarHalf, StarOff } from "lucide-react";
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
  const [ratingLoading, setRatingLoading] = useState<{ [vendorId: string]: boolean }>({});
  const [owners, setOwners] = useState<any[]>([]);
  const { toast } = useToast();

  async function fetchVendors() {
    setLoading(true);
    setError("");
    try {
      // Fetch all canteens including unapproved ones
      const vendorsRes = await api.get("/api/v1/admin/canteens");
      const canteens = Array.isArray(vendorsRes.data?.canteens) ? vendorsRes.data.canteens : [];
      
      // Ensure consistent data structure for all vendors
      const processedVendors = canteens.map((vendor: any) => ({
        ...vendor,
        _id: vendor._id?.toString(),
        owner: vendor.owner || null,
        isSuspended: vendor.isSuspended || false,
        isBanned: vendor.isBanned || false,
        approvalStatus: vendor.approvalStatus || 'pending',
        rating: vendor.rating || {
          average: vendor.adminRatings?.length > 0 
            ? vendor.adminRatings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / vendor.adminRatings.length 
            : 0,
          count: vendor.adminRatings?.length || 0
        }
      }));
      
      setVendors(processedVendors);
      setFilteredVendors(processedVendors);
    } catch (err: any) {
      console.error("Error fetching vendors:", err);
      setError(err.response?.data?.message || err.message || "Failed to load vendors");
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
      console.error("Error fetching owners:", err);
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
    
    try {
      const res = await api.post("/api/v1/admin/suspendCanteen", { 
        canteenId, 
        suspend: ban 
      });
      
      if (res.status === 200) {
        toast({ 
          title: res.data.message || (ban ? "Vendor banned" : "Vendor unbanned"),
          variant: "default"
        });
        
        // Refresh the vendors list to get updated data
        await fetchVendors();
      } else {
        throw new Error(res.data.message || "Failed to update vendor");
      }
    } catch (error: any) {
      console.error("Error banning vendor:", error);
      toast({ 
        title: error.response?.data?.message || error.message || "Failed to update vendor", 
        variant: "destructive" 
      });
    } finally {
      setActionLoading((l) => ({ ...l, [userId]: false }));
    }
  }

  // Handle vendor rating
  async function handleRateVendor(canteenId: string, rating: number) {
    const vendorId = canteenId?.toString();
    if (!vendorId) {
      toast({
        title: "Cannot rate vendor",
        description: "Invalid vendor ID",
        variant: "destructive"
      });
      return;
    }

    // Check if vendor is approved
    const vendor = vendors.find(v => v._id === vendorId);
    if (vendor?.approvalStatus !== 'approved' && !vendor?.isApproved) {
      toast({
        title: "Cannot rate vendor",
        description: "Please approve the vendor before rating.",
        variant: "destructive"
      });
      return;
    }

    setRatingLoading((l) => ({ ...l, [vendorId]: true }));
    
    try {
      const rateRes = await api.post(
        `/api/v1/admin/rateVendors`,
        {
          canteenId: vendorId,
          rating,
          feedback: `Admin rating: ${rating} stars`
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      if (rateRes.status === 200) {
        // Update the vendor's rating without refreshing the whole list
        setVendors(prevVendors => 
          prevVendors.map(vendor => {
            if (vendor._id === vendorId) {
              const newAdminRatings = [...(vendor.adminRatings || []), 
                { rating, feedback: `Admin rating: ${rating} stars`, date: new Date() }
              ];
              const totalRatings = newAdminRatings.reduce((sum, r) => sum + r.rating, 0);
              const avgRating = totalRatings / newAdminRatings.length;
              
              return {
                ...vendor,
                adminRatings: newAdminRatings,
                rating: {
                  average: avgRating,
                  count: newAdminRatings.length
                }
              };
            }
            return vendor;
          })
        );
        
        toast({
          title: "Rating Submitted",
          description: `Rated vendor ${rating} star${rating !== 1 ? 's' : ''}`,
          variant: "default"
        });
      } else {
        throw new Error(rateRes.data?.message || "Failed to submit rating");
      }
    } catch (err: any) {
      console.error("Error rating vendor:", err);
      toast({
        title: "Rating Failed",
        description: err.response?.data?.message || err.message || "An error occurred while submitting the rating.",
        variant: "destructive"
      });
    } finally {
      setRatingLoading((l) => ({ ...l, [vendorId]: false }));
    }
  }

  // Render star rating component
  function StarRating({ 
    rating, 
    onRate, 
    loading = false, 
    size = 4 
  }: { 
    rating: number, 
    onRate?: (rating: number) => void, 
    loading?: boolean,
    size?: number
  }) {
    const [hover, setHover] = useState(0);
    
    if (loading) {
      return <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-${size} h-${size} text-yellow-400 opacity-50`} 
          />
        ))}
      </div>;
    }
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = hover ? star <= hover : star <= Math.round(rating || 0);
          const isHalf = !hover && star - 0.5 <= (rating || 0) && star > (rating || 0);
          
          return (
            <button
              key={star}
              type="button"
              className={`p-1 ${onRate ? 'cursor-pointer' : 'cursor-default'}`}
              onMouseEnter={() => onRate && setHover(star)}
              onMouseLeave={() => onRate && setHover(0)}
              onClick={() => onRate && onRate(star)}
              disabled={!onRate}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              {isFilled ? (
                <Star className={`w-${size} h-${size} text-yellow-400 fill-current`} />
              ) : isHalf ? (
                <StarHalf className={`w-${size} h-${size} text-yellow-400 fill-current`} />
              ) : (
                <Star className={`w-${size} h-${size} text-gray-400`} />
              )}
            </button>
          );
        })}
        {rating > 0 && (
          <span className="text-xs text-gray-400 ml-1">
            ({rating.toFixed(1)})
          </span>
        )}
      </div>
    );
  }

  // Updated approve vendor function with better error handling and email confirmation
  async function handleApproveVendor(canteenId: string) {
    const vendorId = canteenId?.toString();
    if (!vendorId) {
      toast({
        title: "Cannot approve vendor",
        description: "Invalid vendor ID",
        variant: "destructive"
      });
      return;
    }

    setApproveLoading((l) => ({ ...l, [vendorId]: true }));
    
    try {
      const approveRes = await api.post(
        `/api/v1/admin/vendors/${vendorId}/approve`,
        { 
          approved: true,
          rejectionReason: ""
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      if (approveRes.status === 200) {
        // Update the vendor's approval status
        setVendors(prevVendors => 
          prevVendors.map(vendor => 
            vendor._id === vendorId 
              ? { 
                  ...vendor, 
                  approvalStatus: 'approved',
                  isApproved: true,
                  approvedAt: new Date().toISOString()
                } 
              : vendor
          )
        );
        
        // Show success message - the backend response should include the email confirmation
        const vendorName = vendors.find(v => v._id === vendorId)?.name || "Vendor";
        const ownerEmail = vendors.find(v => v._id === vendorId)?.owner?.email || "owner";
        
        toast({ 
          title: "Vendor Approved Successfully!",
          description: `${vendorName} has been approved and email notification sent to ${ownerEmail}`,
          variant: "default"
        });
        
        console.log("Vendor approved successfully. Email notification sent via backend.");
      } else {
        throw new Error(approveRes.data?.message || "Failed to approve vendor");
      }
    } catch (err: any) {
      console.error("Error approving vendor:", err);
      
      // More detailed error handling
      let errorMessage = "An error occurred while approving the vendor.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({ 
        title: "Approval Failed",
        description: errorMessage,
        variant: "destructive" 
      });
    } finally {
      setApproveLoading((l) => ({ ...l, [vendorId]: false }));
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

  // Helper to get owner email for display
  function getOwnerEmail(owner: any) {
    if (!owner) return '-';
    if (typeof owner === 'object' && owner.email) return owner.email;
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
                <th className="px-4 py-2 font-semibold text-black">Rating</th>
                <th className="px-4 py-2 font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">No vendors found.</td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor._id} className="border-b border-white/10 hover:bg-blue-900/40 transition group bg-blue-900/30 text-white">
                    <td className="px-4 py-2 font-medium text-white">
                      <Link href={`/admin/canteens/${vendor._id}`} className="hover:underline">
                        {vendor.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-white">
                      <div className="flex flex-col">
                        <span>{getOwnerName(vendor.owner)}</span>
                        <span className="text-xs text-gray-400">{getOwnerEmail(vendor.owner)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        variant={vendor.isSuspended || vendor.isBanned ? "destructive" : "secondary"}
                        className={vendor.isSuspended || vendor.isBanned ? "bg-red-500/90 text-white" : "bg-gray-700/80 text-white"}
                      >
                        {(vendor.isSuspended || vendor.isBanned) ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center min-w-[120px]">
                        {vendor.approvalStatus === "approved" ? (
                          <div className="flex flex-col items-start">
                            <StarRating 
                              rating={vendor.rating?.average || 0} 
                              onRate={(rating) => handleRateVendor(vendor._id, rating)}
                              loading={ratingLoading[vendor._id]}
                              size={5}
                            />
                            {vendor.rating?.count > 0 && (
                              <span className="text-xs text-gray-400 mt-1">
                                {vendor.rating.count} rating{vendor.rating.count !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Approve to rate</span>
                        )}
                      </div>
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
                                Approve & Send Email
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