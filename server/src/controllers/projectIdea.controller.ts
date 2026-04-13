import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { ProjectIdeaService } from '../services/projectIdea.service';

export const getProjectIdeas = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await ProjectIdeaService.getAll(req.user!.id);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const createProjectIdea = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      ideaName,
      description,
      priority,
      researchReferences,
      expectedTimeToBuild,
      startDate,
      dueDate
    } = req.body;

    const result = await ProjectIdeaService.create(req.user!.id, {
      ideaName,
      description,
      priority,
      researchReferences,
      expectedTimeToBuild,
      startDate,
      dueDate
    });

    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
