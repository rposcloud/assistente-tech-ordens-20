
import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '../hooks/useSupabaseAuth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ data: any; error: string | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: string | null }>;
  logout: () => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: any; error: string | null }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile: updateProfileHook,
    isAuthenticated
  } = useSupabaseAuth();

  const login = async (email: string, password: string) => {
    return await signIn(email, password);
  };

  const logout = async () => {
    return await signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    const result = await updateProfileHook(updates);
    return {
      data: result.data || null,
      error: result.error || null
    };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      login,
      signUp,
      logout,
      updateProfile,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};
