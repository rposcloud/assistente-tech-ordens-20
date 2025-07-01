
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { OSCloudLogo } from './OSCloudLogo';

export const Header = () => {
  const { user, profile } = useAuth();
  const { profile: companyProfile } = useProfile();

  const userName = profile?.nome_completo || user?.email?.split('@')[0] || 'Usuário';
  const companyName = companyProfile?.empresa || 'Sua Empresa';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <OSCloudLogo size="sm" />
          <div className="hidden sm:block">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Bem-vindo ao OS Cloud
            </h2>
            <p className="text-sm text-gray-500">
              Sistema completo de gestão para assistência técnica
            </p>
          </div>
          {/* Versão Mobile - Apenas logo e nome simplificado */}
          <div className="block sm:hidden">
            <h2 className="text-lg font-semibold text-gray-800">
              OS Cloud
            </h2>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{companyName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          {/* Versão Mobile - Apenas avatar */}
          <div className="text-right block sm:hidden">
            <p className="text-xs font-medium text-gray-700 truncate max-w-24">{companyName}</p>
          </div>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
            {companyProfile?.logo_url ? (
              <img
                src={companyProfile.logo_url}
                alt="Logo da empresa"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Se a imagem falhar ao carregar, mostra a inicial
                  e.currentTarget.style.display = 'none';
                  const span = document.createElement('span');
                  span.className = 'text-white text-sm font-medium';
                  span.textContent = userInitial;
                  e.currentTarget.parentNode?.appendChild(span);
                }}
              />
            ) : (
              <span className="text-white text-sm font-medium">
                {userInitial}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
