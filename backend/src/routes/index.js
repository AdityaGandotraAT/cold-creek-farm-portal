import { Router } from 'express';
import authRoutes from './authRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import clientPortalRoutes from './clientPortalRoutes.js';
import clientRoutes from './clientRoutes.js';
import healthRoutes from './healthRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import vendorCategoryRoutes from './vendorCategoryRoutes.js';
import vendorReplyRoutes from './vendorReplyRoutes.js';
import vendorRoutes from './vendorRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/client', clientPortalRoutes);
router.use('/clients', clientRoutes);
router.use('/vendors', vendorRoutes);
router.use('/vendor-categories', vendorCategoryRoutes);
router.use('/vendor-replies', vendorReplyRoutes);
router.use('/notifications', notificationRoutes);
router.use('/bookings', bookingRoutes);

export default router;
