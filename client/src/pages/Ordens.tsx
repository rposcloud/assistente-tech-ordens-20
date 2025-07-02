import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Edit, Trash2, Eye, MoreHorizontal, CheckSquare, Search, ChevronDown } from 'lucide-react';
import { useOrdens } from '@/hooks/useOrdens';
import { OrdemServico } from '@/types';
import { OrdemServicoModal } from '@/components/modals/OrdemServicoModal';
import { VisualizacaoOSModal } from '@/components/modals/VisualizacaoOSModal';
import { PagamentoOSModal } from '@/components/modals/PagamentoOSModal';
import StatusQuickSelector from '@/components/StatusQuickSelector';


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
import { useQueryClient } from '@tanstack/react-query';

const statusColors: Record<string, string> = {
  aberta: 'bg-blue-100 text-blue-800',
  em_andamento: 'bg-yellow-100 text-yellow-800',
  aguardando_pecas: 'bg-orange-100 text-orange-800',
  pronta: 'bg-green-100 text-green-800',
  finalizada: 'bg-gray-100 text-gray-800'
};

const statusLabels: Record<string, string> = {
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
    aberta: filteredOrdens.filter(o => o.status === 'aberta').length,
    em_andamento: filteredOrdens.filter(o => ['em_andamento', 'aguardando_pecas'].includes(o.status)).length,
    pronta: filteredOrdens.filter(o => o.status === 'pronta').length,
    total: filteredOrdens.length
  };

  const handleSubmit = async (data: any) => {
    try {
      setModalLoading(true);

      console.log('Submetendo dados:', data);

      if (selectedOrdem) {
        await updateOrdem(selectedOrdem.id!, data);
        toast.success('Ordem atualizada com sucesso!');
        
        // Invalidar cache para recarregar dados atualizados
        queryClient.invalidateQueries({ queryKey: ['/api/ordens'] });
        
        // Se existe uma ordem sendo visualizada e é a mesma que foi editada, 
        // simplesmente fechar o modal para que seja reaberto com dados atualizados
        if (ordemParaVisualizacao && ordemParaVisualizacao.id === selectedOrdem.id) {
          setVisualizacaoModalOpen(false);
          setOrdemParaVisualizacao(null);
          toast.success('Para ver as alterações, clique em "Visualizar" novamente');
        }
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
    navigate('/ordens/nova');
  };

  const handleVisualizarOrdem = (ordem: OrdemServico) => {
    setOrdemParaVisualizacao(ordem);
    setVisualizacaoModalOpen(true);
  };





  // Função para abrir modal de finalização/pagamento
  const handleFinalizarOS = async (ordem: OrdemServico) => {
    try {
      console.log('Abrindo modal para ordem:', ordem);
      setOrdemParaPagamento(ordem);
      setPagamentoModalOpen(true);
    } catch (error) {
      console.error('Erro ao abrir modal:', error);
      toast.error('Erro ao abrir modal de pagamento');
    }
  };

  // Função para confirmar pagamento e finalizar OS
  const handleConfirmarPagamento = async (dadosPagamento: any) => {
    if (!ordemParaPagamento || !ordemParaPagamento.id) {
      toast.error('Erro: ID da ordem não encontrado');
      return;
    }

    setLoadingPagamento(true);
    try {
      console.log('Finalizando OS com ID:', ordemParaPagamento.id);

      // Atualizar OS para status "finalizada" - a entrada financeira será criada automaticamente pelo backend
      await updateOrdem(ordemParaPagamento.id, {
        status: 'finalizada'
      });

      toast.success('OS finalizada com sucesso!');
      setPagamentoModalOpen(false);
      setOrdemParaPagamento(null);
    } catch (error: any) {
      console.error('Erro ao finalizar OS:', error);
      toast.error(error.message || 'Erro ao finalizar OS');
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
      render: (ordem) => (
        <StatusQuickSelector 
          ordemId={ordem.id} 
          currentStatus={ordem.status}
          size="sm"
        />
      )
    },
    {
      key: 'valor_total',
      label: 'Valor',
      sortable: true,
      render: (ordem) => {
        const valor = ordem.valor_total || '0';
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
        <Button onClick={handleNewOrdem} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white">
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
            <div className="text-lg font-bold">{stats.aberta}</div>
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
            <div className="text-lg font-bold">{stats.em_andamento}</div>
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
            <div className="text-lg font-bold">{stats.pronta}</div>
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
              <Button onClick={handleNewOrdem} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira ordem
              </Button>
            </div>
          ) : (
            <>
              {/* Versão Desktop - Tabela */}
              <div className="hidden lg:block">
                <SortableTable
                  data={filteredOrdens}
                  columns={columns}
                  keyExtractor={(ordem) => ordem.id!}
                  emptyMessage={searchTerm ? `Nenhuma ordem encontrada para "${searchTerm}"` : "Nenhuma ordem de serviço encontrada"}
                  emptyIcon={<FileText className="h-16 w-16 text-gray-300 mb-4" />}
                />
              </div>

              {/* Versão Mobile/Tablet - Cards */}
              <div className="lg:hidden space-y-4">
                {filteredOrdens.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm ? `Nenhuma ordem encontrada para "${searchTerm}"` : "Nenhuma ordem de serviço encontrada"}
                    </p>
                  </div>
                ) : (
                  filteredOrdens.map((ordem: any) => (
                    <div key={ordem.id} className="bg-white border rounded-lg p-4 shadow-sm">
                      {/* Header do Card */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-lg">#{ordem.numero}</div>
                          <div className="text-gray-600 text-sm">{ordem.clientes?.nome || 'Cliente não encontrado'}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {ordem.marca} {ordem.modelo}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {ordem.status !== 'finalizada' && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFinalizarOS(ordem);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-auto"
                            >
                              Finalizar
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
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
                      </div>

                      {/* Conteúdo do Card */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500 text-xs">Status</div>
                          <StatusQuickSelector 
                            ordemId={ordem.id} 
                            currentStatus={ordem.status}
                            size="md"
                          />
                        </div>

                        <div>
                          <div className="text-gray-500 text-xs">Valor</div>
                          <div className="font-semibold text-green-600">
                            R$ {(parseFloat(ordem.valor_total || '0')).toFixed(2).replace('.', ',')}
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-500 text-xs">Data Abertura</div>
                          <div>{ordem.data_abertura ? new Date(ordem.data_abertura).toLocaleDateString('pt-BR') : 'N/A'}</div>
                        </div>

                        <div>
                          <div className="text-gray-500 text-xs">Equipamento</div>
                          <div className="capitalize">{ordem.tipo_equipamento}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
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