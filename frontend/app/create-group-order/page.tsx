"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image"; // For displaying the QR code

interface Canteen {
  _id: string;
  name: string;
  // Add other canteen properties if needed
}

export default function CreateGroupOrderPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newGroupOrderDetails, setNewGroupOrderDetails] = useState<{
    groupLink: string;
    qrCodeUrl: string;
    groupOrderId: string;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?redirect=/create-group-order`);
      return;
    }
    fetchCanteens();
  }, [isAuthenticated, router]);

  const fetchCanteens = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/canteens", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch canteens");
      }
      const data = await res.json();
      setCanteens(data.canteens || []);
      if (data.canteens.length > 0 && !selectedCanteen) {
        setSelectedCanteen(data.canteens[0]._id); // Select first canteen by default
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    }
  };

  const handleCreateGroupOrder = async () => {
    if (!selectedCanteen) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a canteen to create a group order.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/v1/groupOrder/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ canteen: selectedCanteen }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create group order");
      }

      const data = await res.json();
      setNewGroupOrderDetails(data.data);
      toast({
        title: "Group Order Created!",
        description: "Share the link or QR code with your friends.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating group order",
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Start a New Group Order</CardTitle>
        </CardHeader>
        <CardContent>
          {!newGroupOrderDetails ? (
            <div className="space-y-6">
              <div>
                <Label htmlFor="canteen-select" className="mb-2 block">Select Canteen</Label>
                <Select
                  value={selectedCanteen || ""}
                  onValueChange={setSelectedCanteen}
                >
                  <SelectTrigger id="canteen-select" className="w-full">
                    <SelectValue placeholder="Choose a Canteen" />
                  </SelectTrigger>
                  <SelectContent>
                    {canteens.map((canteen) => (
                      <SelectItem key={canteen._id} value={canteen._id}>
                        {canteen.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreateGroupOrder}
                disabled={isLoading || !selectedCanteen}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-base"
              >
                {isLoading ? "Creating..." : "Create Group Order"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <h2 className="text-xl font-semibold text-green-600">Group Order Successfully Created!</h2>
              <p className="text-lg">Share this with your friends:</p>
              
              {newGroupOrderDetails.qrCodeUrl && (
                <div className="mt-4 flex flex-col items-center">
                  <Image
                    src={newGroupOrderDetails.qrCodeUrl}
                    alt="Group Order QR Code"
                    width={200}
                    height={200}
                    className="border rounded-lg p-2 bg-white"
                  />
                  <p className="text-sm text-gray-600 mt-2">Scan this QR code to join</p>
                </div>
              )}

              <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 break-words">
                <Label className="block text-gray-700 text-sm font-medium mb-1">Group Link:</Label>
                <p className="text-red-600 font-mono text-base">
                  {`http://localhost:3000/group-order?link=${newGroupOrderDetails.groupLink}`}
                </p>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`http://localhost:3000/group-order?link=${newGroupOrderDetails.groupLink}`);
                    toast({ description: "Link copied to clipboard!" });
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Copy Link
                </Button>
              </div>

              <Button
                onClick={() => router.push(`/group-order?link=${newGroupOrderDetails.groupLink}`)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-base"
              >
                Go to Group Order Page
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

