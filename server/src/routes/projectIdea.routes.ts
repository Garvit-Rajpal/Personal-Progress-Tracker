import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { createProjectIdea, getProjectIdeas } from '../controllers/projectIdea.controller';

const router = Router();

router.get('/', authenticate, getProjectIdeas);
router.post('/', authenticate, createProjectIdea);

export default router;
