import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useCurrentUser } from '@/features/auth/useAuth';
import { useNeedsOnboarding } from '@/features/onboarding';
import { Skeleton } from './Skeleton';

const AuthLoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg" aria-busy>
    <div className="space-y-3 w-64">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-2/3" />
    </div>
  </div>
);

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { data, isLoading, isError } = useCurrentUser();
  const location = useLocation();
  const needsOnboarding = useNeedsOnboarding();

  if (isLoading) return <AuthLoadingScreen />;

  if (isError || !data) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Redirect to onboarding if the user hasn't completed it yet,
  // unless they're already on the onboarding route.
  if (needsOnboarding && !location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useCurrentUser();

  // Mirror ProtectedRoute's loading UI so users don't see a blank screen on
  // first visit while the session check is in flight.
  if (isLoading) return <AuthLoadingScreen />;

  if (data) return <Navigate to="/app" replace />;

  return <>{children}</>;
};
