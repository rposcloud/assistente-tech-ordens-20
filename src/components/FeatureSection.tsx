
import React from 'react';
import { Users, FileText, Package, DollarSign, CheckCircle, BarChart3, Shield, Clock } from 'lucide-react';

export const FeatureSection = () => {
  const features = [
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'Cadastro completo com histórico de serviços e informações detalhadas'
    },
    {
      icon: FileText,
      title: 'Ordens de Serviço',
      description: 'Controle total do fluxo de trabalho, desde o orçamento até a entrega'
    },
    {
      icon: Package,
      title: 'Produtos & Serviços',
      description: 'Catálogo organizado com preços e descrições detalhadas'
    },
    {
      icon: DollarSign,
      title: 'Controle Financeiro',
      description: 'Acompanhe receitas, despesas e fluxo de caixa em tempo real'
    }
  ];

  const benefits = [
    {
      icon: CheckCircle,
      text: 'Aumente a produtividade em até 40%'
    },
    {
      icon: BarChart3,
      text: 'Relatórios detalhados e insights'
    },
    {
      icon: Shield,
      text: 'Seus dados seguros na nuvem'
    },
    {
      icon: Clock,
      text: 'Acesso 24/7 de qualquer lugar'
    }
  ];

  return (
    <div className="flex flex-col justify-center h-full space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">TechService</h1>
        <p className="text-xl text-gray-600">
          O sistema completo para gerenciar sua assistência técnica
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Principais Recursos
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Icon size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 text-center">
          Por que escolher o TechService?
        </h2>
        <div className="space-y-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex items-center space-x-3">
                <Icon size={18} className="text-green-600" />
                <span className="text-gray-700">{benefit.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
        <h3 className="font-semibold text-gray-900 mb-2">
          Comece gratuitamente hoje mesmo
        </h3>
        <p className="text-sm text-gray-600">
          Sem cartão de crédito • Configuração em 5 minutos • Suporte dedicado
        </p>
      </div>
    </div>
  );
};
