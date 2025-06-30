
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  nome_completo: string;
  empresa?: string;
  telefone?: string;
}

interface AuthContextType {
  user: User | null;
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

const API_BASE = '/api';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Verificar se existe token salvo no localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      // Verificar se o token ainda é válido
      fetchProfile(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
        setUser({ id: profileData.id, email: profileData.email || '' });
      } else {
        // Token inválido, limpar dados
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setProfile(data.profile);
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
        return { data, error: null };
      } else {
        return { data: null, error: data.error || 'Erro no login' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { data: null, error: 'Erro de conexão' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setProfile(data.profile);
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
        return { data, error: null };
      } else {
        return { data: null, error: data.error || 'Erro no cadastro' };
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { data: null, error: 'Erro de conexão' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { error: 'Erro de conexão' };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!token) {
        return { data: null, error: 'Não autenticado' };
      }

      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data);
        return { data, error: null };
      } else {
        return { data: null, error: data.error || 'Erro ao atualizar perfil' };
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error: 'Erro de conexão' };
    }
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{
      user,
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
