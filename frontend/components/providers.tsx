'use client';

import { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { SocketProvider } from "@/context/socket-context";

export function Providers({ children }: { children: ReactNode }) {
  const userId = "686e5ed1e3781b0cca2fb3c9"; // just for now
  const isVendor = false;

  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider userId={userId} isVendor={isVendor}>
          {children}
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}