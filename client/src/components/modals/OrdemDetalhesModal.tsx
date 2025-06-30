import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OrdemServico } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrdemDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordem: OrdemServico | null;
}

const statusLabels = {
  aguardando_diagnostico: 'Aguardando Diagnóstico',
  aguardando_aprovacao: 'Aguardando Aprovação',
  aguardando_pecas: 'Aguardando Peças',
  em_reparo: 'Em Reparo',
  pronto_entrega: 'Pronto para Entrega',
  entregue: 'Entregue'
};

const statusColors = {
  aguardando_diagnostico: 'bg-yellow-100 text-yellow-800',
  aguardando_aprovacao: 'bg-blue-100 text-blue-800',
  aguardando_pecas: 'bg-orange-100 text-orange-800',
  em_reparo: 'bg-purple-100 text-purple-800',
  pronto_entrega: 'bg-green-100 text-green-800',
  entregue: 'bg-gray-100 text-gray-800'
};

const prioridadeLabels = {
  baixa: 'Baixa',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente'
};

const prioridadeColors = {
  baixa: 'bg-green-100 text-green-800',
  normal: 'bg-blue-100 text-blue-800',
  alta: 'bg-orange-100 text-orange-800',
  urgente: 'bg-red-100 text-red-800'
};

export const OrdemDetalhesModal = ({ isOpen, onClose, ordem }: OrdemDetalhesModalProps) => {
  if (!ordem) return null;

  const formatDate = (date: string | null) => {
    if (!date) return 'Não informado';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const formatCurrency = (value: string | number | null) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue || 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Ordem de Serviço #{ordem.numero}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge className={statusColors[ordem.status as keyof typeof statusColors]}>
                      {statusLabels[ordem.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Prioridade</label>
                  <div className="mt-1">
                    <Badge className={prioridadeColors[ordem.prioridade as keyof typeof prioridadeColors]}>
                      {prioridadeLabels[ordem.prioridade as keyof typeof prioridadeLabels]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Abertura</label>
                  <p className="mt-1">{formatDate(ordem.data_abertura)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome</label>
                  <p className="mt-1">{(ordem as any).clientes?.nome || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="mt-1">{(ordem as any).clientes?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Telefone</label>
                  <p className="mt-1">{(ordem as any).clientes?.telefone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">CPF/CNPJ</label>
                  <p className="mt-1">{(ordem as any).clientes?.cpf_cnpj || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Equipamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo</label>
                  <p className="mt-1 capitalize">{ordem.tipo_equipamento}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Marca</label>
                  <p className="mt-1">{ordem.marca || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Modelo</label>
                  <p className="mt-1">{ordem.modelo || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Número de Série</label>
                  <p className="mt-1">{ordem.numero_serie || 'N/A'}</p>
                </div>
              </div>
              
              {ordem.senha_equipamento && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Senha do Equipamento</label>
                  <p className="mt-1 font-mono bg-gray-50 p-2 rounded">{ordem.senha_equipamento}</p>
                </div>
              )}
              
              {ordem.acessorios && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Acessórios</label>
                  <p className="mt-1">{ordem.acessorios}</p>
                </div>
              )}
              
              {ordem.condicoes_equipamento && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Condições do Equipamento</label>
                  <p className="mt-1">{ordem.condicoes_equipamento}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diagnóstico e Reparo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diagnóstico e Reparo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Defeito Relatado</label>
                <p className="mt-1">{ordem.defeito_relatado || 'N/A'}</p>
              </div>
              
              {ordem.diagnostico_tecnico && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Diagnóstico Técnico</label>
                  <p className="mt-1">{ordem.diagnostico_tecnico}</p>
                </div>
              )}
              
              {ordem.solucao_aplicada && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Solução Aplicada</label>
                  <p className="mt-1">{ordem.solucao_aplicada}</p>
                </div>
              )}
              
              {ordem.tecnico_responsavel && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Técnico Responsável</label>
                  <p className="mt-1">{ordem.tecnico_responsavel}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Valores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Mão de Obra</label>
                  <p className="mt-1">{formatCurrency(ordem.valor_mao_obra)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Orçamento</label>
                  <p className="mt-1">{formatCurrency(ordem.valor_orcamento)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total</label>
                  <p className="mt-1">{formatCurrency(ordem.valor_total)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Desconto</label>
                  <p className="mt-1">{formatCurrency(ordem.desconto)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Acréscimo</label>
                  <p className="mt-1">{formatCurrency(ordem.acrescimo)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Valor Final</label>
                  <p className="mt-1 text-lg font-semibold text-green-600">{formatCurrency(ordem.valor_final)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prazos e Garantia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prazos e Garantia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Prazo de Entrega</label>
                  <p className="mt-1">{ordem.prazo_entrega ? `${ordem.prazo_entrega} dias` : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Garantia</label>
                  <p className="mt-1">{ordem.garantia ? `${ordem.garantia} dias` : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Previsão de Entrega</label>
                  <p className="mt-1">{formatDate(ordem.data_previsao_entrega)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Aprovação</label>
                  <p className="mt-1">{formatDate(ordem.data_aprovacao)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status de Pagamento */}
          {ordem.forma_pagamento && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Forma de Pagamento</label>
                    <p className="mt-1 capitalize">{ordem.forma_pagamento.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status do Pagamento</label>
                    <p className="mt-1 capitalize">{ordem.status_pagamento}</p>
                  </div>
                  {ordem.data_pagamento && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data do Pagamento</label>
                      <p className="mt-1">{formatDate(ordem.data_pagamento)}</p>
                    </div>
                  )}
                  {ordem.data_vencimento && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data de Vencimento</label>
                      <p className="mt-1">{formatDate(ordem.data_vencimento)}</p>
                    </div>
                  )}
                </div>
                
                {ordem.observacoes_pagamento && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Observações do Pagamento</label>
                    <p className="mt-1">{ordem.observacoes_pagamento}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};