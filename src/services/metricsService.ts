import { api } from '@/lib/api';
import type { Metrics } from '@/types/profile';

export async function getMetrics(): Promise<Metrics> {
  const response = await api.get<Metrics>('/metrics');
  return response.data;
}
