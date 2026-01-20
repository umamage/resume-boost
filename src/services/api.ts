/**
 * Centralized Mock API Service
 * All backend calls are centralized here for easy replacement with real API
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

// Simulated delay to mimic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user storage
let mockUsers: Map<string, User & { password: string }> = new Map();
let currentToken: string | null = null;

// Initialize with a test user
mockUsers.set('test@example.com', {
  id: '1',
  email: 'test@example.com',
  username: 'TestUser',
  password: 'password123',
  createdAt: new Date().toISOString(),
});

export const api = {
  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800);
    
    const user = mockUsers.get(credentials.email);
    if (!user || user.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }
    
    const token = `mock-token-${Date.now()}`;
    currentToken = token;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    }));
    
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    await delay(800);
    
    if (mockUsers.has(credentials.email)) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: `${mockUsers.size + 1}`,
      email: credentials.email,
      username: credentials.username,
      password: credentials.password,
      createdAt: new Date().toISOString(),
    };
    
    mockUsers.set(credentials.email, newUser);
    
    const token = `mock-token-${Date.now()}`;
    currentToken = token;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      createdAt: newUser.createdAt,
    }));
    
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        createdAt: newUser.createdAt,
      },
      token,
    };
  },

  async logout(): Promise<void> {
    await delay(300);
    currentToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(200);
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  // Resume Analysis
  async analyzeResume(file: File): Promise<ResumeScore> {
    await delay(2000); // Simulate processing time
    
    // Mock score generation based on file
    const baseScore = 65 + Math.random() * 25;
    
    return {
      overall: Math.round(baseScore),
      categories: {
        formatting: Math.round(60 + Math.random() * 35),
        keywords: Math.round(55 + Math.random() * 40),
        experience: Math.round(50 + Math.random() * 45),
        education: Math.round(70 + Math.random() * 25),
        skills: Math.round(60 + Math.random() * 35),
      },
      suggestions: [
        'Add more industry-specific keywords to improve ATS compatibility',
        'Consider adding quantifiable achievements (e.g., "Increased sales by 25%")',
        'Include a professional summary at the top of your resume',
        'Add more technical skills relevant to your target positions',
        'Consider reformatting to use bullet points for better readability',
      ],
    };
  },

  // Job Recommendations
  async getJobRecommendations(resumeScore?: ResumeScore): Promise<Job[]> {
    await delay(1000);
    
    const jobs: Job[] = [
      {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        salary: '$150,000 - $200,000',
        matchScore: 92,
        description: 'Join our innovative team to build next-generation cloud solutions.',
        requirements: ['5+ years experience', 'React/TypeScript', 'Cloud platforms'],
        postedAt: '2 days ago',
        type: 'Full-time',
      },
      {
        id: '2',
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'Remote',
        salary: '$120,000 - $160,000',
        matchScore: 88,
        description: 'Build and scale our core product with modern technologies.',
        requirements: ['3+ years experience', 'Node.js', 'React', 'PostgreSQL'],
        postedAt: '1 week ago',
        type: 'Remote',
      },
      {
        id: '3',
        title: 'Frontend Engineer',
        company: 'DesignStudio',
        location: 'New York, NY',
        salary: '$110,000 - $140,000',
        matchScore: 85,
        description: 'Create beautiful, responsive user interfaces for our clients.',
        requirements: ['2+ years experience', 'React', 'CSS/Tailwind', 'Figma'],
        postedAt: '3 days ago',
        type: 'Full-time',
      },
      {
        id: '4',
        title: 'Backend Developer',
        company: 'DataFlow Systems',
        location: 'Austin, TX',
        salary: '$130,000 - $170,000',
        matchScore: 79,
        description: 'Design and implement robust backend services and APIs.',
        requirements: ['4+ years experience', 'Python/Django', 'REST APIs', 'AWS'],
        postedAt: '5 days ago',
        type: 'Full-time',
      },
      {
        id: '5',
        title: 'DevOps Engineer',
        company: 'CloudNative Co',
        location: 'Seattle, WA',
        salary: '$140,000 - $180,000',
        matchScore: 74,
        description: 'Manage and improve our cloud infrastructure and CI/CD pipelines.',
        requirements: ['3+ years experience', 'Kubernetes', 'Terraform', 'AWS/GCP'],
        postedAt: '1 day ago',
        type: 'Contract',
      },
    ];
    
    return jobs;
  },

  // Job Application
  async applyToJob(jobId: string): Promise<{ success: boolean; message: string }> {
    await delay(1500);
    
    return {
      success: true,
      message: 'Your application has been submitted successfully!',
    };
  },
};

export default api;
