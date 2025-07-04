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
import { OSDeleteConfirmationModal } from '@/components/modals/OSDeleteConfirmationModal';
import { FinancialStatusBadge } from '@/components/FinancialStatusBadge';
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
  const { ordens, loading, createOrdem, updateOrdem, deleteOrdem, getProtectionStatus } = useOrdens();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrdem, setSelectedOrdem] = useState<OrdemServico | undefined>();
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ordem: OrdemServico | null;
    loading: boolean;
    hasFinancialEntry: boolean;
    financialEntries: any[];
  }>({
    isOpen: false,
    ordem: null,
    loading: false,
    hasFinancialEntry: false,
    financialEntries: []
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
        console.log('💾 Ordens: Iniciando atualização da OS', selectedOrdem.id);
        console.log('📝 Ordens: Dados sendo enviados:', {
          produtos_utilizados: data.produtos_utilizados?.length || 0,
          produtos_detalhes: data.produtos_utilizados
        });
        
        const ordemAtualizada = await updateOrdem(selectedOrdem.id!, data);
        console.log('✅ Ordens: OS atualizada retornada:', {
          id: ordemAtualizada?.id,
          produtos_utilizados: ordemAtualizada?.produtos_utilizados?.length || 0,
          produtos_detalhes: ordemAtualizada?.produtos_utilizados
        });
        
        toast.success('Ordem atualizada com sucesso!');
        
        // Invalidar cache para recarregar dados atualizados
        console.log('🔄 Ordens: Invalidando cache das ordens');
        queryClient.invalidateQueries({ queryKey: ['/api/ordens'] });
        
        // Se existe uma ordem sendo visualizada e é a mesma que foi editada, 
        // simplesmente fechar o modal para que seja reaberto com dados atualizados
        if (ordemParaVisualizacao && ordemParaVisualizacao.id === selectedOrdem.id) {
          console.log('👁️ Ordens: Fechando modal de visualização para reabrir com dados atualizados');
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

  const handleDeleteClick = async (ordem: OrdemServico) => {
    try {
      // Usar novo endpoint de status de proteção
      const protectionData = await getProtectionStatus(ordem.id);
      
      const financialEntries = protectionData.linked_entries || [];

      setDeleteModal({
        isOpen: true,
        ordem,
        loading: false,
        hasFinancialEntry: protectionData.protection.is_protected,
        financialEntries
      });
    } catch (error) {
      console.error('Erro ao verificar proteção:', error);
      // Fallback para modal simples em caso de erro
      setDeleteModal({
        isOpen: true,
        ordem,
        loading: false,
        hasFinancialEntry: false,
        financialEntries: []
      });
    }
  };

  const closeDeleteModal = () => {
    if (deleteModal.loading) return;
    setDeleteModal({
      isOpen: false,
      ordem: null,
      loading: false,
      hasFinancialEntry: false,
      financialEntries: []
    });
  };





  const handleOSDeleteConfirm = async (action: 'delete-all' | 'unlink-keep' | 'cancel') => {
    if (!deleteModal.ordem || action === 'cancel') {
      closeDeleteModal();
      return;
    }

    setDeleteModal(prev => ({ ...prev, loading: true }));

    try {
      if (action === 'delete-all') {
        if (deleteModal.hasFinancialEntry) {
          // Excluir OS e entradas financeiras
          await fetch(`/api/ordens/${deleteModal.ordem.id}?force=true&action=delete_financial`, {
            method: 'DELETE',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          toast.success('Ordem e entradas financeiras excluídas com sucesso!');
        } else {
          // Exclusão simples sem vínculos
          await deleteOrdem(deleteModal.ordem.id!);
          toast.success('Ordem excluída com sucesso!');
        }
      } else if (action === 'unlink-keep') {
        // Excluir OS mas manter entradas financeiras
        await fetch(`/api/ordens/${deleteModal.ordem.id}?force=true&action=keep_financial`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        toast.success('Ordem excluída, entradas financeiras mantidas e desvinculadas');
      }

      closeDeleteModal();
      // Invalidar cache para atualizar dados
      queryClient.invalidateQueries({ queryKey: ['/api/ordens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financeiro'] });
      
    } catch (error: any) {
      console.error('Error deleting ordem:', error);
      toast.error('Erro ao processar exclusão da ordem');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleNewOrdem = () => {
    navigate('/ordens/nova');
  };

  const handleVisualizarOrdem = (ordem: OrdemServico) => {
    console.log('👁️ Ordens: Abrindo visualização da OS', {
      id: ordem.id,
      produtos_utilizados: (ordem as any).produtos_utilizados?.length || 0,
      produtos_detalhes: (ordem as any).produtos_utilizados
    });
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
        <div className="flex flex-col gap-1">
          <StatusQuickSelector 
            ordemId={ordem.id} 
            currentStatus={ordem.status}
            size="sm"
            valorTotal={parseFloat(ordem.valor_total || '0')}
          />
          <FinancialStatusBadge 
            ordemId={ordem.id}
            status={ordem.status}
            size="sm"
          />
        </div>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="text-gray-600 text-sm sm:text-base hidden sm:block">
            Gerencie suas ordens de serviço e acompanhe o progresso dos reparos
          </p>
        </div>
        {/* Botão desktop */}
        <Button onClick={handleNewOrdem} className="hidden sm:flex items-center bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Nova Ordem
        </Button>
      </div>

      {/* Botão Flutuante Mobile (FAB) */}
      <Button 
        onClick={handleNewOrdem} 
        className="sm:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

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

      {/* Cards de Estatísticas - Responsivos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Em Análise
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl sm:text-2xl font-bold">{stats.aberta}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Em Reparo
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl sm:text-2xl font-bold">{stats.em_andamento}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Prontas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl sm:text-2xl font-bold">{stats.pronta}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Total
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
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
          // Delay clearing selectedOrdem to allow modal animation
          setTimeout(() => setSelectedOrdem(undefined), 200);
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

      {/* Modal de Confirmação de Exclusão Inteligente */}
      <OSDeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleOSDeleteConfirm}
        ordem={deleteModal.ordem ? {
          numero: deleteModal.ordem.numero,
          status: deleteModal.ordem.status,
          valor_total: parseFloat(deleteModal.ordem.valor_total || '0')
        } : null}
        hasFinancialEntry={deleteModal.hasFinancialEntry}
        financialEntries={deleteModal.financialEntries}
        loading={deleteModal.loading}
      />
    </div>
  );
};