"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ThankYouPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-4xl font-bold mb-6 text-green-600">Thank You!</h1>
      <p className="mb-6 text-lg text-gray-700">Your payment was successful.</p>
      <div className="flex gap-4">
        <Button onClick={() => router.push("/orders")} className="bg-red-600 text-white hover:bg-red-700">
          View My Orders
        </Button>
        <Button onClick={() => router.push("/")} variant="outline" className="text-red-600 border-red-600 hover:bg-red-100">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
