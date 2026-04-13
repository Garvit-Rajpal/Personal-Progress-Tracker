import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/errorMessage';

type CreateProjectIdeaPayload = {
  ideaName: string;
  description: string;
  priority: string;
  researchReferences: string;
  expectedTimeToBuild: string;
  startDate: string;
  dueDate: string;
};

export const useProjectIdeas = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['projectIdeas'],
    queryFn: async () => {
      const res = await api.get('/project-ideas');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateProjectIdeaPayload) => {
      const res = await api.post('/project-ideas', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectIdeas'] });
    },
    onError: (error) => {
      toast({
        title: 'Project idea not saved',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    }
  });

  return {
    projectIdeas: data || [],
    isLoading,
    addProjectIdea: createMutation.mutate,
    isAdding: createMutation.isPending
  };
};
