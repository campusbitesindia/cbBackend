'use client';

import { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { SocketProvider } from "@/context/socket-context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export function Providers({ children }: { children: ReactNode }) {
  const userId = "686e5ed1e3781b0cca2fb3c9"; // just for now
  const isVendor = false;

  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider userId={userId} isVendor={isVendor}>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-grow pt-20">{children}</main>
            <Footer />
          </div>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}