import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'MSME' | 'INVESTOR';
  };
}

export interface RegisterInput {
  email: string;
  password: string;
  role: 'ADMIN' | 'MSME' | 'INVESTOR';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface MSMEProfileInput {
  companyName: string;
  companyCategory?: string;
  description?: string;
  address?: string;
  contactPerson?: string;
  yearEstablished?: number;
}

export interface FinancialReportInput {
  revenue: number;
  expenses: number;
  netProfit: number;
  period: string;
  periodStart: Date;
  periodEnd: Date;
}

export interface ExtractedFinancialData {
  revenue: number;
  expenses: number;
  netProfit: number;
  period: string;
  periodStart: string;
  periodEnd: string;
  rawData?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
