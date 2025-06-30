import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { useOrdens } from '@/hooks/useOrdens';
import { OrdemServico } from '@/types';
import { OrdemServicoModal } from '@/components/modals/OrdemServicoModal';

import { SortableTable, Column } from '@/components/ui/sortable-table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ordemToDelete, setOrdemToDelete] = useState<OrdemServico | null>(null);


  console.log('Ordens disponíveis:', ordens.length);
  console.log('Loading:', loading);

  const stats = {
    aguardando_diagnostico: ordens.filter(o => o.status === 'aguardando_diagnostico').length,
    em_reparo: ordens.filter(o => ['aguardando_aprovacao', 'aguardando_pecas', 'em_reparo'].includes(o.status)).length,
    pronto_entrega: ordens.filter(o => o.status === 'pronto_entrega').length,
    total: ordens.length
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
    setOrdemToDelete(ordem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ordemToDelete) return;
    
    try {
      await deleteOrdem(ordemToDelete.id!);
      toast.success('Ordem excluída com sucesso!');
      setDeleteDialogOpen(false);
      setOrdemToDelete(null);
    } catch (error: any) {
      console.error('Error deleting ordem:', error);
      toast.error(`Erro ao excluir ordem: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleNewOrdem = () => {
    setSelectedOrdem(undefined);
    setModalOpen(true);
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
              handleEdit(ordem);
            }}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Em Análise
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aguardando_diagnostico}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Em Reparo
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.em_reparo}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Prontas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pronto_entrega}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
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
              data={ordens}
              columns={columns}
              keyExtractor={(ordem) => ordem.id!}
              emptyMessage="Nenhuma ordem de serviço encontrada"
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



      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a ordem de serviço {ordemToDelete?.numero}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrdemToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
