
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { useOrdens, OrdemServico } from '@/hooks/useOrdens';
import { OrdemServicoModal } from '@/components/modals/OrdemServicoModal';
import { SortableTable, Column } from '@/components/ui/sortable-table';
import { Badge } from '@/components/ui/badge';
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
  const { ordens, loading, createOrdem, updateOrdem } = useOrdens();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrdem, setSelectedOrdem] = useState<OrdemServico | undefined>();
  const [modalLoading, setModalLoading] = useState(false);

  // Calcular estatísticas
  const stats = {
    aguardando_diagnostico: ordens.filter(o => o.status === 'aguardando_diagnostico').length,
    em_reparo: ordens.filter(o => ['aguardando_aprovacao', 'aguardando_pecas', 'em_reparo'].includes(o.status)).length,
    pronto_entrega: ordens.filter(o => o.status === 'pronto_entrega').length,
    total: ordens.length
  };

  const handleSubmit = async (data: Omit<OrdemServico, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setModalLoading(true);
      if (selectedOrdem) {
        await updateOrdem(selectedOrdem.id!, data);
        toast.success('Ordem atualizada com sucesso!');
      } else {
        await createOrdem(data);
        toast.success('Ordem criada com sucesso!');
      }
      setModalOpen(false);
      setSelectedOrdem(undefined);
    } catch (error) {
      toast.error('Erro ao salvar ordem');
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = (ordem: OrdemServico) => {
    setSelectedOrdem(ordem);
    setModalOpen(true);
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
      render: (ordem) => `R$ ${(ordem.valor_final || 0).toFixed(2)}`
    },
    {
      key: 'data_abertura',
      label: 'Data Abertura',
      sortable: true,
      render: (ordem) => new Date(ordem.data_abertura).toLocaleDateString('pt-BR')
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
          >
            <Edit className="h-4 w-4" />
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

      {/* Cards de Status */}
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

      {/* Tabela de Ordens */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">Carregando...</div>
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
    </div>
  );
};
