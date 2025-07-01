
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Edit, Trash2, Filter, X, Check } from 'lucide-react';
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
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Função para obter datas com base no filtro rápido
  const obterRangeDatas = (filtro: FiltroRapido) => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    switch (filtro) {
      case 'hoje':
        return { inicio: hoje, fim: hoje };
      case 'ontem':
        const ontem = new Date(hoje);
        ontem.setDate(ontem.getDate() - 1);
        return { inicio: ontem, fim: ontem };
      case 'esta_semana':
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        return { inicio: inicioSemana, fim: hoje };
      case 'semana_passada':
        const inicioSemanaPassada = new Date(hoje);
        inicioSemanaPassada.setDate(hoje.getDate() - hoje.getDay() - 7);
        const fimSemanaPassada = new Date(inicioSemanaPassada);
        fimSemanaPassada.setDate(inicioSemanaPassada.getDate() + 6);
        return { inicio: inicioSemanaPassada, fim: fimSemanaPassada };
      case 'este_mes':
        return { inicio: inicioMes, fim: fimMes };
      case 'mes_passado':
        const inicioMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        return { inicio: inicioMesPassado, fim: fimMesPassado };
      case 'ultimos_3_meses':
        const inicio3Meses = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
        return { inicio: inicio3Meses, fim: fimMes };
      case 'este_ano':
        const inicioAno = new Date(hoje.getFullYear(), 0, 1);
        const fimAno = new Date(hoje.getFullYear(), 11, 31);
        return { inicio: inicioAno, fim: fimAno };
      case 'ano_passado':
        const inicioAnoPassado = new Date(hoje.getFullYear() - 1, 0, 1);
        const fimAnoPassado = new Date(hoje.getFullYear() - 1, 11, 31);
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
          const data = new Date(entrada.data_vencimento);
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
          const data = new Date(entrada.data_vencimento);
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
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      resultado = resultado.filter(entrada => {
        const data = new Date(entrada.data_vencimento);
        return data >= inicio && data <= fim;
      });
    } else {
      const rangeDatas = obterRangeDatas(filtroRapido);
      if (rangeDatas) {
        resultado = resultado.filter(entrada => {
          const data = new Date(entrada.data_vencimento);
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
      label: 'Ações',
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receitas ({estatisticas.periodo})
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {estatisticas.receitas.toFixed(2)}</div>
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
            <div className="text-2xl font-bold text-red-600">R$ {estatisticas.despesas.toFixed(2)}</div>
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
            <div className={`text-2xl font-bold ${estatisticas.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {estatisticas.saldo.toFixed(2)}
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
            <div className="text-2xl font-bold text-yellow-600">R$ {estatisticas.aReceber.toFixed(2)}</div>
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
            <div className="text-2xl font-bold text-orange-600">R$ {estatisticas.aPagar.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Despesas pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filtros de Movimentação</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros Rápidos */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Período Rápido:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { key: 'hoje', label: 'Hoje' },
                  { key: 'ontem', label: 'Ontem' },
                  { key: 'esta_semana', label: 'Esta Semana' },
                  { key: 'mes_passado', label: 'Mês Passado' },
                  { key: 'este_mes', label: 'Este Mês' },
                  { key: 'ultimos_3_meses', label: 'Últimos 3 Meses' },
                  { key: 'este_ano', label: 'Este Ano' },
                  { key: 'todos', label: 'Todos' }
                ].map((filtro) => (
                  <Button
                    key={filtro.key}
                    variant={filtroRapido === filtro.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFiltroRapido(filtro.key as FiltroRapido)}
                  >
                    {filtro.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtros Avançados - Expandível */}
            {mostrarFiltros && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <Label htmlFor="data-inicio">Data Início:</Label>
                  <Input
                    id="data-inicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="data-fim">Data Fim:</Label>
                  <Input
                    id="data-fim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="filtro-tipo">Tipo:</Label>
                  <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="receita">Receitas</SelectItem>
                      <SelectItem value="despesa">Despesas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filtro-status">Status:</Label>
                  <Select value={filtroStatus} onValueChange={(value: any) => setFiltroStatus(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Botões de ação dos filtros */}
            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={limparFiltros}>
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
              <div className="text-sm text-gray-500">
                {entradasFiltradas.length} entrada(s) encontrada(s)
              </div>
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
            <SortableTable
              data={entradasFiltradas}
              columns={columns}
              keyExtractor={(entrada) => entrada.id!}
              emptyMessage="Nenhuma movimentação encontrada para os filtros selecionados"
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
