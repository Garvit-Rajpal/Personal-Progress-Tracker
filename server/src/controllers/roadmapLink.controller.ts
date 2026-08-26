import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { RoadmapLinkService } from '../services/roadmapLink.service';

export const getRoadmapLinks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const links = await RoadmapLinkService.getAll(req.user!.id);
    res.status(200).json(links);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const createRoadmapLink = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, url, notes } = req.body;
    const link = await RoadmapLinkService.create(req.user!.id, title, url, notes);
    res.status(201).json(link);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};