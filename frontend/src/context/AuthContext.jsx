import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMe();
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const { data } = await api.post("/auth/register", { name, email, password });
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  function loginWithGoogle() {
    window.location.href = "/api/auth/google";
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
