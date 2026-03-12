import { Router } from 'express';
import { getTodaySet, solveQuestion, saveNotes, getAllQuestions } from '../controllers/dsa.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/all', authenticate, getAllQuestions);
router.get('/today', authenticate, getTodaySet);
router.post('/solve', authenticate, solveQuestion);
router.post('/notes', authenticate, saveNotes);

export default router;
