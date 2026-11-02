import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api('/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const refreshUnread = () =>
    api('/notifications/unread').then((r) => setUnread(r.count)).catch(() => {});

  const authenticate = async (path, body) => {
    const data = await api(path, { method: 'POST', body });
    setUser(data.user);
  };
  const login = (email, password) => authenticate('/auth/login', { email, password });
  const signup = (username, email, password) => authenticate('/auth/signup', { username, email, password });
  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    setUser(null);
    setUnread(0);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout, unread, refreshUnread }}>
      {children}
    </AuthContext.Provider>
  );
}