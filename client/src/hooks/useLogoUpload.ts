import { useState } from 'react';

export const useLogoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadLogo = async (file: File): Promise<{ success: boolean; error?: string; logoUrl?: string }> => {
    try {
      setUploading(true);
      setError(null);

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Apenas arquivos de imagem são permitidos');
        return { success: false, error: 'Apenas arquivos de imagem são permitidos' };
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 5MB');
        return { success: false, error: 'O arquivo deve ter no máximo 5MB' };
      }

      const formData = new FormData();
      formData.append('logo', file);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Token de autenticação não encontrado');
        return { success: false, error: 'Token de autenticação não encontrado' };
      }

      const response = await fetch('/api/profile/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao fazer upload da logo');
        return { success: false, error: data.error || 'Erro ao fazer upload da logo' };
      }

      // Recarregar a página para atualizar o perfil
      window.location.reload();

      return { 
        success: true, 
        logoUrl: data.logo_url 
      };
    } catch (error) {
      const errorMessage = 'Erro de conexão ao fazer upload';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  };

  const deleteLogo = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setUploading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Token de autenticação não encontrado');
        return { success: false, error: 'Token de autenticação não encontrado' };
      }

      const response = await fetch('/api/profile/logo', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao remover logo');
        return { success: false, error: data.error || 'Erro ao remover logo' };
      }

      // Recarregar a página para atualizar o perfil
      window.location.reload();

      return { success: true };
    } catch (error) {
      const errorMessage = 'Erro de conexão ao remover logo';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadLogo,
    deleteLogo,
    uploading,
    error,
    clearError: () => setError(null)
  };
};