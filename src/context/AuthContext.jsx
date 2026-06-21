import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth';
import { setTokens, clearTokens } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasToken = !!localStorage.getItem('accessToken');
    if (!hasToken) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    setTokens(data);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    setTokens(data);
    setUser(data.user);
    return data.user;
  }, []);

  // 1. Moved inside the component and wrapped in useCallback for consistency
  const googleLogin = useCallback(async (idToken) => {
    const data = await authApi.googleLogin(idToken);

    // 2. Used your existing setTokens utility instead of undefined setToken/setRefreshToken
    setTokens(data);
    setUser(data.user);

    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout; clear client state regardless
    }
    clearTokens();
    setUser(null);
  }, []);

  const isAdmin = !!user?.roles?.includes('ADMIN');

  // 3. Combined into a single, clean return statement
  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}