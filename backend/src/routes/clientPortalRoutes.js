import { Router } from 'express';
import {
  getMyAccount,
  getMyBooking,
  getMyNotificationUnreadCount,
  getMyNotifications,
  getMyVendorSelections,
  patchMyNotificationRead,
  postMyNotificationsRead,
  putMyVendorSelection,
} from '../controllers/clientPortalController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireClient } from '../middleware/authorize.js';
import { requireClientPortal } from '../middleware/requireClientPortal.js';

const router = Router();

router.use(authenticate, requireClient, requireClientPortal);
router.get('/booking', getMyBooking);
router.get('/account', getMyAccount);
router.get('/vendor-selections', getMyVendorSelections);
router.put('/vendor-selections', putMyVendorSelection);
router.get('/notifications/unread-count', getMyNotificationUnreadCount);
router.post('/notifications/mark-all-read', postMyNotificationsRead);
router.get('/notifications', getMyNotifications);
router.patch('/notifications/:notificationId/read', patchMyNotificationRead);

export default router;
