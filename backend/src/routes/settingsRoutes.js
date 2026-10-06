import { Router } from 'express';
import {
  getPublicSettings,
  getSettings,
  putProfile,
  putSettings,
} from '../controllers/settingsController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

router.get('/public', getPublicSettings);
router.get('/', authenticate, requireAdmin, getSettings);
router.put('/', authenticate, requireAdmin, putSettings);
router.put('/profile', authenticate, requireAdmin, putProfile);

export default router;
