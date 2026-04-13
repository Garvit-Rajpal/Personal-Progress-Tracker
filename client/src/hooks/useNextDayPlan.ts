import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/errorMessage';

type NextDayPlanPayload = {
  briefPlan: string;
};

export const useNextDayPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['nextDayPlan'],
    queryFn: async () => {
      const res = await api.get('/next-day-plan');
      return res.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: NextDayPlanPayload) => {
      const res = await api.put('/next-day-plan', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nextDayPlan'] });
    },
    onError: (error) => {
      toast({
        title: 'Plan not saved',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    }
  });

  return {
    nextDayPlan: data,
    isLoading,
    saveNextDayPlan: saveMutation.mutate,
    isSaving: saveMutation.isPending
  };
};
