import { Router } from 'express';
import {
  createOrUpdateProfile,
  getMyProfile,
  uploadFinancialDocument,
  uploadFinancialText,
  submitFinancialReport,
  updateFinancialReport,
  deleteFinancialReport,
} from '../controllers/msme.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { msmeProfileSchema, financialReportSchema, updateProfileSchema } from '../utils/validation.js';
import { upload } from '../services/file.service.js';

const router = Router();

// All MSME routes require authentication
router.use(authenticate);

// Profile management (MSME only)
router.post(
  '/profile',
  authorize('MSME'),
  validateBody(msmeProfileSchema),
  createOrUpdateProfile
);

router.get(
  '/profile/me',
  authorize('MSME'),
  getMyProfile
);

router.patch(
  '/profile',
  authorize('MSME'),
  validateBody(updateProfileSchema),
  createOrUpdateProfile
);

// Financial reports (MSME only)
router.post(
  '/reports/upload',
  authorize('MSME'),
  upload.single('document'),
  uploadFinancialDocument
);

router.post(
  '/reports/text',
  authorize('MSME'),
  uploadFinancialText
);

router.post(
  '/reports',
  authorize('MSME'),
  validateBody(financialReportSchema),
  submitFinancialReport
);

router.patch(
  '/reports/:id',
  authorize('MSME'),
  validateBody(updateProfileSchema),
  updateFinancialReport
);

router.delete(
  '/reports/:id',
  authorize('MSME'),
  deleteFinancialReport
);

export default router;
