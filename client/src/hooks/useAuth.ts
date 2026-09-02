import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

type LoginPayload = { email: string; password: string };
type RegisterPayload = LoginPayload & { name: string };

export const useAuth = () => {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginPayload) => {
      const res = await api.post('/auth/login', data);
      // M0-4 (ADR-14): /api/auth now answers with the `{ data }` envelope.
      // The rest of the API is still bare and converts domain by domain.
      return res.data.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('refreshToken', data.refreshToken);
      router.push('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterPayload) => {
      const res = await api.post('/auth/register', data);
      // M0-4 (ADR-14) — see the comment in loginMutation.
      return res.data.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('refreshToken', data.refreshToken);
      router.push('/dashboard');
    },
  });

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };
};
