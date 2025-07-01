import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Edit, Trash2, Eye, MoreHorizontal, CheckSquare, Search, ChevronDown } from 'lucide-react';
import { useOrdens } from '@/hooks/useOrdens';
import { OrdemServico } from '@/types';
import { OrdemServicoModal } from '@/components/modals/OrdemServicoModal';
import { VisualizacaoOSModal } from '@/components/modals/VisualizacaoOSModal';
import { PagamentoOSModal } from '@/components/modals/PagamentoOSModal';


import { SortableTable, Column } from '@/components/ui/sortable-table';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const statusColors = {
  aberta: 'bg-blue-100 text-blue-800',
  em_andamento: 'bg-yellow-100 text-yellow-800',
  aguardando_pecas: 'bg-orange-100 text-orange-800',
  pronta: 'bg-green-100 text-green-800',
  finalizada: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  aberta: 'Aberta',
  em_andamento: 'Em Andamento',
  aguardando_pecas: 'Aguardando Peças',
  pronta: 'Pronta',
  finalizada: 'Finalizada'
};

const statusOptions = [
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'aguardando_pecas', label: 'Aguardando Peças' },
  { value: 'pronta', label: 'Pronta' }
];

export const Ordens = () => {
  const { ordens, loading, createOrdem, updateOrdem, deleteOrdem } = useOrdens();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrdem, setSelectedOrdem] = useState<OrdemServico | undefined>();
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ordem: OrdemServico | null;
    loading: boolean;
  }>({
    isOpen: false,
    ordem: null,
    loading: false
  });
  const [visualizacaoModalOpen, setVisualizacaoModalOpen] = useState(false);
  const [ordemParaVisualizacao, setOrdemParaVisualizacao] = useState<OrdemServico | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Estados para modal de pagamento
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);
  const [ordemParaPagamento, setOrdemParaPagamento] = useState<OrdemServico | null>(null);
  const [loadingPagamento, setLoadingPagamento] = useState(false);



  console.log('Ordens disponíveis:', ordens.length);
  console.log('Loading:', loading);

  // Filtrar ordens baseado na busca
  const filteredOrdens = ordens.filter(ordem => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      ordem.numero?.toLowerCase().includes(searchLower) ||
      ordem.equipamento?.toLowerCase().includes(searchLower) ||
      ordem.marca?.toLowerCase().includes(searchLower) ||
      ordem.modelo?.toLowerCase().includes(searchLower) ||
      ordem.problema?.toLowerCase().includes(searchLower) ||
      ordem.cliente?.nome?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    aguardando_diagnostico: filteredOrdens.filter(o => o.status === 'aguardando_diagnostico').length,
    em_reparo: filteredOrdens.filter(o => ['aguardando_aprovacao', 'aguardando_pecas', 'em_reparo'].includes(o.status)).length,
    pronto_entrega: filteredOrdens.filter(o => o.status === 'pronto_entrega').length,
    total: filteredOrdens.length
  };

  const handleSubmit = async (data: any) => {
    try {
      setModalLoading(true);
      
      console.log('Submetendo dados:', data);
      
      if (selectedOrdem) {
        await updateOrdem(selectedOrdem.id!, data);
        toast.success('Ordem atualizada com sucesso!');
      } else {
        await createOrdem(data);
        toast.success('Ordem criada com sucesso!');
      }
      
      setModalOpen(false);
      setSelectedOrdem(undefined);
    } catch (error: any) {
      console.error('Erro ao salvar ordem:', error);
      toast.error(`Erro ao salvar ordem: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = (ordem: OrdemServico) => {
    console.log('Editando ordem:', ordem);
    setSelectedOrdem(ordem);
    setModalOpen(true);
  };

  const handleDeleteClick = (ordem: OrdemServico) => {
    setDeleteModal({
      isOpen: true,
      ordem,
      loading: false
    });
  };

  const closeDeleteModal = () => {
    if (deleteModal.loading) return;
    setDeleteModal({
      isOpen: false,
      ordem: null,
      loading: false
    });
  };



  const confirmDelete = async () => {
    if (!deleteModal.ordem) return;

    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      await deleteOrdem(deleteModal.ordem.id!);
      toast.success('Ordem excluída com sucesso!');
      setDeleteModal({
        isOpen: false,
        ordem: null,
        loading: false
      });
    } catch (error: any) {
      console.error('Error deleting ordem:', error);
      
      // Verificar se é erro de vínculo financeiro
      if (error.response?.status === 400 && error.response?.data?.entradas_vinculadas) {
        const errorData = error.response.data;
        toast.error(
          `${errorData.error}\n\n` +
          `Entradas vinculadas: ${errorData.entradas_vinculadas}\n` +
          `${errorData.detalhes}`,
          { duration: 8000 }
        );
        
        // Mostrar opções para o usuário
        if (window.confirm(
          `Esta OS possui ${errorData.entradas_vinculadas} entrada(s) financeira(s) vinculada(s).\n\n` +
          `Deseja:\n` +
          `✓ EXCLUIR também as entradas financeiras?\n` +
          `✗ MANTER as entradas e apenas desvincular da OS?\n\n` +
          `Clique OK para EXCLUIR ou Cancelar para MANTER`
        )) {
          // Excluir entradas financeiras junto
          try {
            await fetch(`/api/ordens/${deleteModal.ordem.id}?force=true&action=delete_financial`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            });
            toast.success('Ordem e entradas financeiras excluídas com sucesso!');
            setDeleteModal({
              isOpen: false,
              ordem: null,
              loading: false
            });
            // Recarregar dados
            window.location.reload();
          } catch (forceError) {
            toast.error('Erro ao excluir forçadamente');
            setDeleteModal(prev => ({ ...prev, loading: false }));
          }
        } else {
          // Manter entradas, apenas desvincular
          try {
            await fetch(`/api/ordens/${deleteModal.ordem.id}?force=true&action=keep_financial`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            });
            toast.success('Ordem excluída, entradas financeiras mantidas e desvinculadas');
            setDeleteModal({
              isOpen: false,
              ordem: null,
              loading: false
            });
            // Recarregar dados
            window.location.reload();
          } catch (forceError) {
            toast.error('Erro ao desvincular entradas');
            setDeleteModal(prev => ({ ...prev, loading: false }));
          }
        }
      } else {
        toast.error(`Erro ao excluir ordem: ${error.message || 'Erro desconhecido'}`);
        setDeleteModal(prev => ({ ...prev, loading: false }));
      }
    }
  };

  const handleNewOrdem = () => {
    setSelectedOrdem(undefined);
    setModalOpen(true);
  };

  const handleVisualizarOrdem = (ordem: OrdemServico) => {
    setOrdemParaVisualizacao(ordem);
    setVisualizacaoModalOpen(true);
  };



  const handleChangeStatus = async (ordem: OrdemServico, newStatus: string) => {
    try {
      await updateOrdem(ordem.id!, {
        ...ordem,
        status: newStatus
      });
      
      // Lógica simplificada: não abrir modal automaticamente na mudança de status
      
      toast.success(`Status alterado para: ${statusLabels[newStatus as keyof typeof statusLabels]}`);
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  // Função para abrir modal de finalização/pagamento
  const handleFinalizarOS = async (ordem: OrdemServico) => {
    try {
      // Buscar dados completos da OS
      const response = await fetch(`/api/ordens/${ordem.id}/print`);
      const dadosCompletos = await response.json();
      
      setOrdemParaPagamento(dadosCompletos);
      setPagamentoModalOpen(true);
    } catch (error) {
      console.error('Erro ao buscar dados da OS:', error);
      toast.error('Erro ao carregar dados da OS');
    }
  };

  // Função para confirmar pagamento e finalizar OS
  const handleConfirmarPagamento = async (dadosPagamento: any) => {
    if (!ordemParaPagamento) return;
    
    setLoadingPagamento(true);
    try {
      // 1. Atualizar OS para status "finalizada" com dados de pagamento
      await updateOrdem(ordemParaPagamento.id, {
        ...ordemParaPagamento,
        status: 'finalizada',
        forma_pagamento: dadosPagamento.forma_pagamento,
        status_pagamento: dadosPagamento.status_pagamento,
        data_pagamento: dadosPagamento.data_pagamento,
        observacoes_pagamento: dadosPagamento.observacoes_pagamento
      });

      // 2. Criar entrada financeira
      const valorTotal = parseFloat(ordemParaPagamento.valor_final || ordemParaPagamento.valor_total || '0');
      const cliente = ordemParaPagamento.cliente || null;

      await fetch('/api/financeiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao: `OS #${ordemParaPagamento.numero} - ${cliente?.nome || 'Cliente'}`,
          valor: valorTotal,
          tipo: 'receita',
          data_vencimento: dadosPagamento.data_pagamento,
          forma_pagamento: dadosPagamento.forma_pagamento,
          status_pagamento: dadosPagamento.status_pagamento,
          observacoes: dadosPagamento.observacoes_pagamento || `Finalização OS - ${ordemParaPagamento.tipo_equipamento} ${ordemParaPagamento.marca} ${ordemParaPagamento.modelo}`.trim(),
          ordem_servico_id: ordemParaPagamento.id
        })
      });

      toast.success('OS finalizada e entrada financeira criada com sucesso!');
      setPagamentoModalOpen(false);
      setOrdemParaPagamento(null);
    } catch (error) {
      console.error('Erro ao finalizar OS:', error);
      toast.error('Erro ao finalizar OS');
    } finally {
      setLoadingPagamento(false);
    }
  };



  const columns: Column<OrdemServico>[] = [
    {
      key: 'numero',
      label: 'Número',
      sortable: true
    },
    {
      key: 'clientes.nome',
      label: 'Cliente',
      sortable: true,
      render: (ordem: any) => ordem.clientes?.nome || 'N/A'
    },
    {
      key: 'tipo_equipamento',
      label: 'Equipamento',
      sortable: true,
      render: (ordem) => `${ordem.marca} ${ordem.modelo}`
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (ordem) => ordem.status === 'finalizada' ? (
        <Badge className={statusColors[ordem.status]}>
          {statusLabels[ordem.status]}
        </Badge>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span className="text-sm cursor-pointer hover:underline">
              {statusLabels[ordem.status] || 'Aberta'}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            {statusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  if (option.value !== ordem.status) {
                    handleChangeStatus(ordem, option.value);
                  }
                }}
                className={`${ordem.status === option.value ? 'bg-gray-100 font-medium' : ''} cursor-pointer`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusColors[option.value]?.split(' ')[0] || 'bg-gray-400'}`} />
                  {option.label}
                  {ordem.status === option.value && (
                    <span className="ml-auto text-xs text-gray-500">(atual)</span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    {
      key: 'valor_final',
      label: 'Valor',
      sortable: true,
      render: (ordem) => {
        const valor = ordem.valor_final || ordem.valor_total || '0';
        const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;
        return `R$ ${(valorNumerico || 0).toFixed(2)}`;
      }
    },
    {
      key: 'data_abertura',
      label: 'Data Abertura',
      sortable: true,
      render: (ordem) => ordem.data_abertura ? new Date(ordem.data_abertura).toLocaleDateString('pt-BR') : 'N/A'
    },
    {
      key: 'actions',
      label: 'Ações',
      sortable: false,
      render: (ordem) => (
        <div className="flex items-center gap-2">
          {ordem.status !== 'finalizada' && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFinalizarOS(ordem);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Finalizar
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleVisualizarOrdem(ordem);
                }}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(ordem);
                }}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(ordem);
                }}
                className="flex items-center gap-2 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas ordens de serviço e acompanhe o progresso dos reparos
          </p>
        </div>
        <Button onClick={handleNewOrdem} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Nova Ordem
        </Button>
      </div>

      {/* Busca simples e compacta */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por número, cliente, equipamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="h-9 px-2"
          >
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-gray-600">
              Em Análise
            </CardTitle>
            <Clock className="h-3 w-3 text-yellow-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg font-bold">{stats.aguardando_diagnostico}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-gray-600">
              Em Reparo
            </CardTitle>
            <AlertCircle className="h-3 w-3 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg font-bold">{stats.em_reparo}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-gray-600">
              Prontas
            </CardTitle>
            <CheckCircle className="h-3 w-3 text-green-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg font-bold">{stats.pronto_entrega}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-gray-600">
              Total
            </CardTitle>
            <FileText className="h-3 w-3 text-gray-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-lg font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens ({ordens.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">Carregando ordens...</div>
          ) : ordens.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma ordem de serviço encontrada</p>
              <Button onClick={handleNewOrdem} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira ordem
              </Button>
            </div>
          ) : (
            <SortableTable
              data={filteredOrdens}
              columns={columns}
              keyExtractor={(ordem) => ordem.id!}
              emptyMessage={searchTerm ? `Nenhuma ordem encontrada para "${searchTerm}"` : "Nenhuma ordem de serviço encontrada"}
              emptyIcon={<FileText className="h-16 w-16 text-gray-300 mb-4" />}
            />
          )}
        </CardContent>
      </Card>

      <OrdemServicoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedOrdem(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={selectedOrdem}
        loading={modalLoading}
      />

      <VisualizacaoOSModal
        isOpen={visualizacaoModalOpen}
        onClose={() => {
          setVisualizacaoModalOpen(false);
          setOrdemParaVisualizacao(null);
        }}
        ordem={ordemParaVisualizacao}
      />

      {/* Modal de Pagamento */}
      <PagamentoOSModal
        isOpen={pagamentoModalOpen}
        onClose={() => {
          setPagamentoModalOpen(false);
          setOrdemParaPagamento(null);
        }}
        ordem={ordemParaPagamento}
        onConfirm={handleConfirmarPagamento}
        loading={loadingPagamento}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Excluir Ordem de Serviço"
        message={`Tem certeza que deseja excluir a ordem de serviço "${deleteModal.ordem?.numero}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        loading={deleteModal.loading}
      />
    </div>
  );
};
