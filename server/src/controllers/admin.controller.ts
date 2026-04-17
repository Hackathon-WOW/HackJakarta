import { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';
import { sendSuccess, sendCreated, sendError, sendNotFound } from '../utils/response.js';

export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string | undefined;
    const skip = (page - 1) * limit;

    const where = role ? { role: role as 'ADMIN' | 'MSME' | 'INVESTOR' } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          msmeProfile: {
            select: {
              id: true,
              companyName: true,
              verificationStatus: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    sendSuccess(res, 'Users retrieved successfully', {
      users,
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

export const getPendingVerifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      prisma.mSMEProfile.findMany({
        where: { verificationStatus: 'PENDING' },
        include: {
          owner: {
            select: { email: true, createdAt: true },
          },
          _count: {
            select: { financialReports: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.mSMEProfile.count({
        where: { verificationStatus: 'PENDING' },
      }),
    ]);

    sendSuccess(res, 'Pending verifications retrieved successfully', {
      profiles,
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

export const verifyMSME = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'VERIFIED' or 'REJECTED'

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      sendError(res, 'Invalid status. Must be VERIFIED or REJECTED', undefined, 400);
      return;
    }

    const profile = await prisma.mSMEProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      sendNotFound(res, 'MSME profile not found');
      return;
    }

    if (profile.verificationStatus !== 'PENDING') {
      sendError(res, 'This profile has already been processed', undefined, 400);
      return;
    }

    const updatedProfile = await prisma.mSMEProfile.update({
      where: { id },
      data: { verificationStatus: status },
      include: {
        owner: {
          select: { email: true },
        },
      },
    });

    sendSuccess(res, `MSME ${status.toLowerCase()} successfully`, updatedProfile);
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalUsers, totalMSMEs, pendingVerifications, totalReports] = await Promise.all([
      prisma.user.count(),
      prisma.mSMEProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.mSMEProfile.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.financialReport.count(),
    ]);

    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    sendSuccess(res, 'Dashboard stats retrieved successfully', {
      totalUsers,
      totalMSMEs,
      pendingVerifications,
      totalReports,
      roleDistribution: roleDistribution.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.id;

    if (id === currentUserId) {
      sendError(res, 'Cannot delete your own account', undefined, 400);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      sendNotFound(res, 'User not found');
      return;
    }

    // Check if trying to delete an admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      });

      if (adminCount <= 1) {
        sendError(res, 'Cannot delete the last admin', undefined, 400);
        return;
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    sendSuccess(res, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getAllMSMEs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;
    const skip = (page - 1) * limit;

    const where = status ? { verificationStatus: status as 'PENDING' | 'VERIFIED' | 'REJECTED' } : {};

    const [msmes, total] = await Promise.all([
      prisma.mSMEProfile.findMany({
        where,
        include: {
          owner: {
            select: { email: true },
          },
          financialReports: {
            orderBy: { periodEnd: 'desc' },
            take: 5,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mSMEProfile.count({ where }),
    ]);

    sendSuccess(res, 'MSMEs retrieved successfully', {
      msmes,
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
