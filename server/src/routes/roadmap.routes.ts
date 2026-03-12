import { Router } from 'express';
import { getPhases, getProgress, toggleProgress } from '../controllers/roadmap.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, getPhases);
router.get('/progress', authenticate, getProgress);
router.post('/progress/toggle', authenticate, toggleProgress);

export default router;
