import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import api from './api';
import axiosClient from '@/lib/axios';

// Mock the axios client
vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('API Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should successfully login and store token', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', username: 'TestUser', createdAt: '2023-01-01' },
          token: 'mock-token'
        }
      };
      (axiosClient.post as any).mockResolvedValue(mockResponse);

      const result = await api.login({ email: 'test@example.com', password: 'password' });

      expect(axiosClient.post).toHaveBeenCalledWith('/auth/login', { email: 'test@example.com', password: 'password' });
      expect(result).toEqual(mockResponse.data);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'mock-token');
    });

    it('should successfully signup and store token', async () => {
      const mockResponse = {
        data: {
          user: { id: '2', email: 'new@example.com', username: 'NewUser', createdAt: '2023-01-01' },
          token: 'new-token'
        }
      };
      (axiosClient.post as any).mockResolvedValue(mockResponse);

      const result = await api.signup({ email: 'new@example.com', password: 'password', username: 'NewUser' });

      expect(axiosClient.post).toHaveBeenCalledWith('/auth/signup', { email: 'new@example.com', password: 'password', username: 'NewUser' });
    });

    it('should logout and clear storage', async () => {
      (axiosClient.post as any).mockResolvedValue({});

      await api.logout();

      expect(axiosClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('Resume Analysis', () => {
    it('should send file to analyze endpoint', async () => {
      const mockScore = { overall: 85, suggestions: [] };
      (axiosClient.post as any).mockResolvedValue({ data: mockScore });

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
      const result = await api.analyzeResume(file);

      expect(axiosClient.post).toHaveBeenCalledWith(
        '/api/resume/analyze',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    });
  });

  describe('Job Recommendations', () => {
    it('should get recommendations', async () => {
      const mockJobs = [{ id: '1', title: 'Job 1' }];
      (axiosClient.post as any).mockResolvedValue({ data: mockJobs });

      const result = await api.getJobRecommendations();

      expect(axiosClient.post).toHaveBeenCalledWith('/api/jobs/recommendations', {});
      expect(result).toEqual(mockJobs);
    });
  });

  describe('Job Application', () => {
    it('should apply to job', async () => {
      const mockResponse = { success: true, message: 'Applied' };
      (axiosClient.post as any).mockResolvedValue({ data: mockResponse });

      const result = await api.applyToJob('123');

      expect(axiosClient.post).toHaveBeenCalledWith('/api/jobs/123/apply');
    });
  });
});
