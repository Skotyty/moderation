import { apiClient } from './client';
import type {
  Advertisement,
  AdsListResponse,
  AdsFilters,
  RejectAdRequest,
  RequestChangesRequest,
} from '@/types';

export const adsApi = {
  getAds: async (filters: AdsFilters): Promise<AdsListResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status && filters.status.length > 0) {
      filters.status.forEach((s) => params.append('status', s));
    }
    if (filters.priority && filters.priority.length > 0) {
      filters.priority.forEach((p) => params.append('priority', p));
    }
    if (filters.categoryId !== undefined) params.append('categoryId', filters.categoryId.toString());
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get<AdsListResponse>(`/ads?${params.toString()}`);
    return response.data;
  },

  getAdById: async (id: number): Promise<Advertisement> => {
    const response = await apiClient.get<Advertisement>(`/ads/${id}`);
    return response.data;
  },

  approveAd: async (id: number): Promise<Advertisement> => {
    const response = await apiClient.post<{ ad: Advertisement }>(`/ads/${id}/approve`);
    return response.data.ad;
  },

  rejectAd: async (id: number, data: RejectAdRequest): Promise<Advertisement> => {
    const response = await apiClient.post<{ ad: Advertisement }>(`/ads/${id}/reject`, data);
    return response.data.ad;
  },

  requestChanges: async (id: number, data: RequestChangesRequest): Promise<Advertisement> => {
    const response = await apiClient.post<{ ad: Advertisement }>(
      `/ads/${id}/request-changes`,
      data
    );
    return response.data.ad;
  },
};

