/**
 * The express application, with no side effects.
 *
 * ADR-13. Building the app is separate from starting it: `src/index.ts` owns
 * `listen()` and the bootstrap seed, this module owns routing only. supertest
 * needs an app it can import without a live port or a seeded database.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

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
import roadmapLinkRoutes from './routes/roadmapLink.routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
app.use('/api/roadmap-links', roadmapLinkRoutes);

// M0-4 — must be last: anything reaching here matched no route, and anything a
// handler threw lands in errorHandler as `{ error: { code, message } }`.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
