import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/errorMessage';

type FinancialGoalPayload = {
  goals: string;
  learningNotes: string;
};

export const useFinancialGoals = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['financialGoals'],
    queryFn: async () => {
      const res = await api.get('/financial-goals');
      return res.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: FinancialGoalPayload) => {
      const res = await api.put('/financial-goals', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialGoals'] });
    },
    onError: (error) => {
      toast({
        title: 'Financial goals not saved',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    }
  });

  return {
    financialGoals: data,
    isLoading,
    updateFinancialGoals: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
};
