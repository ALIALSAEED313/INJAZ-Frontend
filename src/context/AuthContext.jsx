import { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser, logout } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser();

        setUser(user);
      } catch (error) {
        console.error(error);
        localStorage.removeItem("token");

        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  function handleLogout() {
    logout();

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout: handleLogout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
