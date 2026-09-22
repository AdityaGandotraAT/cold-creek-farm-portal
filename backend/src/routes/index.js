import { Router } from 'express';
import authRoutes from './authRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import clientPortalRoutes from './clientPortalRoutes.js';
import clientRoutes from './clientRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/client', clientPortalRoutes);
router.use('/clients', clientRoutes);
router.use('/bookings', bookingRoutes);

export default router;
