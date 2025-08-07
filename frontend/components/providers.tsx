'use client';

import { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { SocketProvider } from "@/context/socket-context";

export function Providers({ children }: { children: ReactNode }) {
 

  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}