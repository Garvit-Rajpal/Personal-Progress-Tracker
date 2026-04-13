import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/errorMessage';

type LearningTargetPayload = {
  dailyDsaTarget: string;
  dailyWebDevAiTarget: string;
  weekendProjectBuildTarget: string;
};

export const useLearningTargets = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['learningTargets'],
    queryFn: async () => {
      const res = await api.get('/learning-targets');
      return res.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: LearningTargetPayload) => {
      const res = await api.put('/learning-targets', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningTargets'] });
    },
    onError: (error) => {
      toast({
        title: 'Learning targets not saved',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    }
  });

  return {
    learningTargets: data,
    isLoading,
    updateLearningTargets: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
};
