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
    // On mount, check admin status from localStorage
    const adminFlag = localStorage.getItem("isAdmin");
    setIsAdmin(adminFlag === "true");
  }, []);

  const login = () => {
    localStorage.setItem("isAdmin", "true");
    setIsAdmin(true);
  };
  const logout = () => {
    localStorage.removeItem("isAdmin");
    setIsAdmin(false);
  };

  const checkAdmin = async () => {
    const adminFlag = localStorage.getItem("isAdmin");
    setIsAdmin(adminFlag === "true");
    return adminFlag === "true";
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