import { apiClient } from './client';
import type { StatsSummary, ActivityData, DecisionsData, StatsParams } from '@/types';

export const statsApi = {
  getSummary: async (params: StatsParams = {}): Promise<StatsSummary> => {
    const searchParams = new URLSearchParams();
    if (params.period) searchParams.append('period', params.period);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);

    const response = await apiClient.get<StatsSummary>(
      `/stats/summary?${searchParams.toString()}`
    );
    return response.data;
  },

  getActivityChart: async (params: StatsParams = {}): Promise<ActivityData[]> => {
    const searchParams = new URLSearchParams();
    if (params.period) searchParams.append('period', params.period);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);

    const response = await apiClient.get<ActivityData[]>(
      `/stats/chart/activity?${searchParams.toString()}`
    );
    return response.data;
  },

  getDecisionsChart: async (params: StatsParams = {}): Promise<DecisionsData> => {
    const searchParams = new URLSearchParams();
    if (params.period) searchParams.append('period', params.period);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);

    const response = await apiClient.get<DecisionsData>(
      `/stats/chart/decisions?${searchParams.toString()}`
    );
    return response.data;
  },

  getCategoriesChart: async (params: StatsParams = {}): Promise<Record<string, number>> => {
    const searchParams = new URLSearchParams();
    if (params.period) searchParams.append('period', params.period);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);

    const response = await apiClient.get<Record<string, number>>(
      `/stats/chart/categories?${searchParams.toString()}`
    );
    return response.data;
  },
};

