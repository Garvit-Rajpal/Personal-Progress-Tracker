import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getFinancialGoal, updateFinancialGoal } from '../controllers/financialGoal.controller';

const router = Router();

router.get('/', authenticate, getFinancialGoal);
router.put('/', authenticate, updateFinancialGoal);

export default router;
