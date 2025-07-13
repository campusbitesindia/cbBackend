import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/axios";

interface AdminAuthContextType {
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  checkAdmin: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  login: () => {},
  logout: () => {},
  checkAdmin: async () => false,
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // On mount, check admin status with backend
    checkAdmin();
  }, []);

  const login = () => {
    localStorage.setItem("isAdmin", "true");
    setIsAdmin(true);
  };
  const logout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("token");
    setIsAdmin(false);
  };

  const checkAdmin = async () => {
    const token = localStorage.getItem("token");
    console.log("Token in checkAdmin:", token);
    if (!token) {
      setIsAdmin(false);
      return false;
    }
    try {
      const res = await api.get("/api/v1/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Profile response:", res.data);
      if (res.data?.user?.role === "admin") {
        setIsAdmin(true);
        return true;
      } else {
        setIsAdmin(false);
        return false;
      }
    } catch {
      setIsAdmin(false);
      return false;
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout, checkAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
} 