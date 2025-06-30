
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EntradaFinanceiraForm } from '@/components/forms/EntradaFinanceiraForm';
import { EntradaFinanceira, CategoriaFinanceira } from '@/hooks/useFinanceiro';

interface EntradaFinanceiraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<EntradaFinanceira, 'id' | 'created_at' | 'updated_at'>) => void;
  categorias: CategoriaFinanceira[];
  initialData?: EntradaFinanceira;
  loading?: boolean;
}

export const EntradaFinanceiraModal: React.FC<EntradaFinanceiraModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categorias,
  initialData,
  loading = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Entrada Financeira' : 'Nova Entrada Financeira'}
          </DialogTitle>
        </DialogHeader>
        <EntradaFinanceiraForm
          onSubmit={onSubmit}
          onCancel={onClose}
          categorias={categorias}
          initialData={initialData}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};
