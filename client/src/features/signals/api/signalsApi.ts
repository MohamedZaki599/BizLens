import { api } from '@/lib/api';
import type { FinancialSignalDto } from '../types';

export const fetchSignals = async (): Promise<FinancialSignalDto[]> => {
  const { data } = await api.get('/signals');
  return data.signals;
};

export const fetchSignalByKey = async (key: string): Promise<FinancialSignalDto> => {
  const { data } = await api.get(`/signals/${key}`);
  return data.signal;
};

export const forceRecomputeSignals = async (): Promise<FinancialSignalDto[]> => {
  const { data } = await api.post('/signals/recompute');
  return data.signals;
};

export const updateSignalStatus = async (
  key: string,
  payload: { status: string; snoozedUntil?: string | null; resolutionNotes?: string }
): Promise<FinancialSignalDto> => {
  const { data } = await api.patch(`/signals/${key}`, payload);
  return data.signal;
};
