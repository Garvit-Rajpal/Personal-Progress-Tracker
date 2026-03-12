import { Request, Response } from 'express';
import { RoadmapService } from '../services/roadmap.service';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getPhases = async (req: Request, res: Response) => {
  try {
    const phases = await RoadmapService.getAllPhases();
    res.status(200).json(phases);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const progress = await RoadmapService.getUserProgress(userId);
    res.status(200).json(progress);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const toggleProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemId, completed } = req.body;
    const progress = await RoadmapService.toggleItemProgress(userId, itemId, completed);
    res.status(200).json(progress);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
