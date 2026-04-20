import { api } from '@/lib/api';
import type { AlertItem } from '@/types/domain';

export const alertsApi = {
  async list(): Promise<{ alerts: AlertItem[]; unread: number }> {
    const { data } = await api.get<{ alerts: AlertItem[]; unread: number }>('/alerts');
    return data;
  },
  async unreadCount(): Promise<number> {
    const { data } = await api.get<{ unread: number }>('/alerts/unread-count');
    return data.unread;
  },
  async markRead(id: string): Promise<void> {
    await api.post(`/alerts/${id}/read`);
  },
  async markAllRead(): Promise<void> {
    await api.post('/alerts/read-all');
  },
  async dismiss(id: string): Promise<void> {
    await api.delete(`/alerts/${id}`);
  },
};
