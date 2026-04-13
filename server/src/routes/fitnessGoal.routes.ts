import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getFitnessGoal, updateFitnessGoal } from '../controllers/fitnessGoal.controller';

const router = Router();

router.get('/', authenticate, getFitnessGoal);
router.put('/', authenticate, updateFitnessGoal);

export default router;
