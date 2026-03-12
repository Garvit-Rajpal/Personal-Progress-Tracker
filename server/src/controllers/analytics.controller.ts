import { Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await AnalyticsService.getOverview(req.user!.id);
    res.status(200).json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
