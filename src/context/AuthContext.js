import React, { createContext, useContext, useState, useEffect } from "react";
import { authMe, authLogin } from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("eb_admin_token");
    if (!token) { setLoading(false); return; }
    authMe()
      .then(({ user }) => {
        if (user?.role === "admin") setUser(user);
        else localStorage.removeItem("eb_admin_token");
      })
      .catch(() => localStorage.removeItem("eb_admin_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { token, user } = await authLogin(email, password);
    if (user?.role !== "admin") throw new Error("Access denied. Admins only.");
    localStorage.setItem("eb_admin_token", token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("eb_admin_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
