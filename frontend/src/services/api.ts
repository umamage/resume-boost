import axiosClient from '@/lib/axios';

/**
 * API Service
 * Connects to the real backend via axios
 */

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface ResumeScore {
  overall: number;
  categories: {
    formatting: number;
    keywords: number;
    experience: number;
    education: number;
    skills: number;
  };
  suggestions: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  description: string;
  requirements: string[];
  postedAt: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  username: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const api = {
  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>('/auth/signup', credentials);
    const { token, user } = response.data;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  async logout(): Promise<void> {
    await axiosClient.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    try {
      const response = await axiosClient.get<User>('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  // Resume Analysis
  async analyzeResume(file: File): Promise<ResumeScore> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosClient.post<ResumeScore>('/api/resume/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Job Recommendations
  async getJobRecommendations(resumeScore?: ResumeScore): Promise<Job[]> {
    const response = await axiosClient.post<Job[]>('/api/jobs/recommendations', resumeScore || {});
    return response.data;
  },

  // Job Application
  async applyToJob(jobId: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosClient.post<{ success: boolean; message: string }>(`/api/jobs/${jobId}/apply`);
    return response.data;
  },
};

export default api;
