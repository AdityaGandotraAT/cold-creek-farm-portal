import { Router } from 'express';
import {
  getBooking,
  getBookingSelections,
  getBookings,
  postBooking,
  putBooking,
  removeBooking,
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', getBookings);
router.post('/', postBooking);
router.get('/:bookingId/vendor-selections', getBookingSelections);
router.get('/:bookingId', getBooking);
router.put('/:bookingId', putBooking);
router.delete('/:bookingId', removeBooking);

export default router;
