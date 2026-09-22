import { Router } from 'express';
import {
  getClient,
  getClients,
  postClient,
  postClientWelcomeEmail,
  putClient,
  removeClient,
} from '../controllers/clientController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', getClients);
router.post('/', postClient);
router.post('/:clientId/resend-welcome', postClientWelcomeEmail);
router.get('/:clientId', getClient);
router.put('/:clientId', putClient);
router.delete('/:clientId', removeClient);

export default router;
