import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center bg-bg text-ink p-8">
                <p className="text-sm text-ink-muted">Dashboard loading…</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgb(var(--color-surface-lowest))',
            color: 'rgb(var(--color-ink))',
            border: '1px solid rgb(var(--color-outline) / 0.5)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </BrowserRouter>
  </QueryClientProvider>
);
