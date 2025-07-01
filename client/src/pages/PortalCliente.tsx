
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Printer, Clock, CheckCircle, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { OrdemServico, Cliente } from '../types';
import { OrderPrint } from '../components/print/OrderPrint';
import { formatCurrency } from '../utils/masks';
import { isTokenValid } from '../utils/tokenUtils';
import { useReactToPrint } from 'react-to-print';
import { CompanyProfile } from '../hooks/useProfile';

export const PortalCliente = () => {
  const { token } = useParams<{ token: string }>();
  const [ordem, setOrdem] = useState<OrdemServico | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `OS-${ordem?.numero || 'ordem'}`,
  });

  useEffect(() => {
    const loadOrdemData = async () => {
      try {
        if (!token) {
          setError('Token não fornecido');
          setLoading(false);
          return;
        }

        console.log('Buscando ordem com token:', token);

        // Buscar ordem pelo token usando nossa API
        const ordemData = await api.portal.getByToken(token);

        if (!ordemData) {
          setError('Ordem de serviço não encontrada ou link inválido');
          setLoading(false);
          return;
        }

        console.log('Ordem encontrada:', ordemData);

        // Verificar se o token não expirou
        if (!isTokenValid(ordemData.link_expires_at)) {
          setError('Link expirado. Entre em contato conosco para obter um novo link.');
          setLoading(false);
          return;
        }

        // Nota: O perfil da empresa será implementado quando necessário

        setOrdem(ordemData);
        setCliente(ordemData.cliente || null);
        setCompanyProfile(null); // Será implementado quando necessário
        
      } catch (err) {
        console.error('Erro geral:', err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadOrdemData();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalizada':
        return 'text-green-600 bg-green-100';
      case 'pronta':
        return 'text-blue-600 bg-blue-100';
      case 'em_andamento':
        return 'text-orange-600 bg-orange-100';
      case 'aguardando_pecas':
        return 'text-yellow-600 bg-yellow-100';
      case 'aberta':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      aberta: 'Aberta',
      em_andamento: 'Em Andamento',
      aguardando_pecas: 'Aguardando Peças',
      pronta: 'Pronta',
      finalizada: 'Finalizada'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando informações...</p>
        </div>
      </div>
    );
  }

  if (error || !ordem || !cliente) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Precisa de ajuda?</h3>
            <p className="text-blue-700 text-sm">Entre em contato conosco:</p>
            <div className="mt-2 space-y-1 text-sm text-blue-700">
              <div className="flex items-center justify-center">
                <Phone className="h-4 w-4 mr-2" />
                {companyProfile?.telefone || '(11) 9999-9999'}
              </div>
              <div className="flex items-center justify-center">
                <Mail className="h-4 w-4 mr-2" />
                {companyProfile?.email_empresa || 'contato@techservice.com'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                {companyProfile?.empresa || 'TechService'}
              </h1>
              <p className="text-gray-600">Portal do Cliente</p>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir OS
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Status da Ordem */}
        <div className="bg-white rounded-xl shadow-sm border mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Ordem de Serviço #{ordem.numero}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ordem.status)}`}>
              {getStatusText(ordem.status)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Data de Abertura:</span>
              <p className="font-medium">{ordem.data_abertura ? new Date(ordem.data_abertura).toLocaleDateString('pt-BR') : 'N/A'}</p>
            </div>
            {ordem.prazo_entrega && (
              <div>
                <span className="text-gray-500">Prazo de Entrega:</span>
                <p className="font-medium">{new Date(ordem.prazo_entrega).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">Garantia:</span>
              <p className="font-medium">{ordem.garantia} dias</p>
            </div>
          </div>
        </div>

        {/* Informações do Equipamento */}
        <div className="bg-white rounded-xl shadow-sm border mb-6 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Equipamento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 text-sm">Tipo:</span>
              <p className="font-medium capitalize">{ordem.tipo_equipamento}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Marca/Modelo:</span>
              <p className="font-medium">{ordem.marca} {ordem.modelo}</p>
            </div>
            {ordem.numero_serie && (
              <div className="md:col-span-2">
                <span className="text-gray-500 text-sm">Número de Série:</span>
                <p className="font-medium">{ordem.numero_serie}</p>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <span className="text-gray-500 text-sm">Defeito Relatado:</span>
            <p className="mt-1 p-3 bg-gray-50 rounded-lg">{ordem.defeito_relatado}</p>
          </div>

          {ordem.diagnostico_tecnico && (
            <div className="mt-4">
              <span className="text-gray-500 text-sm">Diagnóstico Técnico:</span>
              <p className="mt-1 p-3 bg-blue-50 rounded-lg">{ordem.diagnostico_tecnico}</p>
            </div>
          )}

          {ordem.solucao_aplicada && (
            <div className="mt-4">
              <span className="text-gray-500 text-sm">Solução Aplicada:</span>
              <p className="mt-1 p-3 bg-green-50 rounded-lg">{ordem.solucao_aplicada}</p>
            </div>
          )}
        </div>

        {/* Informações Financeiras */}
        {ordem.finalizada && (
          <div className="bg-white rounded-xl shadow-sm border mb-6 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-600" />
              Informações de Pagamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 text-sm">Valor Total:</span>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(parseFloat(ordem.valor_final || ordem.valor_total || '0'))}
                </p>
              </div>
              {ordem.forma_pagamento && (
                <div>
                  <span className="text-gray-500 text-sm">Forma de Pagamento:</span>
                  <p className="font-medium capitalize">{ordem.forma_pagamento.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contato - usando dados dinâmicos */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">Entre em Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center text-blue-700">
              <Phone className="h-4 w-4 mr-2" />
              <span>{companyProfile?.telefone || '(11) 9999-9999'}</span>
            </div>
            <div className="flex items-center text-blue-700">
              <Mail className="h-4 w-4 mr-2" />
              <span>{companyProfile?.email_empresa || 'contato@techservice.com'}</span>
            </div>
            <div className="flex items-center text-blue-700">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{companyProfile?.cidade || 'São Paulo'}/{companyProfile?.estado || 'SP'}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Componente de impressão (oculto) */}
      <div className="hidden">
        <OrderPrint ref={printRef} ordem={ordem} cliente={cliente} companyProfile={companyProfile} />
      </div>
    </div>
  );
};
