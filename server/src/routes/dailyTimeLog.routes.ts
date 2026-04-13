import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getDailyTimeLogs, upsertDailyTimeLog } from '../controllers/dailyTimeLog.controller';

const router = Router();

router.get('/', authenticate, getDailyTimeLogs);
router.post('/', authenticate, upsertDailyTimeLog);

export default router;
