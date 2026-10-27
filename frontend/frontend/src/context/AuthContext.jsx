import { createContext, useEffect, useState } from "react";
import API from "../api/axios";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await API.get("/users/me");

        setUser(response.data);

        localStorage.setItem(
          "user",
          JSON.stringify(response.data)
        );
      } catch (error) {
        console.error("Authentication initialization failed:", error);

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await API.post("/auth/login", {
      email,
      password,
    });

    const data = response.data;

    localStorage.setItem(
      "access_token",
      data.access_token
    );

    if (data.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setUser(data.user);
    } else {
      const profileResponse = await API.get("/users/me");

      localStorage.setItem(
        "user",
        JSON.stringify(profileResponse.data)
      );

      setUser(profileResponse.data);
    }

    return data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}