
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OrdemServicoFormNovo } from '@/components/forms/OrdemServicoFormNovo';
import { OrdemServico } from '@/types';

interface OrdemServicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<OrdemServico, 'id' | 'created_at' | 'updated_at'>) => void;
  initialData?: OrdemServico;
  loading?: boolean;
}

export const OrdemServicoModal: React.FC<OrdemServicoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false
}) => {
  console.log('📋 Modal: Renderizando com initialData:', {
    hasData: !!initialData,
    isOpen,
    loading,
    produtos_utilizados: initialData?.produtos_utilizados?.length || 0,
    pecas_utilizadas: initialData?.pecas_utilizadas?.length || 0
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
          </DialogTitle>
        </DialogHeader>
        <OrdemServicoFormNovo
          onSubmit={onSubmit}
          onCancel={onClose}
          initialData={initialData}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};
