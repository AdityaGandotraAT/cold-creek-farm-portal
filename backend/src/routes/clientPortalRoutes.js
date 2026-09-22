import { Router } from 'express';
import {
  getMyBooking,
  getMyVendorSelections,
  putMyVendorSelection,
} from '../controllers/clientPortalController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireClient } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate, requireClient);
router.get('/booking', getMyBooking);
router.get('/vendor-selections', getMyVendorSelections);
router.put('/vendor-selections', putMyVendorSelection);

export default router;
