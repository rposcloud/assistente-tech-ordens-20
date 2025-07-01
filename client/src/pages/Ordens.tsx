import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Edit, Trash2, Eye, MoreHorizontal, CheckSquare, Search } from 'lucide-react';
import { useOrdens } from '@/hooks/useOrdens';
import { OrdemServico } from '@/types';
import { OrdemServicoModal } from '@/components/modals/OrdemServicoModal';
import { VisualizacaoOSModal } from '@/components/modals/VisualizacaoOSModal';


import { SortableTable, Column } from '@/components/ui/sortable-table';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { toast } from 'sonner';

const statusColors = {
  aguardando_diagnostico: 'bg-yellow-100 text-yellow-800',
  aguardando_aprovacao: 'bg-blue-100 text-blue-800',
  aguardando_pecas: 'bg-orange-100 text-orange-800',
  em_reparo: 'bg-purple-100 text-purple-800',
  pronto_entrega: 'bg-green-100 text-green-800',
  entregue: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  aguardando_diagnostico: 'Aguardando Diagnóstico',
  aguardando_aprovacao: 'Aguardando Aprovação',
  aguardando_pecas: 'Aguardando Peças',
  em_reparo: 'Em Reparo',
  pronto_entrega: 'Pronto p/ Entrega',
  entregue: 'Entregue'
};

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

  const handleFinalizarOS = async (ordem: OrdemServico) => {
    if (ordem.status === 'entregue') {
      toast.warning('Esta OS já foi finalizada');
      return;
    }

    try {
      // Confirmar com o usuário
      const confirmado = window.confirm(
        `Deseja finalizar a OS #${ordem.numero}?\n\n` +
        `Isso irá:\n` +
        `• Alterar o status para "Entregue"\n` +
        `• Criar entrada financeira de receita\n` +
        `• Proteger a OS contra alterações futuras\n\n` +
        `Valor da OS: R$ ${(parseFloat(ordem.valor_total || '0')).toFixed(2)}`
      );

      if (!confirmado) return;

      // Atualizar OS para status entregue
      await updateOrdem(ordem.id!, {
        ...ordem,
        status: 'entregue',
        data_conclusao: new Date().toISOString()
      });

      toast.success(`OS #${ordem.numero} finalizada com sucesso!`);
      
    } catch (error: any) {
      console.error('Erro ao finalizar OS:', error);
      toast.error(`Erro ao finalizar OS: ${error.message || 'Erro desconhecido'}`);
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
        <Badge className={statusColors[ordem.status]}>
          {statusLabels[ordem.status]}
        </Badge>
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
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleVisualizarOrdem(ordem);
            }}
            title="Visualizar OS"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(ordem);
            }}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          {ordem.status !== 'entregue' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleFinalizarOS(ordem);
              }}
              title="Finalizar OS"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(ordem);
            }}
            title="Excluir"
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
