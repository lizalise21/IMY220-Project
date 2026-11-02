import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-center text-ink/60">Loading…</p>;
  return user ? children : <Navigate to="/login" replace />;
}