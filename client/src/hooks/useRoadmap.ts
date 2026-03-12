import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useRoadmap = () => {
  const queryClient = useQueryClient();

  const { data: phases, isLoading: isLoadingPhases } = useQuery({
    queryKey: ['roadmapPhases'],
    queryFn: async () => {
      const res = await api.get('/roadmap');
      return res.data;
    }
  });

  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['roadmapProgress'],
    queryFn: async () => {
      const res = await api.get('/roadmap/progress');
      return res.data;
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: string, completed: boolean }) => {
      const res = await api.post('/roadmap/progress/toggle', { itemId, completed });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmapProgress'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  return {
    phases: phases || [],
    progress: progress || [],
    isLoading: isLoadingPhases || isLoadingProgress,
    toggleProgress: toggleMutation.mutate,
    isToggling: toggleMutation.isPending
  };
};
