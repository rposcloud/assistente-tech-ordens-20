
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';

export const Header = () => {
  const { user, profile } = useAuth();
  const { profile: companyProfile } = useProfile();

  const userName = profile?.nome_completo || user?.email?.split('@')[0] || 'Usuário';
  const companyName = companyProfile?.empresa || 'TechService';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Bem-vindo ao TechService
          </h2>
          <p className="text-sm text-gray-500">
            Sistema de gerenciamento de clientes e ordens de serviço
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{companyName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {userInitial}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
