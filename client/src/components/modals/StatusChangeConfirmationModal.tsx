import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, Trash2, FileX } from 'lucide-react';

interface StatusChangeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: 'keep' | 'delete' | 'pending') => void;
  currentStatus: string;
  newStatus: string;
  hasFinancialEntry: boolean;
  financialValue?: number;
  loading?: boolean;
}

const statusLabels = {
  aberta: 'Aberta',
  em_andamento: 'Em Andamento', 
  aguardando_pecas: 'Aguardando Peças',
  pronta: 'Pronta',
  finalizada: 'Finalizada'
};

export const StatusChangeConfirmationModal: React.FC<StatusChangeConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  newStatus,
  hasFinancialEntry,
  financialValue = 0,
  loading = false
}) => {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isRevertingFromFinalized = currentStatus === 'finalizada' && newStatus !== 'finalizada';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alterar Status da OS
          </DialogTitle>
          <DialogDescription>
            Alterando de <Badge variant="outline">{statusLabels[currentStatus as keyof typeof statusLabels]}</Badge> para <Badge variant="outline">{statusLabels[newStatus as keyof typeof statusLabels]}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isRevertingFromFinalized && hasFinancialEntry && (
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                Esta ordem possui entrada financeira de <strong>{formatCurrency(financialValue)}</strong> vinculada.
                <br />
                <span className="text-sm text-gray-600 mt-1 block">
                  Escolha como proceder com a entrada financeira:
                </span>
              </AlertDescription>
            </Alert>
          )}

          {!isRevertingFromFinalized && (
            <Alert>
              <AlertDescription>
                Tem certeza que deseja alterar o status desta ordem de serviço?
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {isRevertingFromFinalized && hasFinancialEntry ? (
              <>
                <Button
                  onClick={() => onConfirm('keep')}
                  disabled={loading}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                  Manter entrada financeira (Recomendado)
                </Button>
                
                <Button
                  onClick={() => onConfirm('pending')}
                  disabled={loading}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileX className="h-4 w-4 mr-2 text-yellow-600" />
                  Marcar como "Pagamento Pendente"
                </Button>
                
                <Button
                  onClick={() => onConfirm('delete')}
                  disabled={loading}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                  Excluir entrada financeira
                </Button>
              </>
            ) : (
              <Button
                onClick={() => onConfirm('keep')}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Alterando...' : 'Confirmar Alteração'}
              </Button>
            )}
          </div>

          <Button
            onClick={onClose}
            disabled={loading}
            variant="ghost"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};