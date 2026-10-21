import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useSession } from '@/entities/session';
import { routes } from '@/shared/config';

export function useLogout() {
  const { signOut } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return () => {
    navigate(routes.login(), { replace: true });
    signOut();
    queryClient.clear();
  };
}
