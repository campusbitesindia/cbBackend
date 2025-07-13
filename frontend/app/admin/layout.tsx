"use client";

import React, { useEffect, useState } from "react";
import AdminNavbar from "@/components/admin-navbar";
import { AdminAuthProvider, useAdminAuth } from "@/context/admin-auth-context";
import { usePathname, useRouter } from "next/navigation";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { checkAdmin } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = await checkAdmin();
      setIsAdmin(ok);
      setChecked(true);
      if (!ok && pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
      if (ok && pathname === "/admin/login") {
        router.replace("/admin/dashboard");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!checked && pathname !== "/admin/login") return null;
  if (!isAdmin && pathname !== "/admin/login") return null;
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminGuard>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#2d4a6b]">
          <AdminNavbar />
          <main className="flex-1 pt-20">{children}</main>
        </div>
      </AdminGuard>
    </AdminAuthProvider>
  );
} 