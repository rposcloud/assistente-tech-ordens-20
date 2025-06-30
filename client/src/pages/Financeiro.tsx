
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Edit, Trash2 } from 'lucide-react';
import { useFinanceiro, EntradaFinanceira } from '@/hooks/useFinanceiro';
import { EntradaFinanceiraModal } from '@/components/modals/EntradaFinanceiraModal';
import { SortableTable, Column } from '@/components/ui/sortable-table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const statusColors: { [key: string]: string } = {
  pendente: 'bg-yellow-100 text-yellow-800',
  pago: 'bg-green-100 text-green-800',
  parcial: 'bg-blue-100 text-blue-800',
  cancelado: 'bg-red-100 text-red-800'
};

const statusLabels: { [key: string]: string } = {
  pendente: 'Pendente',
  pago: 'Pago',
  parcial: 'Parcial',
  cancelado: 'Cancelado'
};

export const Financeiro = () => {
  const { entradas, categorias, loading, createEntrada, updateEntrada, deleteEntrada } = useFinanceiro();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntrada, setSelectedEntrada] = useState<EntradaFinanceira | undefined>();
  const [modalLoading, setModalLoading] = useState(false);

  // Calcular estatísticas do mês atual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const entradasMesAtual = entradas.filter(entrada => {
    const dataVencimento = new Date(entrada.data_vencimento);
    return dataVencimento.getMonth() === currentMonth && dataVencimento.getFullYear() === currentYear;
  });

  const receitas = entradasMesAtual
    .filter(entrada => entrada.tipo === 'receita' && entrada.status_pagamento === 'pago')
    .reduce((sum, entrada) => sum + (parseFloat(String(entrada.valor)) || 0), 0);

  const despesas = entradasMesAtual
    .filter(entrada => entrada.tipo === 'despesa' && entrada.status_pagamento === 'pago')
    .reduce((sum, entrada) => sum + (parseFloat(String(entrada.valor)) || 0), 0);

  const saldo = receitas - despesas;

  const aReceber = entradas
    .filter(entrada => entrada.tipo === 'receita' && entrada.status_pagamento === 'pendente')
    .reduce((sum, entrada) => sum + (parseFloat(String(entrada.valor)) || 0), 0);

  const handleSubmit = async (data: Omit<EntradaFinanceira, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setModalLoading(true);
      if (selectedEntrada) {
        await updateEntrada(selectedEntrada.id!, data);
        toast.success('Entrada atualizada com sucesso!');
      } else {
        await createEntrada(data);
        toast.success('Entrada criada com sucesso!');
      }
      setModalOpen(false);
      setSelectedEntrada(undefined);
    } catch (error) {
      toast.error('Erro ao salvar entrada');
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = (entrada: EntradaFinanceira) => {
    setSelectedEntrada(entrada);
    setModalOpen(true);
  };

  const handleDelete = async (entrada: EntradaFinanceira) => {
    if (window.confirm(`Tem certeza que deseja excluir a entrada "${entrada.descricao}"?`)) {
      try {
        await deleteEntrada(entrada.id);
        toast.success('Entrada excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir entrada');
      }
    }
  };

  const handleNewEntrada = () => {
    setSelectedEntrada(undefined);
    setModalOpen(true);
  };

  const columns: Column<EntradaFinanceira>[] = [
    {
      key: 'tipo',
      label: 'Tipo',
      sortable: true,
      render: (entrada) => (
        <Badge className={entrada.tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {entrada.tipo === 'receita' ? 'Receita' : 'Despesa'}
        </Badge>
      )
    },
    {
      key: 'descricao',
      label: 'Descrição',
      sortable: true
    },
    {
      key: 'categoria',
      label: 'Categoria',
      sortable: true
    },
    {
      key: 'valor',
      label: 'Valor',
      sortable: true,
      render: (entrada) => {
        const valor = typeof entrada.valor === 'string' ? parseFloat(entrada.valor) : entrada.valor;
        return `R$ ${(valor || 0).toFixed(2)}`;
      }
    },
    {
      key: 'forma_pagamento',
      label: 'Forma Pagamento',
      sortable: true,
      render: (entrada) => {
        const formas: { [key: string]: string } = {
          dinheiro: 'Dinheiro',
          cartao_credito: 'Cartão Crédito',
          cartao_debito: 'Cartão Débito',
          pix: 'PIX',
          transferencia: 'Transferência',
          parcelado: 'Parcelado'
        };
        return formas[entrada.forma_pagamento || ''] || entrada.forma_pagamento || '';
      }
    },
    {
      key: 'status_pagamento',
      label: 'Status',
      sortable: true,
      render: (entrada) => (
        <Badge className={statusColors[entrada.status_pagamento] || 'bg-gray-100 text-gray-800'}>
          {statusLabels[entrada.status_pagamento] || entrada.status_pagamento}
        </Badge>
      )
    },
    {
      key: 'data_vencimento',
      label: 'Vencimento',
      sortable: true,
      render: (entrada) => new Date(entrada.data_vencimento).toLocaleDateString('pt-BR')
    },
    {
      key: 'actions',
      label: 'Ações',
      sortable: false,
      render: (entrada) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(entrada);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(entrada);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle Financeiro</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe receitas, despesas e fluxo de caixa do seu negócio
          </p>
        </div>
        <Button onClick={handleNewEntrada} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Nova Entrada
        </Button>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receitas (Mês)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {receitas.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Valores recebidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Despesas (Mês)
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {despesas.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Valores pagos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Saldo
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {saldo.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Receitas - Despesas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              A Receber
            </CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">R$ {aReceber.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Pendências</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">Carregando...</div>
          ) : (
            <SortableTable
              data={entradas}
              columns={columns}
              keyExtractor={(entrada) => entrada.id!}
              emptyMessage="Nenhuma movimentação encontrada"
              emptyIcon={<DollarSign className="h-16 w-16 text-gray-300 mb-4" />}
            />
          )}
        </CardContent>
      </Card>

      <EntradaFinanceiraModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEntrada(undefined);
        }}
        onSubmit={handleSubmit}
        categorias={categorias}
        initialData={selectedEntrada}
        loading={modalLoading}
      />
    </div>
  );
};
