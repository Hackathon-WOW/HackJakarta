import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  User,
  MSMEProfile,
  FinancialReport,
  PaginatedResponse,
  MSMEWithHealth,
  DashboardStats,
  MSMEAnalytics,
  ExtractedFinancialData,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    role: 'ADMIN' | 'MSME' | 'INVESTOR';
  }): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> => {
    const response = await api.post('/api/auth/change-password', data);
    return response.data;
  },
};

// MSME API
export const msmeApi = {
  getProfile: async (): Promise<ApiResponse<MSMEProfile>> => {
    const response = await api.get('/api/msme/profile/me');
    return response.data;
  },

  createProfile: async (data: Partial<MSMEProfile>): Promise<ApiResponse<MSMEProfile>> => {
    const response = await api.post('/api/msme/profile', data);
    return response.data;
  },

  updateProfile: async (data: Partial<MSMEProfile>): Promise<ApiResponse<MSMEProfile>> => {
    const response = await api.patch('/api/msme/profile', data);
    return response.data;
  },

  uploadDocument: async (
    file: File
  ): Promise<ApiResponse<{ financialReport: FinancialReport; extractedData: ExtractedFinancialData; reviewRequired: boolean }>> => {
    const formData = new FormData();
    formData.append('document', file);
    const response = await api.post('/api/msme/reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  submitText: async (
    text: string
  ): Promise<ApiResponse<{ financialReport: FinancialReport; extractedData: ExtractedFinancialData; reviewRequired: boolean }>> => {
    const response = await api.post('/api/msme/reports/text', { text });
    return response.data;
  },

  submitReport: async (data: Partial<FinancialReport>): Promise<ApiResponse<FinancialReport>> => {
    const response = await api.post('/api/msme/reports', data);
    return response.data;
  },

  updateReport: async (
    id: string,
    data: Partial<FinancialReport>
  ): Promise<ApiResponse<FinancialReport>> => {
    const response = await api.patch(`/api/msme/reports/${id}`, data);
    return response.data;
  },

  deleteReport: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/msme/reports/${id}`);
    return response.data;
  },
};

// Investor API
export const investorApi = {
  discoverMSMEs: async (
    page: number = 1,
    limit: number = 10,
    category?: string
  ): Promise<ApiResponse<PaginatedResponse<MSMEWithHealth>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (category) params.append('category', category);
    const response = await api.get(`/api/investor/msmes?${params}`);
    return response.data;
  },

  searchMSMEs: async (
    query: string,
    options?: {
      category?: string;
      minProfitMargin?: number;
      minRevenue?: number;
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<PaginatedResponse<MSMEWithHealth>>> => {
    const params = new URLSearchParams({ q: query });
    if (options?.category) params.append('category', options.category);
    if (options?.minProfitMargin) params.append('minProfitMargin', options.minProfitMargin.toString());
    if (options?.minRevenue) params.append('minRevenue', options.minRevenue.toString());
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    const response = await api.get(`/api/investor/msmes/search?${params}`);
    return response.data;
  },

  getMSMEAnalytics: async (id: string): Promise<ApiResponse<MSMEAnalytics>> => {
    const response = await api.get(`/api/investor/msmes/${id}/analytics`);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getUsers: async (
    page: number = 1,
    limit: number = 10,
    role?: string
  ): Promise<ApiResponse<{ users: User[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (role) params.append('role', role);
    const response = await api.get(`/api/admin/users?${params}`);
    return response.data;
  },

  getMSMEs: async (
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<ApiResponse<PaginatedResponse<MSMEProfile>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) params.append('status', status);
    const response = await api.get(`/api/admin/msmes?${params}`);
    return response.data;
  },

  getPendingVerifications: async (
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<MSMEProfile>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/api/admin/msmes/pending?${params}`);
    return response.data;
  },

  verifyMSME: async (
    id: string,
    status: 'VERIFIED' | 'REJECTED'
  ): Promise<ApiResponse<MSMEProfile>> => {
    const response = await api.patch(`/api/admin/msmes/${id}/verify`, { status });
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/admin/users/${id}`);
    return response.data;
  },
};

export default api;
