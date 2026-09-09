import { Router } from 'express';
import {
  getAdminCheck,
  getClientCheck,
  getMe,
  postLogin,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin, requireClient } from '../middleware/authorize.js';

const router = Router();

router.post('/login', postLogin);
router.get('/me', authenticate, getMe);
router.get('/admin', authenticate, requireAdmin, getAdminCheck);
router.get('/client', authenticate, requireClient, getClientCheck);

export default router;
