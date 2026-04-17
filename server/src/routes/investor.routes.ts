import { Router } from 'express';
import {
  discoverMSMEs,
  getMSMEAnalytics,
  searchMSMEs,
} from '../controllers/investor.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All investor routes require authentication and investor role
router.use(authenticate);
router.use(authorize('INVESTOR'));

// MSME discovery
router.get('/msmes', discoverMSMEs);
router.get('/msmes/search', searchMSMEs);
router.get('/msmes/:id/analytics', getMSMEAnalytics);

export default router;
