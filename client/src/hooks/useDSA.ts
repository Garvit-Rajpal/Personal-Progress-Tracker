import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useDSA = () => {
  const queryClient = useQueryClient();

  const { data: todayData, isLoading: isTodayLoading } = useQuery({
    queryKey: ['dailyDSA'],
    queryFn: async () => {
      const res = await api.get('/dsa/today');
      return res.data;
    }
  });

  const { data: allData, isLoading: isAllLoading } = useQuery({
    queryKey: ['allDSA'],
    queryFn: async () => {
      const res = await api.get('/dsa/all');
      return res.data;
    }
  });

  const solveMutation = useMutation({
    mutationFn: async ({ questionId, solved }: { questionId: string, solved: boolean }) => {
      const res = await api.post('/dsa/solve', { questionId, solved });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyDSA'] });
      queryClient.invalidateQueries({ queryKey: ['allDSA'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  const notesMutation = useMutation({
    mutationFn: async ({ questionId, notes }: { questionId: string, notes: string }) => {
      const res = await api.post('/dsa/notes', { questionId, notes });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyDSA'] });
      queryClient.invalidateQueries({ queryKey: ['allDSA'] });
    }
  });

  return {
    dailySet: todayData?.set?.questions || [],
    allQuestions: allData?.questions || [],
    canonicalSheetLink: allData?.canonicalSheetLink,
    progress: allData?.progress || todayData?.progress || [],
    message: todayData?.message,
    isLoading: isTodayLoading || isAllLoading,
    toggleSolved: solveMutation.mutate,
    isToggling: solveMutation.isPending,
    saveNotes: notesMutation.mutate,
    isSavingNotes: notesMutation.isPending
  };
};
