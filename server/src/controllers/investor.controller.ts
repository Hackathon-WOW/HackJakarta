import { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';
import { sendSuccess, sendNotFound } from '../utils/response.js';

export const discoverMSMEs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string | undefined;
    const skip = (page - 1) * limit;

    const where: any = { verificationStatus: 'VERIFIED' };
    if (category) {
      where.companyCategory = category;
    }

    const [msmes, total] = await Promise.all([
      prisma.mSMEProfile.findMany({
        where,
        include: {
          owner: {
            select: { email: true },
          },
          financialReports: {
            orderBy: { periodEnd: 'desc' },
            take: 12, // Get last 12 months for trend analysis
          },
        },
        skip,
        take: limit,
      }),
      prisma.mSMEProfile.count({ where }),
    ]);

    // Calculate financial health indicators for each MSME
    const msmesWithHealthIndicators = msmes.map((msme) => {
      const reports = msme.financialReports;
      const averageRevenue = reports.length > 0
        ? reports.reduce((sum, r) => sum + r.revenue, 0) / reports.length
        : 0;
      const averageProfit = reports.length > 0
        ? reports.reduce((sum, r) => sum + r.netProfit, 0) / reports.length
        : 0;
      const profitMargin = averageRevenue > 0
        ? (averageProfit / averageRevenue) * 100
        : 0;

      // Calculate revenue growth trend
      let revenueGrowth = 0;
      if (reports.length >= 2) {
        const recentRevenue = reports[0].revenue;
        const olderRevenue = reports[reports.length - 1].revenue;
        if (olderRevenue > 0) {
          revenueGrowth = ((recentRevenue - olderRevenue) / olderRevenue) * 100;
        }
      }

      return {
        ...msme,
        healthIndicators: {
          averageRevenue,
          averageProfit,
          profitMargin: Math.round(profitMargin * 100) / 100,
          revenueGrowth: Math.round(revenueGrowth * 100) / 100,
          reportCount: reports.length,
          lastReportDate: reports[0]?.periodEnd || null,
        },
      };
    });

    sendSuccess(res, 'MSMEs discovered successfully', {
      msmes: msmesWithHealthIndicators,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMSMEAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const profile = await prisma.mSMEProfile.findUnique({
      where: { id },
      include: {
        owner: {
          select: { email: true },
        },
        financialReports: {
          orderBy: { periodEnd: 'desc' },
        },
      },
    });

    if (!profile) {
      sendNotFound(res, 'MSME not found');
      return;
    }

    if (profile.verificationStatus !== 'VERIFIED') {
      sendNotFound(res, 'MSME profile is not verified');
      return;
    }

    const reports = profile.financialReports;

    // Calculate analytics
    const totalRevenue = reports.reduce((sum, r) => sum + r.revenue, 0);
    const totalExpenses = reports.reduce((sum, r) => sum + r.expenses, 0);
    const totalProfit = reports.reduce((sum, r) => sum + r.netProfit, 0);
    const averageRevenue = reports.length > 0 ? totalRevenue / reports.length : 0;
    const averageProfit = reports.length > 0 ? totalProfit / reports.length : 0;
    const averageProfitMargin = averageRevenue > 0 ? (averageProfit / averageRevenue) * 100 : 0;

    // Calculate trends
    const monthlyRevenue = reports.map((r) => ({
      period: r.period,
      revenue: r.revenue,
      expenses: r.expenses,
      profit: r.netProfit,
      date: r.periodEnd,
    }));

    // Find best and worst periods
    const sortedByProfit = [...reports].sort((a, b) => b.netProfit - a.netProfit);
    const bestPeriod = sortedByProfit[0];
    const worstPeriod = sortedByProfit[sortedByProfit.length - 1];

    sendSuccess(res, 'Analytics retrieved successfully', {
      summary: {
        totalRevenue,
        totalExpenses,
        totalProfit,
        averageRevenue,
        averageProfit,
        averageProfitMargin: Math.round(averageProfitMargin * 100) / 100,
        reportCount: reports.length,
      },
      monthlyRevenue,
      bestPeriod: bestPeriod ? {
        period: bestPeriod.period,
        profit: bestPeriod.netProfit,
        revenue: bestPeriod.revenue,
      } : null,
      worstPeriod: worstPeriod ? {
        period: worstPeriod.period,
        profit: worstPeriod.netProfit,
        revenue: worstPeriod.revenue,
      } : null,
      profile: {
        id: profile.id,
        companyName: profile.companyName,
        companyCategory: profile.companyCategory,
        description: profile.description,
        address: profile.address,
        yearEstablished: profile.yearEstablished,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const searchMSMEs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q, category, minProfitMargin, minRevenue } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const msmes = await prisma.mSMEProfile.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        ...(q && {
          OR: [
            { companyName: { contains: q as string, mode: 'insensitive' } },
            { description: { contains: q as string, mode: 'insensitive' } },
          ],
        }),
        ...(category && { companyCategory: category as string }),
      },
      include: {
        owner: {
          select: { email: true },
        },
        financialReports: {
          orderBy: { periodEnd: 'desc' },
        },
      },
    });

    // Filter by financial criteria
    const filteredMSMEs = msmes.filter((msme) => {
      const reports = msme.financialReports;
      if (reports.length === 0) return false;

      const avgRevenue = reports.reduce((sum, r) => sum + r.revenue, 0) / reports.length;
      const avgProfit = reports.reduce((sum, r) => sum + r.netProfit, 0) / reports.length;
      const profitMargin = avgRevenue > 0 ? (avgProfit / avgRevenue) * 100 : 0;

      if (minProfitMargin && profitMargin < parseFloat(minProfitMargin as string)) {
        return false;
      }
      if (minRevenue && avgRevenue < parseFloat(minRevenue as string)) {
        return false;
      }

      return true;
    });

    const paginatedResults = filteredMSMEs.slice(skip, skip + limit);

    sendSuccess(res, 'Search results retrieved successfully', {
      msmes: paginatedResults,
      pagination: {
        page,
        limit,
        total: filteredMSMEs.length,
        totalPages: Math.ceil(filteredMSMEs.length / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
