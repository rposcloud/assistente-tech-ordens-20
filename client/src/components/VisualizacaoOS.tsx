import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Wrench, Package, CreditCard, FileText, Clock, Shield } from 'lucide-react';

interface VisualizacaoOSProps {
  ordem: any;
}

const statusColors = {
  'aguardando_diagnostico': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'aguardando_aprovacao': 'bg-blue-100 text-blue-800 border-blue-200',
  'aguardando_pecas': 'bg-orange-100 text-orange-800 border-orange-200',
  'em_reparo': 'bg-purple-100 text-purple-800 border-purple-200',
  'pronto_entrega': 'bg-green-100 text-green-800 border-green-200',
  'entregue': 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusLabels = {
  'aguardando_diagnostico': 'Aguardando Diagnóstico',
  'aguardando_aprovacao': 'Aguardando Aprovação',
  'aguardando_pecas': 'Aguardando Peças',
  'em_reparo': 'Em Reparo',
  'pronto_entrega': 'Pronto para Entrega',
  'entregue': 'Entregue'
};

const prioridadeColors = {
  'baixa': 'bg-green-50 text-green-700 border-green-200',
  'normal': 'bg-blue-50 text-blue-700 border-blue-200',
  'alta': 'bg-orange-50 text-orange-700 border-orange-200',
  'urgente': 'bg-red-50 text-red-700 border-red-200'
};

export const VisualizacaoOS: React.FC<VisualizacaoOSProps> = ({ ordem }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue || 0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Ordem de Serviço #{ordem.numero}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {ordem.clientes?.nome} - {ordem.clientes?.telefone}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={`px-3 py-1 text-sm font-medium border ${statusColors[ordem.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {statusLabels[ordem.status] || ordem.status}
              </Badge>
              <Badge className={`px-3 py-1 text-sm font-medium border ${prioridadeColors[ordem.prioridade] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {ordem.prioridade?.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações do Cliente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Nome</p>
              <p className="text-gray-900">{ordem.clientes?.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Telefone</p>
              <p className="text-gray-900">{ordem.clientes?.telefone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">E-mail</p>
              <p className="text-gray-900">{ordem.clientes?.email || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Endereço</p>
              <p className="text-gray-900">
                {ordem.clientes?.endereco ? 
                  `${ordem.clientes.endereco}, ${ordem.clientes.numero || 'S/N'} - ${ordem.clientes.bairro}, ${ordem.clientes.cidade}/${ordem.clientes.estado}` 
                  : 'Não informado'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Equipamento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-green-600" />
              Equipamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Tipo</p>
              <p className="text-gray-900 capitalize">{ordem.tipo_equipamento}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Marca</p>
              <p className="text-gray-900">{ordem.marca}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Modelo</p>
              <p className="text-gray-900">{ordem.modelo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Número de Série</p>
              <p className="text-gray-900">{ordem.numero_serie || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Senha</p>
              <p className="text-gray-900">{ordem.senha_equipamento || 'Não informado'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Descrição do Problema */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-orange-600" />
            Descrição do Problema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Defeito Relatado</p>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-md border">
              {ordem.defeito_relatado}
            </p>
          </div>
          
          {ordem.diagnostico_tecnico && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Diagnóstico Técnico</p>
              <p className="text-gray-900 bg-blue-50 p-3 rounded-md border border-blue-200">
                {ordem.diagnostico_tecnico}
              </p>
            </div>
          )}
          
          {ordem.solucao_aplicada && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Solução Aplicada</p>
              <p className="text-gray-900 bg-green-50 p-3 rounded-md border border-green-200">
                {ordem.solucao_aplicada}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Produtos e Serviços */}
      {(ordem.produtos_utilizados?.length > 0 || ordem.pecas_utilizadas?.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="h-5 w-5 text-purple-600" />
              Produtos e Serviços Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ordem.produtos_utilizados?.map((produto: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                  <div>
                    <p className="font-medium text-gray-900">{produto.produto?.nome}</p>
                    <p className="text-sm text-gray-600">
                      {produto.quantidade}x - {formatCurrency(produto.valor_unitario)} cada
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(produto.valor_total)}
                  </p>
                </div>
              ))}
              
              {ordem.pecas_utilizadas?.map((peca: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                  <div>
                    <p className="font-medium text-gray-900">{peca.nome}</p>
                    <p className="text-sm text-gray-600">
                      {peca.quantidade}x - {formatCurrency(peca.valor_unitario)} cada
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(peca.valor_total)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações de Serviço */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-indigo-600" />
              Informações de Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Data de Abertura</p>
              <p className="text-gray-900">{formatDate(ordem.data_abertura)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Técnico Responsável</p>
              <p className="text-gray-900">{ordem.tecnico_responsavel || 'Não atribuído'}</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Garantia</p>
                <p className="text-gray-900">{ordem.garantia} dias</p>
              </div>
            </div>
            {ordem.observacoes_internas && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Observações Internas</p>
                <p className="text-gray-900 bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm">
                  {ordem.observacoes_internas}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Mão de Obra:</span>
                <span>{formatCurrency(ordem.valor_mao_obra)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Orçamento:</span>
                <span>{formatCurrency(ordem.valor_orcamento)}</span>
              </div>
              {parseFloat(ordem.desconto || '0') > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Desconto:</span>
                  <span>- {formatCurrency(ordem.desconto)}</span>
                </div>
              )}
              {parseFloat(ordem.acrescimo || '0') > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Acréscimo:</span>
                  <span>+ {formatCurrency(ordem.acrescimo)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">{formatCurrency(ordem.valor_total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};