import { Router } from 'express';
import { getOverview } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/overview', authenticate, getOverview);

export default router;
