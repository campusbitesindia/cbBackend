// ✅ THIS STAYS ON SERVER
import "./globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers"; // ✅ you'll create this file

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Campus Bites",
  description: "Order delicious food from campus outlets"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}