import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  role: z.enum(['ADMIN', 'MSME', 'INVESTOR'], {
    errorMap: () => ({ message: 'Role must be ADMIN, MSME, or INVESTOR' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const msmeProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyCategory: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  yearEstablished: z.number().int().positive().optional(),
});

export const financialReportSchema = z.object({
  revenue: z.number().min(0, 'Revenue must be non-negative'),
  expenses: z.number().min(0, 'Expenses must be non-negative'),
  netProfit: z.number(),
  period: z.string().min(1, 'Period is required'),
  periodStart: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  periodEnd: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const updateProfileSchema = msmeProfileSchema.partial();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
