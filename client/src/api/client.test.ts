import { describe, it, expect } from 'vitest';
import { apiClient } from './client';

describe('apiClient', () => {
  it('has correct base URL', () => {
    expect(apiClient.defaults.baseURL).toBe('/api/v1');
  });

  it('has correct default headers', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});

