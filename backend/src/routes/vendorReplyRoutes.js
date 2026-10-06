import { Router } from 'express';
import { getVendorReplyPreview, postVendorReply } from '../controllers/vendorReplyController.js';

const router = Router();

router.get('/', getVendorReplyPreview);
router.post('/', postVendorReply);

export default router;
