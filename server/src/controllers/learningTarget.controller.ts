import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { LearningTargetService } from '../services/learningTarget.service';

export const getLearningTarget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await LearningTargetService.get(req.user!.id);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const updateLearningTarget = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { dailyDsaTarget, dailyWebDevAiTarget, weekendProjectBuildTarget } = req.body;
    const result = await LearningTargetService.update(req.user!.id, {
      dailyDsaTarget,
      dailyWebDevAiTarget,
      weekendProjectBuildTarget
    });
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
