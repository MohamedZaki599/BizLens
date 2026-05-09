import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDashboardStore } from '../store/dashboardStore';
import { parseDashboardParams, serializeDashboardFilters } from '../utils/filters';

/**
 * One-way sync: URL → Store on mount only.
 * Store → URL when filters change (after mount).
 * Uses refs to prevent bidirectional update loops.
 */
export const useUrlSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setFilters = useDashboardStore((state) => state.setFilters);
  const filters = useDashboardStore((state) => state.filters);

  const hasMounted = useRef(false);
  const isUpdatingUrl = useRef(false);
  const isUpdatingStore = useRef(false);

  // On mount only: parse URL → Store
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    const parsed = parseDashboardParams(searchParams);
    isUpdatingStore.current = true;
    setFilters(parsed);
    // Reset flag after React flushes
    setTimeout(() => { isUpdatingStore.current = false; }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When store filters change: Store → URL
  useEffect(() => {
    if (!hasMounted.current) return;       // skip before mount
    if (isUpdatingStore.current) return;   // skip if we just updated store from URL

    const newParams = serializeDashboardFilters(filters);
    const currentStr = searchParams.toString();

    if (newParams.toString() !== currentStr) {
      isUpdatingUrl.current = true;
      setSearchParams(newParams, { replace: true });
      setTimeout(() => { isUpdatingUrl.current = false; }, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);
};
