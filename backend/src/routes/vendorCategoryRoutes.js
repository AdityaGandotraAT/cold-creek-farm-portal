import { Router } from 'express';
import {
  getVendorCategories,
  getVendorCategory,
  getVendorCategoryOverview,
  postVendorCategory,
  putVendorCategory,
} from '../controllers/vendorCategoryController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', getVendorCategories);
router.post('/', postVendorCategory);
router.get('/overview', getVendorCategoryOverview);
router.get('/:categoryId', getVendorCategory);
router.put('/:categoryId', putVendorCategory);

export default router;
