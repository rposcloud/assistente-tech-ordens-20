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
import { AlertTriangle, DollarSign, Trash2, Unlink, Shield } from 'lucide-react';

interface OSDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: 'delete-all' | 'unlink-keep' | 'cancel') => void;
  ordem: {
    numero: string;
    status: string;
    valor_total: number;
  } | null;
  hasFinancialEntry: boolean;
  financialEntries?: Array<{
    id: string;
    descricao: string;
    valor: string;
  }>;
  loading?: boolean;
}

export const OSDeleteConfirmationModal: React.FC<OSDeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  ordem,
  hasFinancialEntry,
  financialEntries = [],
  loading = false
}) => {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!ordem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Excluir Ordem de Serviço
          </DialogTitle>
          <DialogDescription>
            OS #{ordem.numero} - <Badge variant="outline">{ordem.status}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasFinancialEntry ? (
            <Alert className="border-orange-200 bg-orange-50">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <strong>⚠️ Ordem possui vínculos financeiros!</strong>
                <br />
                <span className="text-sm text-gray-600 mt-1 block">
                  Esta OS possui {financialEntries.length} entrada(s) financeira(s) vinculada(s).
                  Escolha como proceder:
                </span>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription>
                Tem certeza que deseja excluir esta ordem de serviço? 
                <br />
                <span className="text-sm text-red-600 mt-1 block font-medium">
                  Esta ação não pode ser desfeita.
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Lista de entradas financeiras vinculadas */}
          {hasFinancialEntry && financialEntries.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Entradas vinculadas:</h4>
              {financialEntries.map((entrada) => (
                <div key={entrada.id} className="flex justify-between text-sm">
                  <span>{entrada.descricao}</span>
                  <span className="font-medium">{formatCurrency(parseFloat(entrada.valor))}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {hasFinancialEntry ? (
              <>
                <Button
                  onClick={() => onConfirm('unlink-keep')}
                  disabled={loading}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Unlink className="h-4 w-4 mr-2 text-blue-600" />
                  Desvincular e manter entradas financeiras (Recomendado)
                </Button>
                
                <Button
                  onClick={() => onConfirm('delete-all')}
                  disabled={loading}
                  className="w-full justify-start"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2 text-white" />
                  Excluir tudo (OS + entradas financeiras)
                </Button>

                <Button
                  onClick={() => onConfirm('cancel')}
                  disabled={loading}
                  variant="ghost"
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Cancelar e manter tudo
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => onConfirm('delete-all')}
                  disabled={loading}
                  className="w-full"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </Button>

                <Button
                  onClick={() => onConfirm('cancel')}
                  disabled={loading}
                  variant="ghost"
                  className="w-full"
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};