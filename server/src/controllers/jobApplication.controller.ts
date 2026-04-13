import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { JobApplicationService } from '../services/jobApplication.service';

export const getJobApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await JobApplicationService.getAll(req.user!.id);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const createJobApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyName, applicationStatus, shortlisted, interviewStatus, statusDetails, ctc } = req.body;
    const result = await JobApplicationService.create(req.user!.id, {
      companyName,
      applicationStatus,
      shortlisted,
      interviewStatus,
      statusDetails,
      ctc
    });
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const updateJobApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new Error('id is required');
    }
    const { applicationStatus, shortlisted, interviewStatus, statusDetails, ctc } = req.body;

    const result = await JobApplicationService.update(req.user!.id, id, {
      applicationStatus,
      shortlisted,
      interviewStatus,
      statusDetails,
      ctc
    });

    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
