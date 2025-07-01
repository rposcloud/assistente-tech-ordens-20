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
    // Adiciona estilos específicos para impressão
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: A4;
          margin: 15mm;
        }
        body * {
          visibility: hidden;
        }
        .print-area, .print-area * {
          visibility: visible;
        }
        .print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .print\\:hidden {
          display: none !important;
        }
        .print\\:text-xs {
          font-size: 11px !important;
        }
        .print\\:text-sm {
          font-size: 12px !important;
        }
        .print\\:p-1 {
          padding: 4px !important;
        }
        .print\\:p-2 {
          padding: 8px !important;
        }
        .print\\:p-3 {
          padding: 12px !important;
        }
        .print\\:gap-1 {
          gap: 4px !important;
        }
        .print\\:gap-2 {
          gap: 8px !important;
        }
        .print\\:gap-3 {
          gap: 12px !important;
        }
        .print\\:space-y-1 > * + * {
          margin-top: 4px !important;
        }
        .print\\:space-y-2 > * + * {
          margin-top: 8px !important;
        }
        .print\\:space-y-3 > * + * {
          margin-top: 12px !important;
        }
        .print\\:h-3 {
          height: 12px !important;
        }
        .print\\:w-3 {
          width: 12px !important;
        }
        .print\\:text-lg {
          font-size: 14px !important;
        }
        .print\\:text-xl {
          font-size: 16px !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    // Remove o estilo após impressão
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b bg-white flex-shrink-0 print:hidden">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold">
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
        
        <div className="flex-1 overflow-y-auto print-area" style={{ maxHeight: 'calc(90vh - 60px)' }}>
          <VisualizacaoOS ordem={ordem} />
        </div>
      </DialogContent>
    </Dialog>
  );
};