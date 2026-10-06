import { Router } from 'express';
import {
  getVendor,
  getVendors,
  postVendor,
  putVendor,
  removeVendor,
} from '../controllers/vendorController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', getVendors);
router.post('/', postVendor);
router.get('/:vendorId', getVendor);
router.put('/:vendorId', putVendor);
router.delete('/:vendorId', removeVendor);

export default router;
