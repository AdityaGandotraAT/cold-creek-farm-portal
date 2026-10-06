import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  patchNotificationRead,
  postMarkAllRead,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.post('/mark-all-read', postMarkAllRead);
router.patch('/:notificationId/read', patchNotificationRead);

export default router;
