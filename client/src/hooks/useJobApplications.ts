import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/errorMessage';

type CreateJobApplicationPayload = {
  companyName: string;
  applicationStatus: string;
  shortlisted: string;
  interviewStatus?: 'N/A' | 'InProgress' | 'Cleared' | 'Failed';
  statusDetails?: string;
  ctc?: string;
};

type UpdateJobApplicationPayload = {
  id: string;
  applicationStatus: string;
  shortlisted: string;
  interviewStatus: 'N/A' | 'InProgress' | 'Cleared' | 'Failed';
  statusDetails?: string;
  ctc?: string;
};

export const useJobApplications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['jobApplications'],
    queryFn: async () => {
      const res = await api.get('/job-applications');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateJobApplicationPayload) => {
      const res = await api.post('/job-applications', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
    onError: (error) => {
      toast({
        title: 'Job application not added',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: UpdateJobApplicationPayload) => {
      const res = await api.put(`/job-applications/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
    onError: (error) => {
      toast({
        title: 'Job application not updated',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    }
  });

  return {
    jobApplications: data || [],
    isLoading,
    addJobApplication: createMutation.mutate,
    isAdding: createMutation.isPending,
    updateJobApplication: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
};
