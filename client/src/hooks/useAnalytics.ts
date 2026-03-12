import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useAnalytics = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics/overview');
      return res.data;
    }
  });

  return {
    data,
    isLoading,
    error
  };
};
