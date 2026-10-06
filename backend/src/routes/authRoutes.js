import { Router } from 'express';
import {
  getAdminCheck,
  getClientCheck,
  getMe,
  postChangePassword,
  postForgotPassword,
  postLogin,
  postResetPassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin, requireClient } from '../middleware/authorize.js';

const router = Router();

router.post('/login', postLogin);
router.post('/forgot-password', postForgotPassword);
router.post('/reset-password', postResetPassword);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, postChangePassword);
router.get('/admin', authenticate, requireAdmin, getAdminCheck);
router.get('/client', authenticate, requireClient, getClientCheck);

export default router;
