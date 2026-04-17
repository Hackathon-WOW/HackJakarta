import { Router } from 'express';
import { register, login, getProfile, changePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../utils/validation.js';

const router = Router();

// Public routes
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.post('/change-password', authenticate, changePassword);

export default router;
