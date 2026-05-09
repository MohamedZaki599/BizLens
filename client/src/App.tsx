import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { SubscriptionsPage } from '@/pages/SubscriptionsPage';
import { BudgetsPage } from '@/pages/BudgetsPage';
import { ImportPage } from '@/pages/ImportPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
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
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

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
