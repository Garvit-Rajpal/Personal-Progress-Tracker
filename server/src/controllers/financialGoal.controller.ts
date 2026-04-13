import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { FinancialGoalService } from '../services/financialGoal.service';

export const getFinancialGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await FinancialGoalService.get(req.user!.id);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const updateFinancialGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { goals, learningNotes } = req.body;
    const result = await FinancialGoalService.update(req.user!.id, { goals, learningNotes });
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
