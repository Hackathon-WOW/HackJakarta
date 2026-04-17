import { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import { AuthenticatedRequest, MSMEProfileInput } from '../types/index.js';
import { sendSuccess, sendCreated, sendError, sendNotFound } from '../utils/response.js';
import { extractFinancialDataFromBase64, extractFinancialDataFromText } from '../services/ai.service.js';
import { readFileAsBase64, getMimeType } from '../services/file.service.js';

export const createOrUpdateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profileData = req.body as MSMEProfileInput;

    // Check if user is MSME
    if (req.user!.role !== 'MSME') {
      sendError(res, 'Only MSME users can create a profile', undefined, 403);
      return;
    }

    // Check if profile already exists
    const existingProfile = await prisma.mSMEProfile.findUnique({
      where: { ownerId: userId },
    });

    let profile;
    if (existingProfile) {
      profile = await prisma.mSMEProfile.update({
        where: { ownerId: userId },
        data: profileData,
      });
    } else {
      profile = await prisma.mSMEProfile.create({
        data: {
          ...profileData,
          ownerId: userId,
        },
      });
    }

    sendSuccess(res, 'Profile saved successfully', profile);
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const profile = await prisma.mSMEProfile.findUnique({
      where: { ownerId: userId },
      include: {
        financialReports: {
          orderBy: { periodEnd: 'desc' },
          take: 10,
        },
      },
    });

    if (!profile) {
      sendNotFound(res, 'Profile not found. Please create your profile first.');
      return;
    }

    sendSuccess(res, 'Profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

export const getAllVerifiedMSMEs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [msmes, total] = await Promise.all([
      prisma.mSMEProfile.findMany({
        where: { verificationStatus: 'VERIFIED' },
        include: {
          owner: {
            select: { email: true },
          },
          financialReports: {
            orderBy: { periodEnd: 'desc' },
            take: 1,
          },
        },
        skip,
        take: limit,
      }),
      prisma.mSMEProfile.count({
        where: { verificationStatus: 'VERIFIED' },
      }),
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

export const getMSMEById = async (
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

    sendSuccess(res, 'MSME retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

export const uploadFinancialDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const file = req.file;

    // Check if user is MSME
    if (req.user!.role !== 'MSME') {
      sendError(res, 'Only MSME users can upload financial documents', undefined, 403);
      return;
    }

    // Get MSME profile
    const profile = await prisma.mSMEProfile.findUnique({
      where: { ownerId: userId },
    });

    if (!profile) {
      sendNotFound(res, 'MSME profile not found. Please create your profile first.');
      return;
    }

    if (!file) {
      sendError(res, 'No file uploaded', undefined, 400);
      return;
    }

    // Extract financial data using AI
    let extractedData;
    const mimeType = getMimeType(file.filename);

    if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
      const base64Data = await readFileAsBase64(file.filename);
      if (!base64Data) {
        sendError(res, 'Failed to read uploaded file', undefined, 500);
        return;
      }
      extractedData = await extractFinancialDataFromBase64(base64Data, mimeType);
    } else {
      // For text-based files, we would need additional processing
      // For now, return an error
      sendError(res, 'Unsupported file type for AI extraction', undefined, 400);
      return;
    }

    // Create financial report
    const financialReport = await prisma.financialReport.create({
      data: {
        revenue: extractedData.revenue,
        expenses: extractedData.expenses,
        netProfit: extractedData.netProfit,
        period: extractedData.period,
        periodStart: new Date(extractedData.periodStart),
        periodEnd: new Date(extractedData.periodEnd),
        documentUrl: `/uploads/${file.filename}`,
        rawData: extractedData,
        msmeId: profile.id,
      },
    });

    sendCreated(res, 'Financial document processed successfully', {
      financialReport,
      extractedData,
      reviewRequired: true, // Indicates that MSME should review the extracted data
    });
  } catch (error) {
    next(error);
  }
};

export const uploadFinancialText = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { text } = req.body;

    // Check if user is MSME
    if (req.user!.role !== 'MSME') {
      sendError(res, 'Only MSME users can submit financial data', undefined, 403);
      return;
    }

    // Get MSME profile
    const profile = await prisma.mSMEProfile.findUnique({
      where: { ownerId: userId },
    });

    if (!profile) {
      sendNotFound(res, 'MSME profile not found. Please create your profile first.');
      return;
    }

    if (!text) {
      sendError(res, 'Financial text content is required', undefined, 400);
      return;
    }

    // Extract financial data using AI
    const extractedData = await extractFinancialDataFromText(text);

    // Create financial report
    const financialReport = await prisma.financialReport.create({
      data: {
        revenue: extractedData.revenue,
        expenses: extractedData.expenses,
        netProfit: extractedData.netProfit,
        period: extractedData.period,
        periodStart: new Date(extractedData.periodStart),
        periodEnd: new Date(extractedData.periodEnd),
        rawData: extractedData,
        msmeId: profile.id,
      },
    });

    sendCreated(res, 'Financial data processed successfully', {
      financialReport,
      extractedData,
      reviewRequired: true,
    });
  } catch (error) {
    next(error);
  }
};

export const submitFinancialReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { revenue, expenses, netProfit, period, periodStart, periodEnd } = req.body;

    // Check if user is MSME
    if (req.user!.role !== 'MSME') {
      sendError(res, 'Only MSME users can submit financial reports', undefined, 403);
      return;
    }

    // Get MSME profile
    const profile = await prisma.mSMEProfile.findUnique({
      where: { ownerId: userId },
    });

    if (!profile) {
      sendNotFound(res, 'MSME profile not found. Please create your profile first.');
      return;
    }

    const financialReport = await prisma.financialReport.create({
      data: {
        revenue,
        expenses,
        netProfit,
        period,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        msmeId: profile.id,
      },
    });

    sendCreated(res, 'Financial report submitted successfully', financialReport);
  } catch (error) {
    next(error);
  }
};

export const updateFinancialReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    // Get MSME profile
    const profile = await prisma.mSMEProfile.findUnique({
      where: { ownerId: userId },
    });

    if (!profile) {
      sendNotFound(res, 'MSME profile not found');
      return;
    }

    // Verify the report belongs to this MSME
    const report = await prisma.financialReport.findFirst({
      where: {
        id,
        msmeId: profile.id,
      },
    });

    if (!report) {
      sendNotFound(res, 'Financial report not found');
      return;
    }

    const updatedReport = await prisma.financialReport.update({
      where: { id },
      data: {
        ...updateData,
        periodStart: updateData.periodStart ? new Date(updateData.periodStart) : undefined,
        periodEnd: updateData.periodEnd ? new Date(updateData.periodEnd) : undefined,
      },
    });

    sendSuccess(res, 'Financial report updated successfully', updatedReport);
  } catch (error) {
    next(error);
  }
};

export const deleteFinancialReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Get MSME profile
    const profile = await prisma.mSMEProfile.findUnique({
      where: { ownerId: userId },
    });

    if (!profile) {
      sendNotFound(res, 'MSME profile not found');
      return;
    }

    // Verify the report belongs to this MSME
    const report = await prisma.financialReport.findFirst({
      where: {
        id,
        msmeId: profile.id,
      },
    });

    if (!report) {
      sendNotFound(res, 'Financial report not found');
      return;
    }

    await prisma.financialReport.delete({
      where: { id },
    });

    sendSuccess(res, 'Financial report deleted successfully');
  } catch (error) {
    next(error);
  }
};
