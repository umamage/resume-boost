import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, User, ResumeScore, Job } from './api';

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
    describe('login', () => {
      it('should successfully login with valid credentials', async () => {
        const result = await api.login({
          email: 'test@example.com',
          password: 'password123',
        });

        expect(result.user).toBeDefined();
        expect(result.user.email).toBe('test@example.com');
        expect(result.user.username).toBe('TestUser');
        expect(result.token).toBeDefined();
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', expect.any(String));
      });

      it('should throw error with invalid email', async () => {
        await expect(
          api.login({ email: 'wrong@example.com', password: 'password123' })
        ).rejects.toThrow('Invalid email or password');
      });

      it('should throw error with invalid password', async () => {
        await expect(
          api.login({ email: 'test@example.com', password: 'wrongpassword' })
        ).rejects.toThrow('Invalid email or password');
      });
    });

    describe('signup', () => {
      it('should successfully create a new account', async () => {
        const result = await api.signup({
          email: 'newuser@example.com',
          password: 'newpassword',
          username: 'NewUser',
        });

        expect(result.user).toBeDefined();
        expect(result.user.email).toBe('newuser@example.com');
        expect(result.user.username).toBe('NewUser');
        expect(result.token).toBeDefined();
      });

      it('should throw error if user already exists', async () => {
        await expect(
          api.signup({
            email: 'test@example.com',
            password: 'password',
            username: 'TestUser',
          })
        ).rejects.toThrow('User already exists');
      });
    });

    describe('logout', () => {
      it('should clear auth token from localStorage', async () => {
        // First login
        await api.login({ email: 'test@example.com', password: 'password123' });
        
        // Then logout
        await api.logout();
        
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      });
    });

    describe('getCurrentUser', () => {
      it('should return null when no user is logged in', async () => {
        localStorageMock.getItem.mockReturnValue(null);
        const user = await api.getCurrentUser();
        expect(user).toBeNull();
      });

      it('should return user when logged in', async () => {
        const mockUser: User = {
          id: '1',
          email: 'test@example.com',
          username: 'TestUser',
          createdAt: new Date().toISOString(),
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
        
        const user = await api.getCurrentUser();
        expect(user).toEqual(mockUser);
      });
    });

    describe('isAuthenticated', () => {
      it('should return false when no token exists', () => {
        localStorageMock.getItem.mockReturnValue(null);
        expect(api.isAuthenticated()).toBe(false);
      });

      it('should return true when token exists', () => {
        localStorageMock.getItem.mockReturnValue('mock-token');
        expect(api.isAuthenticated()).toBe(true);
      });
    });
  });

  describe('Resume Analysis', () => {
    it('should return a resume score object', async () => {
      const mockFile = new File(['test content'], 'resume.pdf', { type: 'application/pdf' });
      const result = await api.analyzeResume(mockFile);

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(65);
      expect(result.overall).toBeLessThanOrEqual(100);
      expect(result.categories).toBeDefined();
      expect(result.categories.formatting).toBeDefined();
      expect(result.categories.keywords).toBeDefined();
      expect(result.categories.experience).toBeDefined();
      expect(result.categories.education).toBeDefined();
      expect(result.categories.skills).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should return category scores between 0 and 100', async () => {
      const mockFile = new File(['test content'], 'resume.pdf', { type: 'application/pdf' });
      const result = await api.analyzeResume(mockFile);

      Object.values(result.categories).forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Job Recommendations', () => {
    it('should return an array of jobs', async () => {
      const result = await api.getJobRecommendations();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return jobs with required fields', async () => {
      const result = await api.getJobRecommendations();
      const job = result[0];

      expect(job.id).toBeDefined();
      expect(job.title).toBeDefined();
      expect(job.company).toBeDefined();
      expect(job.location).toBeDefined();
      expect(job.salary).toBeDefined();
      expect(job.matchScore).toBeDefined();
      expect(job.description).toBeDefined();
      expect(job.requirements).toBeInstanceOf(Array);
      expect(job.postedAt).toBeDefined();
      expect(job.type).toBeDefined();
    });

    it('should return jobs with valid match scores', async () => {
      const result = await api.getJobRecommendations();

      result.forEach((job) => {
        expect(job.matchScore).toBeGreaterThanOrEqual(0);
        expect(job.matchScore).toBeLessThanOrEqual(100);
      });
    });

    it('should return jobs with valid types', async () => {
      const validTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
      const result = await api.getJobRecommendations();

      result.forEach((job) => {
        expect(validTypes).toContain(job.type);
      });
    });
  });

  describe('Job Application', () => {
    it('should successfully apply to a job', async () => {
      const result = await api.applyToJob('1');

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(result.message).toContain('successfully');
    });

    it('should work with any job ID', async () => {
      const result = await api.applyToJob('random-id-123');

      expect(result.success).toBe(true);
    });
  });
});
