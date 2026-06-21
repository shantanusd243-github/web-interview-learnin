import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

// 1. ADD THIS NEW GUARD AT THE BOTTOM:
export function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  // Wait for auth check to finish before deciding
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}>
        Loading...
      </div>
    );
  }

  // If they are already logged in, redirect them to the dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If they are NOT logged in, let them see the public page
  return children ? children : <Outlet />;
}