import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { NextDayPlanService } from '../services/nextDayPlan.service';

export const getNextDayPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await NextDayPlanService.get(req.user!.id);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const saveNextDayPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { briefPlan } = req.body;
    const result = await NextDayPlanService.upsert(req.user!.id, briefPlan);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
