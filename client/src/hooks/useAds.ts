import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adsApi } from '@/api/ads';
import type { AdsFilters, RejectAdRequest, RequestChangesRequest } from '@/types';

export const useAds = (filters: AdsFilters, keepPreviousData = false) => {
  return useQuery({
    queryKey: ['ads', filters],
    queryFn: () => adsApi.getAds(filters),
    placeholderData: keepPreviousData ? (previousData: any) => previousData : undefined,
  });
};

export const useAd = (id: number) => {
  return useQuery({
    queryKey: ['ad', id],
    queryFn: () => adsApi.getAdById(id),
    enabled: !!id,
  });
};

const invalidateAdQueries = (queryClient: any) => {
  queryClient.invalidateQueries({ 
    queryKey: ['ads'],
    refetchType: 'active'
  });
  queryClient.invalidateQueries({ 
    queryKey: ['ad'],
    refetchType: 'active'
  });
  queryClient.invalidateQueries({ 
    queryKey: ['stats'],
    refetchType: 'active'
  });
};

export const useApproveAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adsApi.approveAd(id),
    onSuccess: () => invalidateAdQueries(queryClient),
  });
};

export const useRejectAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectAdRequest }) =>
      adsApi.rejectAd(id, data),
    onSuccess: () => invalidateAdQueries(queryClient),
  });
};

export const useRequestChanges = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RequestChangesRequest }) =>
      adsApi.requestChanges(id, data),
    onSuccess: () => invalidateAdQueries(queryClient),
  });
};

