import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/api/stats';
import type { StatsParams } from '@/types';

export const useStatsSummary = (params: StatsParams) => {
  return useQuery({
    queryKey: ['stats', 'summary', params],
    queryFn: () => statsApi.getSummary(params),
  });
};

export const useActivityChart = (params: StatsParams) => {
  return useQuery({
    queryKey: ['stats', 'activity', params],
    queryFn: () => statsApi.getActivityChart(params),
  });
};

export const useDecisionsChart = (params: StatsParams) => {
  return useQuery({
    queryKey: ['stats', 'decisions', params],
    queryFn: () => statsApi.getDecisionsChart(params),
  });
};

export const useCategoriesChart = (params: StatsParams) => {
  return useQuery({
    queryKey: ['stats', 'categories', params],
    queryFn: () => statsApi.getCategoriesChart(params),
  });
};

