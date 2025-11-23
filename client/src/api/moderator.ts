import { apiClient } from './client';
import type { Moderator } from '@/types';

export const moderatorApi = {
  getCurrentModerator: async (): Promise<Moderator> => {
    const response = await apiClient.get<Moderator>('/moderators/me');
    return response.data;
  },
};



