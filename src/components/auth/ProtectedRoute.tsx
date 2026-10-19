import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import PageLoader from '@/components/ui/PageLoader';

/** Redirects signed-out visitors to /login, preserving where they were headed. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login?next=/dashboard" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
