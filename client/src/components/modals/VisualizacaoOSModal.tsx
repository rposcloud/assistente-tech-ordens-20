import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VisualizacaoOS } from '@/components/VisualizacaoOS';
import { Printer } from 'lucide-react';

interface VisualizacaoOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordem: any;
}

export const VisualizacaoOSModal: React.FC<VisualizacaoOSModalProps> = ({
  isOpen,
  onClose,
  ordem
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              Visualização da Ordem de Serviço
            </DialogTitle>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6">
          <VisualizacaoOS ordem={ordem} />
        </div>
      </DialogContent>
    </Dialog>
  );
};