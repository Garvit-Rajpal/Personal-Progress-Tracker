import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getNextDayPlan, saveNextDayPlan } from '../controllers/nextDayPlan.controller';

const router = Router();

router.get('/', authenticate, getNextDayPlan);
router.put('/', authenticate, saveNextDayPlan);

export default router;
