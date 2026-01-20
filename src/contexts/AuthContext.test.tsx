import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from '@/services/api';
import React from 'react';

// Mock the API
vi.mock('@/services/api', () => ({
  api: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should initialize with no user and loading state', async () => {
    (api.getCurrentUser as any).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should load existing user on mount', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'TestUser',
      createdAt: new Date().toISOString(),
    };
    (api.getCurrentUser as any).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should login successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'TestUser',
      createdAt: new Date().toISOString(),
    };
    (api.getCurrentUser as any).mockResolvedValue(null);
    (api.login as any).mockResolvedValue({ user: mockUser, token: 'token' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password' });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should signup successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'new@example.com',
      username: 'NewUser',
      createdAt: new Date().toISOString(),
    };
    (api.getCurrentUser as any).mockResolvedValue(null);
    (api.signup as any).mockResolvedValue({ user: mockUser, token: 'token' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.signup({
        email: 'new@example.com',
        password: 'password',
        username: 'NewUser',
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'TestUser',
      createdAt: new Date().toISOString(),
    };
    (api.getCurrentUser as any).mockResolvedValue(mockUser);
    (api.logout as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should throw error when useAuth is used outside provider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});
