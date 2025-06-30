import { useAuth } from '@/contexts/AuthContext';

export const useProfile = () => {
  const { profile, loading } = useAuth();
  
  return {
    profile,
    loading
  };
};