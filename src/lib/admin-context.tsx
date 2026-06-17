"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface AdminContextValue {
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  adminOpen: boolean;
  setAdminOpen: (open: boolean) => void;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const login = useCallback(() => {
    setIsAdmin(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("admin_session", "true");
    }
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    setAdminOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_session");
    }
  }, []);

  // Restore session on mount handled in component

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, adminOpen, setAdminOpen }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
