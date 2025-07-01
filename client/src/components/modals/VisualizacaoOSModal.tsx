import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VisualizacaoOS } from '@/components/VisualizacaoOS';
import { Download, FileText, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const handleGenerateDocument = async () => {
    try {
      // Busca o conteúdo da visualização
      const element = document.querySelector('.visualizacao-os-content');
      if (!element) return;

      // Configurações otimizadas para documento
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 3, // Maior escala para melhor qualidade de texto
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calcular dimensões para A4 com margens
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // Margem de 10mm
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - (margin * 2);
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      // Centralizar na página
      const x = (pdfWidth - finalWidth) / 2;
      const y = margin;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      pdf.save(`Ordem-Servico-${ordem.numero}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Busca o conteúdo da visualização
      const element = document.querySelector('.visualizacao-os-content');
      if (!element) return;

      // Configurações para melhor qualidade
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calcular dimensões para A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      // Centralizar na página
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      pdf.save(`OS-${ordem.numero}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b bg-white flex-shrink-0 print:hidden">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold">
              Visualização da Ordem de Serviço
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button
                onClick={handleGenerateDocument}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <FileText className="h-4 w-4" />
                Gerar Documento
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto print-area" style={{ maxHeight: 'calc(90vh - 60px)' }}>
          <VisualizacaoOS ordem={ordem} />
        </div>
      </DialogContent>
    </Dialog>
  );
};