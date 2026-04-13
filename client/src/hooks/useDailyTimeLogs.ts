import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/errorMessage';

type UpsertDailyTimePayload = {
  date: string;
  dsaHours: number;
  devAiHours: number;
  dsaWorkLog?: string;
  devAiWorkLog?: string;
};

export const useDailyTimeLogs = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['dailyTimeLogs'],
    queryFn: async () => {
      const res = await api.get('/daily-time-logs');
      return res.data;
    }
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: UpsertDailyTimePayload) => {
      const res = await api.post('/daily-time-logs', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyTimeLogs'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      toast({
        title: 'Time log not saved',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    }
  });

  return {
    dailyTimeLogs: data || [],
    isLoading,
    saveDailyTimeLog: upsertMutation.mutate,
    isSaving: upsertMutation.isPending
  };
};
