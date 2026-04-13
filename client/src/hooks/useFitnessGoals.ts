import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/errorMessage';

type FitnessGoalPayload = {
  goals: string;
};

export const useFitnessGoals = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['fitnessGoals'],
    queryFn: async () => {
      const res = await api.get('/fitness-goals');
      return res.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: FitnessGoalPayload) => {
      const res = await api.put('/fitness-goals', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fitnessGoals'] });
    },
    onError: (error) => {
      toast({
        title: 'Fitness goals not saved',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    }
  });

  return {
    fitnessGoals: data,
    isLoading,
    updateFitnessGoals: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
};
