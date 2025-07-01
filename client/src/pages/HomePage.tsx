
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Package, DollarSign, CheckCircle, BarChart3, Shield, Clock, Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OSCloudLogo } from '../components/OSCloudLogo';

export const HomePage = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <OSCloudLogo size="md" showText={true} />
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link to="/cadastro">
                <Button>Cadastrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            O sistema completo para
            <span className="text-blue-600"> assistência técnica</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Gerencie clientes, ordens de serviço, produtos e financeiro tudo em um só lugar. 
            Aumente sua produtividade e organize seu negócio com o OS Cloud.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/cadastro">
              <Button size="lg" className="px-8 py-3">
                Começar Gratuitamente
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Principais Recursos
            </h2>
            <p className="text-lg text-gray-600">
              Tudo que você precisa para gerenciar sua assistência técnica
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="bg-blue-100 p-3 rounded-lg w-fit mx-auto mb-4">
                    <Icon size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher o OS Cloud?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <Icon size={20} className="text-green-600" />
                  <span className="text-gray-700">{benefit.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comece gratuitamente hoje mesmo
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Sem cartão de crédito • Configuração em 5 minutos • Suporte dedicado
          </p>
          <Link to="/cadastro">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
