import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { createRoadmapLink, getRoadmapLinks } from '../controllers/roadmapLink.controller';

const router = Router();

router.get('/', authenticate, getRoadmapLinks);
router.post('/', authenticate, createRoadmapLink);

export default router;