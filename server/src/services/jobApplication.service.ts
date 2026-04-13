import { prisma } from '../index';

const validInterviewStatuses = ['N/A', 'InProgress', 'Cleared', 'Failed'];

const normalizeInterviewStatus = (value?: string) => {
  const trimmed = value?.trim();
  if (!trimmed) return 'N/A';
  if (trimmed === 'InProgress' || trimmed === 'Cleared' || trimmed === 'Failed' || trimmed === 'N/A') {
    return trimmed;
  }
  throw new Error('interviewStatus must be one of: N/A, InProgress, Cleared, Failed');
};

const sanitizeStatusFields = (interviewStatus: string, statusDetails?: string, ctc?: string) => {
  const trimmedDetails = statusDetails?.trim() || null;
  const trimmedCtc = ctc?.trim() || null;

  if (!validInterviewStatuses.includes(interviewStatus)) {
    throw new Error('interviewStatus must be one of: N/A, InProgress, Cleared, Failed');
  }

  if (interviewStatus === 'N/A') {
    return { statusDetails: null, ctc: null };
  }

  if (!trimmedDetails) {
    throw new Error('statusDetails is required when interviewStatus is InProgress, Cleared, or Failed');
  }

  if (interviewStatus === 'Cleared' && !trimmedCtc) {
    throw new Error('ctc is required when interviewStatus is Cleared');
  }

  return {
    statusDetails: trimmedDetails,
    ctc: interviewStatus === 'Cleared' ? trimmedCtc : null
  };
};

export class JobApplicationService {
  static async getAll(userId: string) {
    return prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async create(
    userId: string,
    payload: {
      companyName: string;
      applicationStatus: string;
      shortlisted: string;
      interviewStatus?: string;
      statusDetails?: string;
      ctc?: string;
    }
  ) {
    const companyName = payload.companyName?.trim();
    const applicationStatus = payload.applicationStatus?.trim();
    const shortlisted = payload.shortlisted?.trim();
    const interviewStatus = normalizeInterviewStatus(payload.interviewStatus);
    const { statusDetails, ctc } = sanitizeStatusFields(
      interviewStatus,
      payload.statusDetails,
      payload.ctc
    );

    if (!companyName || !applicationStatus || !shortlisted) {
      throw new Error('companyName, applicationStatus, and shortlisted are required');
    }

    return prisma.jobApplication.create({
      data: {
        userId,
        companyName,
        applicationStatus,
        shortlisted,
        interviewStatus,
        statusDetails,
        ctc
      }
    });
  }

  static async update(
    userId: string,
    id: string,
    payload: {
      applicationStatus: string;
      shortlisted: string;
      interviewStatus: string;
      statusDetails?: string;
      ctc?: string;
    }
  ) {
    const applicationStatus = payload.applicationStatus?.trim();
    const shortlisted = payload.shortlisted?.trim();
    const interviewStatus = normalizeInterviewStatus(payload.interviewStatus);

    if (!applicationStatus || !shortlisted) {
      throw new Error('applicationStatus and shortlisted are required');
    }

    const { statusDetails, ctc } = sanitizeStatusFields(
      interviewStatus,
      payload.statusDetails,
      payload.ctc
    );

    const existing = await prisma.jobApplication.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existing) {
      throw new Error('Job application not found');
    }

    return prisma.jobApplication.update({
      where: { id },
      data: {
        applicationStatus,
        shortlisted,
        interviewStatus,
        statusDetails,
        ctc
      }
    });
  }
}
