import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Package, Wrench, CreditCard } from 'lucide-react';

interface VisualizacaoOSProps {
  ordem: any;
}

const statusLabels = {
  'aguardando_diagnostico': 'Aguardando Diagnóstico',
  'aguardando_aprovacao': 'Aguardando Aprovação',
  'aguardando_pecas': 'Aguardando Peças',
  'em_reparo': 'Em Reparo',
  'pronto_entrega': 'Pronto para Entrega',
  'entregue': 'Entregue'
};

export const VisualizacaoOS: React.FC<VisualizacaoOSProps> = ({ ordem }) => {
  if (!ordem) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Ordem de serviço não encontrada.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: any) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue || 0);
  };

  return (
    <div className="p-6 space-y-6 print:p-4 print:space-y-4">
      {/* Cabeçalho da Empresa */}
      <div className="text-center border-b pb-4 print:pb-2">
        <h1 className="text-2xl font-bold text-gray-900 print:text-xl">TechService - Assistência Técnica</h1>
        <p className="text-gray-600 print:text-sm">(11) 99999-9999 | contato@techservice.com.br</p>
      </div>

      {/* Informações da OS */}
      <Card className="print:shadow-none print:border-gray-300">
        <CardHeader className="print:pb-2">
          <CardTitle className="flex justify-between items-center print:text-lg">
            <span>Ordem de Serviço #{ordem.numero}</span>
            <div className="flex gap-2">
              <Badge variant="outline">{statusLabels[ordem.status] || ordem.status}</Badge>
              <Badge variant="outline">{(ordem.prioridade || 'normal').toUpperCase()}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="print:pt-0">
          <p className="text-gray-600 print:text-sm">Data: {formatDate(ordem.data_abertura)}</p>
        </CardContent>
      </Card>

      {/* Cliente e Equipamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4">
        {/* Cliente */}
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="print:pb-2">
            <CardTitle className="flex items-center gap-2 text-lg print:text-base">
              <User className="h-5 w-5 text-blue-600" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="print:pt-0">
            <div className="space-y-2 print:space-y-1">
              <div>
                <p className="font-medium text-gray-700 print:text-sm">Nome:</p>
                <p className="text-gray-900 print:text-sm">{ordem.clientes?.nome || 'Não informado'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 print:text-sm">Telefone:</p>
                <p className="text-gray-900 print:text-sm">{ordem.clientes?.telefone || 'Não informado'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 print:text-sm">E-mail:</p>
                <p className="text-gray-900 print:text-sm">{ordem.clientes?.email || 'Não informado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipamento */}
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="print:pb-2">
            <CardTitle className="flex items-center gap-2 text-lg print:text-base">
              <Package className="h-5 w-5 text-green-600" />
              Equipamento
            </CardTitle>
          </CardHeader>
          <CardContent className="print:pt-0">
            <div className="space-y-2 print:space-y-1">
              <div>
                <p className="font-medium text-gray-700 print:text-sm">Tipo:</p>
                <p className="text-gray-900 capitalize print:text-sm">{ordem.tipo_equipamento}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 print:text-sm">Marca:</p>
                <p className="text-gray-900 print:text-sm">{ordem.marca}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 print:text-sm">Modelo:</p>
                <p className="text-gray-900 print:text-sm">{ordem.modelo}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 print:text-sm">N° Série:</p>
                <p className="text-gray-900 print:text-sm">{ordem.numero_serie || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Problema e Solução */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4">
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="print:pb-2">
            <CardTitle className="flex items-center gap-2 text-lg print:text-base">
              <Wrench className="h-5 w-5 text-orange-600" />
              Problema Relatado
            </CardTitle>
          </CardHeader>
          <CardContent className="print:pt-0">
            <p className="text-gray-900 print:text-sm">{ordem.descricao_problema || 'Não informado'}</p>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="print:pb-2">
            <CardTitle className="flex items-center gap-2 text-lg print:text-base">
              <Wrench className="h-5 w-5 text-green-600" />
              Solução Aplicada
            </CardTitle>
          </CardHeader>
          <CardContent className="print:pt-0">
            <p className="text-gray-900 print:text-sm">{ordem.descricao_solucao || 'Não informado'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      {ordem.observacoes && (
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="print:pb-2">
            <CardTitle className="text-lg print:text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent className="print:pt-0">
            <p className="text-gray-900 print:text-sm">{ordem.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Valores */}
      <Card className="print:shadow-none print:border-gray-300">
        <CardHeader className="print:pb-2">
          <CardTitle className="flex items-center gap-2 text-lg print:text-base">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Valores
          </CardTitle>
        </CardHeader>
        <CardContent className="print:pt-0">
          <div className="grid grid-cols-2 gap-4 print:gap-2">
            <div>
              <p className="font-medium text-gray-700 print:text-sm">Valor do Serviço:</p>
              <p className="text-lg font-bold text-gray-900 print:text-base">{formatCurrency(ordem.valor_servico)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 print:text-sm">Valor Total:</p>
              <p className="text-lg font-bold text-green-600 print:text-base">{formatCurrency(ordem.valor_total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assinaturas */}
      <Card className="print:shadow-none print:border-gray-300">
        <CardHeader className="print:pb-2">
          <CardTitle className="text-lg print:text-base">Assinaturas e Termo de Garantia</CardTitle>
        </CardHeader>
        <CardContent className="print:pt-0">
          <div className="grid grid-cols-2 gap-6 print:gap-4">
            <div>
              <p className="font-medium text-gray-700 mb-2 print:text-sm">Cliente:</p>
              <div className="border-b border-gray-300 h-8 mb-1"></div>
              <p className="text-sm text-gray-600">{ordem.clientes?.nome}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-2 print:text-sm">Técnico Responsável:</p>
              <div className="border-b border-gray-300 h-8 mb-1"></div>
              <p className="text-sm text-gray-600">{ordem.tecnico_responsavel || 'Técnico'}</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 print:mt-2 print:pt-2">
            <p className="font-medium text-gray-700 mb-2 print:text-sm">
              Garantia: {ordem.garantia || 30} dias para o serviço realizado
            </p>
            <p className="text-sm text-gray-600 print:text-xs">
              A garantia cobre apenas o serviço executado. Não cobre danos por mau uso ou acidente. 
              Válida mediante apresentação desta OS.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};