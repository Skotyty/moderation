import { describe, it, expect, vi, beforeEach } from 'vitest';
import { statsApi } from './stats';
import { apiClient } from './client';
import type { StatsSummary, ActivityData, DecisionsData, StatsParams } from '@/types';

vi.mock('./client');

describe('statsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSummary', () => {
    const mockSummary: StatsSummary = {
      totalReviewed: 100,
      totalReviewedToday: 10,
      totalReviewedThisWeek: 50,
      totalReviewedThisMonth: 100,
      approvedPercentage: 75,
      rejectedPercentage: 20,
      requestChangesPercentage: 5,
      averageReviewTime: 120,
    };

    it('fetches summary without params', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSummary });

      const result = await statsApi.getSummary();

      expect(apiClient.get).toHaveBeenCalledWith('/stats/summary?');
      expect(result).toEqual(mockSummary);
    });

    it('fetches summary with period param', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSummary });

      const params: StatsParams = {
        period: 'today',
      };

      const result = await statsApi.getSummary(params);

      const callArgs = vi.mocked(apiClient.get).mock.calls[0][0];
      expect(callArgs).toContain('period=today');
      expect(result).toEqual(mockSummary);
    });

    it('fetches summary with date range', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSummary });

      const params: StatsParams = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      await statsApi.getSummary(params);

      const callArgs = vi.mocked(apiClient.get).mock.calls[0][0];
      expect(callArgs).toContain('startDate=2024-01-01');
      expect(callArgs).toContain('endDate=2024-01-31');
    });
  });

  describe('getActivityChart', () => {
    const mockActivity: ActivityData[] = [
      {
        date: '2024-01-01',
        approved: 10,
        rejected: 5,
        requestChanges: 2,
      },
      {
        date: '2024-01-02',
        approved: 15,
        rejected: 3,
        requestChanges: 1,
      },
    ];

    it('fetches activity chart', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockActivity });

      const result = await statsApi.getActivityChart();

      expect(apiClient.get).toHaveBeenCalledWith('/stats/chart/activity?');
      expect(result).toEqual(mockActivity);
    });

    it('fetches activity chart with period', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockActivity });

      const params: StatsParams = {
        period: 'week',
      };

      await statsApi.getActivityChart(params);

      const callArgs = vi.mocked(apiClient.get).mock.calls[0][0];
      expect(callArgs).toContain('period=week');
    });
  });

  describe('getDecisionsChart', () => {
    const mockDecisions: DecisionsData = {
      approved: 75,
      rejected: 20,
      requestChanges: 5,
    };

    it('fetches decisions chart', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockDecisions });

      const result = await statsApi.getDecisionsChart();

      expect(apiClient.get).toHaveBeenCalledWith('/stats/chart/decisions?');
      expect(result).toEqual(mockDecisions);
    });

    it('fetches decisions chart with period', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockDecisions });

      const params: StatsParams = {
        period: 'month',
      };

      await statsApi.getDecisionsChart(params);

      const callArgs = vi.mocked(apiClient.get).mock.calls[0][0];
      expect(callArgs).toContain('period=month');
    });
  });

  describe('getCategoriesChart', () => {
    const mockCategories: Record<string, number> = {
      Electronics: 50,
      Clothing: 30,
      Home: 20,
    };

    it('fetches categories chart', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCategories });

      const result = await statsApi.getCategoriesChart();

      expect(apiClient.get).toHaveBeenCalledWith('/stats/chart/categories?');
      expect(result).toEqual(mockCategories);
    });

    it('fetches categories chart with custom dates', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCategories });

      const params: StatsParams = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      await statsApi.getCategoriesChart(params);

      const callArgs = vi.mocked(apiClient.get).mock.calls[0][0];
      expect(callArgs).toContain('startDate=2024-01-01');
      expect(callArgs).toContain('endDate=2024-12-31');
    });
  });

  describe('all endpoints', () => {
    it('handle errors correctly', async () => {
      const error = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(statsApi.getSummary()).rejects.toThrow('Network error');
    });
  });
});



