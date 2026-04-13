import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getLearningTarget, updateLearningTarget } from '../controllers/learningTarget.controller';

const router = Router();

router.get('/', authenticate, getLearningTarget);
router.put('/', authenticate, updateLearningTarget);

export default router;
