"use client";

import React from "react";
import AdminNavbar from "@/components/admin-navbar";
import { AdminAuthProvider/*, useAdminAuth*/ } from "@/context/admin-auth-context";
// import { usePathname, useRouter } from "next/navigation";

// function AdminGuard({ children }: { children: React.ReactNode }) {
//   const { isAdmin } = useAdminAuth();
//   const pathname = usePathname();
//   const router = useRouter();
//
//   React.useEffect(() => {
//     if (!isAdmin && pathname !== "/admin/login") {
//       router.replace("/admin/login");
//     }
//     if (isAdmin && pathname === "/admin/login") {
//       router.replace("/admin/dashboard");
//     }
//   }, [isAdmin, pathname, router]);
//
//   if (!isAdmin && pathname !== "/admin/login") return null;
//   return <>{children}</>;
// }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      {/* <AdminGuard> */}
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#2d4a6b]">
          <AdminNavbar />
          <main className="flex-1 pt-20">{children}</main>
        </div>
      {/* </AdminGuard> */}
    </AdminAuthProvider>
  );
} 