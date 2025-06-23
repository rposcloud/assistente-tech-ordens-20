
import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

interface OrdemServico {
  id: string;
  clienteId: string;
  equipamento: string;
  problema: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  dataAbertura: string;
  dataConclusao?: string;
}

export const Dashboard = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);

  useEffect(() => {
    const clientesSalvos = localStorage.getItem('clientes');
    const ordensSalvas = localStorage.getItem('ordens');
    
    if (clientesSalvos) {
      setClientes(JSON.parse(clientesSalvos));
    }
    if (ordensSalvas) {
      setOrdens(JSON.parse(ordensSalvas));
    }
  }, []);

  const ordensCompletadas = ordens.filter(ordem => ordem.status === 'concluida').length;
  const ordensPendentes = ordens.filter(ordem => ordem.status === 'pendente').length;
  const ordensEmAndamento = ordens.filter(ordem => ordem.status === 'em_andamento').length;

  const cards = [
    {
      title: 'Total de Clientes',
      value: clientes.length,
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Ordens de Serviço',
      value: ordens.length,
      icon: FileText,
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Ordens Concluídas',
      value: ordensCompletadas,
      icon: CheckCircle,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Ordens Pendentes',
      value: ordensPendentes,
      icon: Clock,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${card.bgColor} rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ordens Recentes</h3>
          <div className="space-y-3">
            {ordens.slice(0, 5).map((ordem) => {
              const cliente = clientes.find(c => c.id === ordem.clienteId);
              const statusColors = {
                pendente: 'bg-yellow-100 text-yellow-800',
                em_andamento: 'bg-blue-100 text-blue-800',
                concluida: 'bg-green-100 text-green-800'
              };
              const statusTexts = {
                pendente: 'Pendente',
                em_andamento: 'Em Andamento',
                concluida: 'Concluída'
              };
              
              return (
                <div key={ordem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{ordem.equipamento}</p>
                    <p className="text-sm text-gray-600">{cliente?.nome || 'Cliente não encontrado'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ordem.status]}`}>
                    {statusTexts[ordem.status]}
                  </span>
                </div>
              );
            })}
            {ordens.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma ordem de serviço cadastrada</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Ordens</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pendentes</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${ordens.length > 0 ? (ordensPendentes / ordens.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{ordensPendentes}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Em Andamento</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${ordens.length > 0 ? (ordensEmAndamento / ordens.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{ordensEmAndamento}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Concluídas</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${ordens.length > 0 ? (ordensCompletadas / ordens.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{ordensCompletadas}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
