import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { DSAService } from '../services/dsa.service';
export const getAllQuestions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await DSAService.getAllQuestions(req.user!.id);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getTodaySet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await DSAService.getTodaySet(req.user!.id);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const solveQuestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { questionId, solved } = req.body;
    const result = await DSAService.toggleSolved(req.user!.id, questionId, solved);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const saveNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { questionId, notes } = req.body;
    const result = await DSAService.updateNotes(req.user!.id, questionId, notes);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
