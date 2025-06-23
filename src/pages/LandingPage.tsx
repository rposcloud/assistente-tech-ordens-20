
import React from 'react';
import { AuthForm } from '../components/AuthForm';
import { FeatureSection } from '../components/FeatureSection';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Seção do Formulário - Esquerda */}
        <div className="flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <AuthForm />
          </div>
        </div>

        {/* Seção de Informações - Direita */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 lg:p-12 text-white hidden lg:flex">
          <div className="w-full max-w-lg mx-auto">
            <FeatureSection />
          </div>
        </div>

        {/* Versão Mobile das Informações */}
        <div className="lg:hidden bg-gray-50 p-8">
          <div className="max-w-md mx-auto">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-gray-900">TechService</h2>
              <p className="text-gray-600">
                Sistema completo para assistência técnica
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">100+</div>
                <div className="text-sm text-gray-600">Empresas</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">40%</div>
                <div className="text-sm text-gray-600">Mais produtivo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
