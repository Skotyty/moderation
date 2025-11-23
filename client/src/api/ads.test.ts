import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adsApi } from './ads';
import { apiClient } from './client';
import type { AdsFilters, Advertisement, AdsListResponse } from '@/types';

vi.mock('./client');

describe('adsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAds', () => {
    const mockResponse: AdsListResponse = {
      ads: [
        {
          id: 1,
          title: 'Test Ad',
          description: 'Description',
          price: 1000,
          category: 'Electronics',
          categoryId: 1,
          status: 'pending',
          priority: 'normal',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          images: [],
          seller: {
            id: 1,
            name: 'Seller',
            rating: '4.5',
            totalAds: 10,
            registeredAt: '2024-01-01',
          },
          characteristics: {},
          moderationHistory: [],
        },
      ],
      pagination: {
        currentPage: 1,
        totalPages: 10,
        totalItems: 100,
        itemsPerPage: 10,
      },
    };

    it('fetches ads with filters', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const filters: AdsFilters = {
        page: 1,
        limit: 10,
        status: ['pending'],
      };

      const result = await adsApi.getAds(filters);

      expect(apiClient.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('builds correct query params for status filter', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const filters: AdsFilters = {
        status: ['pending', 'approved'],
      };

      await adsApi.getAds(filters);

      const callArgs = vi.mocked(apiClient.get).mock.calls[0][0];
      expect(callArgs).toContain('status=pending');
      expect(callArgs).toContain('status=approved');
    });

    it('builds correct query params for price range', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const filters: AdsFilters = {
        minPrice: 1000,
        maxPrice: 5000,
      };

      await adsApi.getAds(filters);

      const callArgs = vi.mocked(apiClient.get).mock.calls[0][0];
      expect(callArgs).toContain('minPrice=1000');
      expect(callArgs).toContain('maxPrice=5000');
    });

    it('builds correct query params for search', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const filters: AdsFilters = {
        search: 'test query',
      };

      await adsApi.getAds(filters);

      const callArgs = vi.mocked(apiClient.get).mock.calls[0][0];
      expect(callArgs).toContain('search=test');
    });

    it('builds correct query params for sorting', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const filters: AdsFilters = {
        sortBy: 'price',
        sortOrder: 'desc',
      };

      await adsApi.getAds(filters);

      const callArgs = vi.mocked(apiClient.get).mock.calls[0][0];
      expect(callArgs).toContain('sortBy=price');
      expect(callArgs).toContain('sortOrder=desc');
    });
  });

  describe('getAdById', () => {
    const mockAd: Advertisement = {
      id: 1,
      title: 'Test Ad',
      description: 'Description',
      price: 1000,
      category: 'Electronics',
      categoryId: 1,
      status: 'pending',
      priority: 'normal',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      images: [],
      seller: {
        id: 1,
        name: 'Seller',
        rating: '4.5',
        totalAds: 10,
        registeredAt: '2024-01-01',
      },
      characteristics: {},
      moderationHistory: [],
    };

    it('fetches ad by ID', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockAd });

      const result = await adsApi.getAdById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/ads/1');
      expect(result).toEqual(mockAd);
    });
  });

  describe('approveAd', () => {
    const mockAd: Advertisement = {
      id: 1,
      title: 'Test Ad',
      description: 'Description',
      price: 1000,
      category: 'Electronics',
      categoryId: 1,
      status: 'approved',
      priority: 'normal',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      images: [],
      seller: {
        id: 1,
        name: 'Seller',
        rating: '4.5',
        totalAds: 10,
        registeredAt: '2024-01-01',
      },
      characteristics: {},
      moderationHistory: [],
    };

    it('approves ad', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { ad: mockAd } });

      const result = await adsApi.approveAd(1);

      expect(apiClient.post).toHaveBeenCalledWith('/ads/1/approve');
      expect(result).toEqual(mockAd);
    });
  });

  describe('rejectAd', () => {
    const mockAd: Advertisement = {
      id: 1,
      title: 'Test Ad',
      description: 'Description',
      price: 1000,
      category: 'Electronics',
      categoryId: 1,
      status: 'rejected',
      priority: 'normal',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      images: [],
      seller: {
        id: 1,
        name: 'Seller',
        rating: '4.5',
        totalAds: 10,
        registeredAt: '2024-01-01',
      },
      characteristics: {},
      moderationHistory: [],
    };

    it('rejects ad with reason', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { ad: mockAd } });

      const rejectData = {
        reason: 'Запрещенный товар' as const,
        comment: 'Test comment',
      };

      const result = await adsApi.rejectAd(1, rejectData);

      expect(apiClient.post).toHaveBeenCalledWith('/ads/1/reject', rejectData);
      expect(result).toEqual(mockAd);
    });
  });

  describe('requestChanges', () => {
    const mockAd: Advertisement = {
      id: 1,
      title: 'Test Ad',
      description: 'Description',
      price: 1000,
      category: 'Electronics',
      categoryId: 1,
      status: 'pending',
      priority: 'normal',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      images: [],
      seller: {
        id: 1,
        name: 'Seller',
        rating: '4.5',
        totalAds: 10,
        registeredAt: '2024-01-01',
      },
      characteristics: {},
      moderationHistory: [],
    };

    it('requests changes with reason', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { ad: mockAd } });

      const requestData = {
        reason: 'Некорректное описание' as const,
        comment: 'Please update description',
      };

      const result = await adsApi.requestChanges(1, requestData);

      expect(apiClient.post).toHaveBeenCalledWith('/ads/1/request-changes', requestData);
      expect(result).toEqual(mockAd);
    });
  });
});



