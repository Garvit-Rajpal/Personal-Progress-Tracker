import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { FitnessGoalService } from '../services/fitnessGoal.service';

export const getFitnessGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await FitnessGoalService.get(req.user!.id);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const updateFitnessGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { goals } = req.body;
    const result = await FitnessGoalService.update(req.user!.id, { goals });
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
