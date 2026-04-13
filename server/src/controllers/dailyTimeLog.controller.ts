import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { DailyTimeLogService } from '../services/dailyTimeLog.service';

export const getDailyTimeLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await DailyTimeLogService.getAll(req.user!.id);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const upsertDailyTimeLog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, dsaHours, devAiHours, dsaWorkLog, devAiWorkLog } = req.body;
    const result = await DailyTimeLogService.upsert(req.user!.id, {
      date,
      dsaHours: Number(dsaHours),
      devAiHours: Number(devAiHours),
      dsaWorkLog,
      devAiWorkLog
    });
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
