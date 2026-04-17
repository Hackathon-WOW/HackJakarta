export type UserRole = 'ADMIN' | 'MSME' | 'INVESTOR';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  msmeProfile?: MSMEProfile | null;
}

export interface MSMEProfile {
  id: string;
  companyName: string;
  companyCategory?: string | null;
  description?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  yearEstablished?: number | null;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner?: {
    email: string;
  };
  financialReports?: FinancialReport[];
}

export interface FinancialReport {
  id: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  period: string;
  periodStart: string;
  periodEnd: string;
  documentUrl?: string | null;
  rawData?: Record<string, unknown> | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  msmeId: string;
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

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  msmes: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MSMEWithHealth extends MSMEProfile {
  healthIndicators: {
    averageRevenue: number;
    averageProfit: number;
    profitMargin: number;
    revenueGrowth: number;
    reportCount: number;
    lastReportDate: string | null;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalMSMEs: number;
  pendingVerifications: number;
  totalReports: number;
  roleDistribution: Record<UserRole, number>;
}

export interface MSMEAnalytics {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    averageRevenue: number;
    averageProfit: number;
    averageProfitMargin: number;
    reportCount: number;
  };
  monthlyRevenue: Array<{
    period: string;
    revenue: number;
    expenses: number;
    profit: number;
    date: string;
  }>;
  bestPeriod: {
    period: string;
    profit: number;
    revenue: number;
  } | null;
  worstPeriod: {
    period: string;
    profit: number;
    revenue: number;
  } | null;
  profile: {
    id: string;
    companyName: string;
    companyCategory?: string | null;
    description?: string | null;
    address?: string | null;
    yearEstablished?: number | null;
  };
}
