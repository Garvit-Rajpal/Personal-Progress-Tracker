import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { createJobApplication, getJobApplications, updateJobApplication } from '../controllers/jobApplication.controller';

const router = Router();

router.get('/', authenticate, getJobApplications);
router.post('/', authenticate, createJobApplication);
router.put('/:id', authenticate, updateJobApplication);

export default router;
