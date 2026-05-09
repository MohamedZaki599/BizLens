import { differenceInMinutes, formatDistanceToNow } from 'date-fns';
import type { FreshnessStatus } from '../types';

export const STALE_THRESHOLDS_MINUTES = {
  dashboard: 5,
  alert: 30,
  analytical: 60,
};

export const getFreshnessStatus = (
  generatedAt: Date | string,
  ttlCategory: string = 'dashboard',
  isFetching: boolean = false
): FreshnessStatus => {
  if (isFetching) return 'updating';
  
  const date = new Date(generatedAt);
  const ageMinutes = differenceInMinutes(new Date(), date);
  const threshold = STALE_THRESHOLDS_MINUTES[ttlCategory as keyof typeof STALE_THRESHOLDS_MINUTES] || 5;

  return ageMinutes > threshold ? 'stale' : 'fresh';
};

export const formatSignalAge = (generatedAt: Date | string): string => {
  return formatDistanceToNow(new Date(generatedAt), { addSuffix: true });
};
