import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

/** Application shell — routes are wired up in subsequent commits. */
export const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-bg text-ink">
              <p className="text-sm text-ink-muted">BizLens</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);
