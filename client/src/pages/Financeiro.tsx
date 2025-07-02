
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Edit, Trash2, Filter, X, Check, MoreHorizontal } from 'lucide-react';
import { useFinanceiro, EntradaFinanceira } from '@/hooks/useFinanceiro';
import { EntradaFinanceiraModal } from '@/components/modals/EntradaFinanceiraModal';
import { SortableTable, Column } from '@/components/ui/sortable-table';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { toast } from 'sonner';
import { LinkedToBadge } from '@/components/LinkedToBadge';

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

type FiltroRapido = 'hoje' | 'ontem' | 'esta_semana' | 'semana_passada' | 'este_mes' | 'mes_passado' | 'ultimos_3_meses' | 'este_ano' | 'ano_passado' | 'todos';

export const Financeiro = () => {
  const { entradas, categorias, loading, createEntrada, updateEntrada, deleteEntrada } = useFinanceiro();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntrada, setSelectedEntrada] = useState<EntradaFinanceira | undefined>();
  const [modalLoading, setModalLoading] = useState(false);
  
  // Estados dos filtros
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>('este_mes');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pago' | 'pendente'>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');

  // Função para obter datas com base no filtro rápido
  const obterRangeDatas = (filtro: FiltroRapido) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horário para comparação correta
    
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    fimMes.setHours(23, 59, 59, 999); // Incluir todo o último dia do mês
    
    switch (filtro) {
      case 'hoje':
        const fimHoje = new Date(hoje);
        fimHoje.setHours(23, 59, 59, 999);
        return { inicio: hoje, fim: fimHoje };
      case 'ontem':
        const ontem = new Date(hoje);
        ontem.setDate(ontem.getDate() - 1);
        const fimOntem = new Date(ontem);
        fimOntem.setHours(23, 59, 59, 999);
        return { inicio: ontem, fim: fimOntem };
      case 'esta_semana':
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        const fimSemana = new Date(hoje);
        fimSemana.setHours(23, 59, 59, 999);
        return { inicio: inicioSemana, fim: fimSemana };
      case 'semana_passada':
        const inicioSemanaPassada = new Date(hoje);
        inicioSemanaPassada.setDate(hoje.getDate() - hoje.getDay() - 7);
        const fimSemanaPassada = new Date(inicioSemanaPassada);
        fimSemanaPassada.setDate(inicioSemanaPassada.getDate() + 6);
        fimSemanaPassada.setHours(23, 59, 59, 999);
        return { inicio: inicioSemanaPassada, fim: fimSemanaPassada };
      case 'este_mes':
        return { inicio: inicioMes, fim: fimMes };
      case 'mes_passado':
        const inicioMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        fimMesPassado.setHours(23, 59, 59, 999);
        return { inicio: inicioMesPassado, fim: fimMesPassado };
      case 'ultimos_3_meses':
        const inicio3Meses = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
        return { inicio: inicio3Meses, fim: fimMes };
      case 'este_ano':
        const inicioAno = new Date(hoje.getFullYear(), 0, 1);
        const fimAno = new Date(hoje.getFullYear(), 11, 31);
        fimAno.setHours(23, 59, 59, 999);
        return { inicio: inicioAno, fim: fimAno };
      case 'ano_passado':
        const inicioAnoPassado = new Date(hoje.getFullYear() - 1, 0, 1);
        const fimAnoPassado = new Date(hoje.getFullYear() - 1, 11, 31);
        fimAnoPassado.setHours(23, 59, 59, 999);
        return { inicio: inicioAnoPassado, fim: fimAnoPassado };
      case 'todos':
      default:
        return null;
    }
  };

  // Calcular estatísticas baseadas no filtro selecionado
  const estatisticas = useMemo(() => {
    if (!Array.isArray(entradas)) return { receitas: 0, despesas: 0, saldo: 0, aReceber: 0, aPagar: 0, periodo: 'Este Mês' };

    // Obter range de datas baseado no filtro atual
    let rangeDatas = null;
    let labelPeriodo = 'Este Mês';
    
    if (dataInicio && dataFim) {
      rangeDatas = { inicio: new Date(dataInicio), fim: new Date(dataFim) };
      labelPeriodo = 'Período Personalizado';
    } else {
      rangeDatas = obterRangeDatas(filtroRapido);
      const labels: Record<FiltroRapido, string> = {
        'hoje': 'Hoje',
        'ontem': 'Ontem', 
        'esta_semana': 'Esta Semana',
        'semana_passada': 'Semana Passada',
        'este_mes': 'Este Mês',
        'mes_passado': 'Mês Passado',
        'ultimos_3_meses': 'Últimos 3 Meses',
        'este_ano': 'Este Ano',
        'ano_passado': 'Ano Passado',
        'todos': 'Todos os Períodos'
      };
      labelPeriodo = labels[filtroRapido];
    }

    // Receitas do período selecionado (apenas pagas)
    let receitas = 0;
    if (rangeDatas) {
      receitas = entradas
        .filter((entrada: any) => {
          const data = new Date(entrada.data_vencimento + 'T00:00:00');
          return entrada.tipo === 'receita' && 
                 entrada.status === 'pago' &&
                 data >= rangeDatas.inicio && data <= rangeDatas.fim;
        })
        .reduce((sum, entrada) => sum + (parseFloat(String(entrada.valor)) || 0), 0);
    } else {
      // Para "todos", mostrar todas as receitas pagas
      receitas = entradas
        .filter((entrada: any) => entrada.tipo === 'receita' && entrada.status === 'pago')
        .reduce((sum, entrada) => sum + (parseFloat(String(entrada.valor)) || 0), 0);
    }

    // Despesas do período selecionado (apenas pagas)
    let despesas = 0;
    if (rangeDatas) {
      despesas = entradas
        .filter((entrada: any) => {
          const data = new Date(entrada.data_vencimento + 'T00:00:00');
          return entrada.tipo === 'despesa' && 
                 entrada.status === 'pago' &&
                 data >= rangeDatas.inicio && data <= rangeDatas.fim;
        })
        .reduce((sum, entrada) => sum + (parseFloat(String(entrada.valor)) || 0), 0);
    } else {
      // Para "todos", mostrar todas as despesas pagas
      despesas = entradas
        .filter((entrada: any) => entrada.tipo === 'despesa' && entrada.status === 'pago')
        .reduce((sum, entrada) => sum + (parseFloat(String(entrada.valor)) || 0), 0);
    }

    // A receber (todas as receitas pendentes, sem filtro de período)
    const aReceber = entradas
      .filter((entrada: any) => entrada.tipo === 'receita' && entrada.status === 'pendente')
      .reduce((sum, entrada) => sum + (parseFloat(String(entrada.valor)) || 0), 0);

    // A pagar (todas as despesas pendentes, sem filtro de período)
    const aPagar = entradas
      .filter((entrada: any) => entrada.tipo === 'despesa' && entrada.status === 'pendente')
      .reduce((sum, entrada) => sum + (parseFloat(String(entrada.valor)) || 0), 0);

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      aReceber,
      aPagar,
      periodo: labelPeriodo
    };
  }, [entradas, filtroRapido, dataInicio, dataFim]);

  // Entradas filtradas para a tabela
  const entradasFiltradas = useMemo(() => {
    if (!Array.isArray(entradas)) return [];

    let resultado = [...entradas];

    // Aplicar filtro de data
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio + 'T00:00:00');
      const fim = new Date(dataFim + 'T23:59:59'); 
      resultado = resultado.filter(entrada => {
        const data = new Date(entrada.data_vencimento + 'T00:00:00');
        return data >= inicio && data <= fim;
      });
    } else {
      const rangeDatas = obterRangeDatas(filtroRapido);
      if (rangeDatas) {
        resultado = resultado.filter(entrada => {
          const data = new Date(entrada.data_vencimento + 'T00:00:00');
          return data >= rangeDatas.inicio && data <= rangeDatas.fim;
        });
      }
    }

    // Aplicar filtro de tipo
    if (filtroTipo !== 'todos') {
      resultado = resultado.filter((entrada: any) => entrada.tipo === filtroTipo);
    }

    // Aplicar filtro de status
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter((entrada: any) => entrada.status === filtroStatus);
    }

    // Aplicar filtro de categoria
    if (filtroCategoria !== 'todas') {
      resultado = resultado.filter((entrada: any) => entrada.categoria === filtroCategoria);
    }

    return resultado;
  }, [entradas, filtroRapido, filtroTipo, filtroStatus, filtroCategoria, dataInicio, dataFim]);

  // Função para limpar filtros
  const limparFiltros = () => {
    setFiltroRapido('este_mes');
    setFiltroTipo('todos');
    setFiltroStatus('todos');
    setFiltroCategoria('todas');
    setDataInicio('');
    setDataFim('');
  };

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

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    entrada: EntradaFinanceira | null;
    loading: boolean;
  }>({
    isOpen: false,
    entrada: null,
    loading: false
  });

  const handleDelete = (entrada: EntradaFinanceira) => {
    // Verificar se a entrada está vinculada a uma OS
    if (entrada.ordem_servico_id) {
      toast.error('Esta entrada não pode ser excluída pois está vinculada a uma Ordem de Serviço!', {
        description: `Esta receita foi gerada automaticamente quando a OS foi finalizada. Para excluir, você deve reabrir a OS correspondente.`
      });
      return;
    }

    setDeleteModal({
      isOpen: true,
      entrada,
      loading: false
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.entrada) return;

    setDeleteModal(prev => ({ ...prev, loading: true }));

    try {
      await deleteEntrada(deleteModal.entrada.id);
      toast.success('Entrada excluída com sucesso!');
      setDeleteModal({
        isOpen: false,
        entrada: null,
        loading: false
      });
    } catch (error) {
      toast.error('Erro ao excluir entrada');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const closeDeleteModal = () => {
    if (deleteModal.loading) return;
    setDeleteModal({
      isOpen: false,
      entrada: null,
      loading: false
    });
  };

  const handleConcluir = async (entrada: EntradaFinanceira) => {
    if (window.confirm('Marcar esta entrada como paga?')) {
      try {
        const entradaAtualizada = {
          ...entrada,
          status: 'pago' as const,
          data_pagamento: new Date().toISOString().split('T')[0]
        };
        await updateEntrada(entrada.id, entradaAtualizada);
        toast.success('Entrada marcada como paga!');
      } catch (error) {
        toast.error('Erro ao concluir entrada');
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
      sortable: true,
      render: (entrada) => (
        <div className="flex flex-col gap-1">
          <span>{entrada.descricao}</span>
          {entrada.ordem_servico_id && (
            <LinkedToBadge 
              type="ordem-servico"
              linkedId={entrada.ordem_servico_id}
              size="sm"
            />
          )}
        </div>
      )
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
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (entrada) => (
        <Badge className={statusColors[(entrada as any).status] || 'bg-gray-100 text-gray-800'}>
          {statusLabels[(entrada as any).status] || (entrada as any).status}
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
      label: '',
      sortable: false,
      render: (entrada) => (
        <div className="flex gap-2">
          {(entrada as any).status === 'pendente' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleConcluir(entrada);
              }}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Marcar como pago"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Controle Financeiro</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">
            Acompanhe receitas, despesas e fluxo de caixa do seu negócio
          </p>
        </div>
        <Button onClick={handleNewEntrada} className="flex items-center whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Nova Entrada
        </Button>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receitas ({estatisticas.periodo})
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {Number(estatisticas.receitas).toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Valores recebidos no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Despesas ({estatisticas.periodo})
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {Number(estatisticas.despesas).toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Valores pagos no período</p>
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
            <div className={`text-2xl font-bold ${Number(estatisticas.saldo) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {Number(estatisticas.saldo).toFixed(2)}
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
            <div className="text-2xl font-bold text-yellow-600">R$ {Number(estatisticas.aReceber).toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Receitas pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              A Pagar
            </CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">R$ {Number(estatisticas.aPagar).toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Despesas pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          {/* Filtros Compactos */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Dropdown de Período */}
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-gray-600">Período:</Label>
              <Select value={filtroRapido} onValueChange={(value: any) => setFiltroRapido(value)}>
                <SelectTrigger className="w-36 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="este_mes">Este Mês</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="ontem">Ontem</SelectItem>
                  <SelectItem value="esta_semana">Esta Semana</SelectItem>
                  <SelectItem value="mes_passado">Mês Passado</SelectItem>
                  <SelectItem value="ultimos_3_meses">Últimos 3 Meses</SelectItem>
                  <SelectItem value="este_ano">Este Ano</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Tipo */}
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-gray-600">Tipo:</Label>
              <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
                <SelectTrigger className="w-28 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Status */}
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-gray-600">Status:</Label>
              <Select value={filtroStatus} onValueChange={(value: any) => setFiltroStatus(value)}>
                <SelectTrigger className="w-28 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botão Limpar integrado */}
            <Button variant="ghost" size="sm" onClick={limparFiltros} className="h-8 px-2">
              <X className="h-3 w-3 mr-1" />
              <span className="text-xs">Limpar</span>
            </Button>

            {/* Contador de registros */}
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-auto">
              {entradasFiltradas.length} registro(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">Carregando...</div>
          ) : (
            <>
              {/* Versão Desktop - Tabela */}
              <div className="hidden lg:block">
                <SortableTable
                  data={entradasFiltradas}
                  columns={columns}
                  keyExtractor={(entrada) => entrada.id!}
                  emptyMessage="Nenhuma movimentação encontrada para os filtros selecionados"
                  emptyIcon={<DollarSign className="h-16 w-16 text-gray-300 mb-4" />}
                />
              </div>

              {/* Versão Mobile - Cards */}
              <div className="lg:hidden">
                {entradasFiltradas.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-16 w-16 text-gray-300 mb-4 mx-auto" />
                    <p className="text-gray-500">Nenhuma movimentação encontrada para os filtros selecionados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entradasFiltradas.map((entrada) => (
                      <div key={entrada.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {/* Header do Card */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{entrada.descricao}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                entrada.tipo === 'receita' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {entrada.tipo === 'receita' ? 'Receita' : 'Despesa'}
                              </span>
                              {entrada.ordem_servico_id && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Vinculado à OS
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {(entrada as any).status === 'pendente' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConcluir(entrada);
                                }}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2"
                                title="Marcar como pago"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(entrada);
                              }}
                              className="p-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!entrada.ordem_servico_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(entrada);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                                disabled={!!entrada.ordem_servico_id}
                                title={entrada.ordem_servico_id ? "Não é possível excluir entrada vinculada à OS" : "Excluir entrada"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Informações do Card */}
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Valor:</span>
                            <span className={`font-semibold ${
                              entrada.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {entrada.tipo === 'receita' ? '+' : '-'} R$ {Number(entrada.valor).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Vencimento:</span>
                            <span className="text-gray-900">
                              {new Date(entrada.data_vencimento).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status:</span>
                            <Badge className={statusColors[(entrada as any).status] || 'bg-gray-100 text-gray-800'}>
                              {statusLabels[(entrada as any).status] || (entrada as any).status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
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

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Excluir Entrada Financeira"
        message={`Tem certeza que deseja excluir a entrada "${deleteModal.entrada?.descricao}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        loading={deleteModal.loading}
      />
    </div>
  );
};
