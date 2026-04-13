import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.routes';
import roadmapRoutes from './routes/roadmap.routes';
import dsaRoutes from './routes/dsa.routes';
import analyticsRoutes from './routes/analytics.routes';
import jobApplicationRoutes from './routes/jobApplication.routes';
import projectIdeaRoutes from './routes/projectIdea.routes';
import learningTargetRoutes from './routes/learningTarget.routes';
import dailyTimeLogRoutes from './routes/dailyTimeLog.routes';
import nextDayPlanRoutes from './routes/nextDayPlan.routes';
import fitnessGoalRoutes from './routes/fitnessGoal.routes';
import financialGoalRoutes from './routes/financialGoal.routes';

dotenv.config();

export const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/project-ideas', projectIdeaRoutes);
app.use('/api/learning-targets', learningTargetRoutes);
app.use('/api/daily-time-logs', dailyTimeLogRoutes);
app.use('/api/next-day-plan', nextDayPlanRoutes);
app.use('/api/fitness-goals', fitnessGoalRoutes);
app.use('/api/financial-goals', financialGoalRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
