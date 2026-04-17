import { Router } from 'express';
import {
  getAllUsers,
  getPendingVerifications,
  verifyMSME,
  getDashboardStats,
  deleteUser,
  getAllMSMEs,
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// MSME verification
router.get('/msmes/pending', getPendingVerifications);
router.get('/msmes', getAllMSMEs);
router.patch('/msmes/:id/verify', validateBody(z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
})), verifyMSME);

// Dashboard
router.get('/stats', getDashboardStats);

export default router;
