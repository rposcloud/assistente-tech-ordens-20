import React, { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { OrdemPrintView } from '@/components/print/OrdemPrintView';
import { Loader2, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ImpressaoOrdemDedicada: React.FC = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  // Buscar dados da ordem para impressão
  const { data: ordem, isLoading: isLoadingOrdem } = useQuery({
    queryKey: ['/api/ordens', id, 'print'],
    queryFn: async () => {
      const response = await fetch(`/api/ordens/${id}/print`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Erro ao buscar ordem para impressão');
      }
      return response.json();
    },
    enabled: !!id
  });

  // Buscar dados do perfil da empresa
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/profile']
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById('ordem-print-content');
      if (!element) return;

      // Configurações para melhor qualidade
      const canvas = await html2canvas(element, {
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
      pdf.save(`OS-${ordem?.ordem?.numero || 'ordem'}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Fallback para impressão
      handlePrint();
    }
  };

  // Auto-print quando a página carrega (opcional)
  useEffect(() => {
    if (ordem && profile && !isLoadingOrdem && !isLoadingProfile) {
      // Pequeno delay para garantir que tudo foi renderizado
      const timer = setTimeout(() => {
        // Remover o delay se não quiser auto-print
        // window.print();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [ordem, profile, isLoadingOrdem, isLoadingProfile]);

  if (isLoadingOrdem || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dados para impressão...</p>
        </div>
      </div>
    );
  }

  if (!ordem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ordem de serviço não encontrada</p>
          <Button 
            onClick={() => window.close()} 
            variant="outline"
          >
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="impressao-ordem-dedicada min-h-screen bg-white p-0 m-0 overflow-x-hidden">
      <style>{`
        .impressao-ordem-dedicada {
          margin: 0 !important;
          padding: 0 !important;
        }
        .impressao-ordem-dedicada .sidebar,
        .impressao-ordem-dedicada .header,
        .impressao-ordem-dedicada nav,
        .impressao-ordem-dedicada .navigation {
          display: none !important;
        }
        
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            font-size: 12px !important;
          }
          
          .impressao-ordem-dedicada {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            page-break-inside: avoid !important;
          }
          
          #ordem-print-content {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 8px !important;
            overflow: visible !important;
            page-break-inside: avoid !important;
            box-shadow: none !important;
          }
          
          .print\\:hidden,
          .no-print {
            display: none !important;
          }
          
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
      
      {/* Botões de ação - visíveis apenas na tela */}
      <div className="print:hidden fixed top-4 right-4 z-50 no-print flex gap-2">
        <Button 
          onClick={handleDownloadPDF}
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Conteúdo da impressão - sem padding ou margin */}
      <div className="w-full h-full">
        <OrdemPrintView ordem={ordem} profile={profile} />
      </div>

      {/* CSS específico para impressão */}
      <style>{`
        @media print {
          @page {
            margin: 0.5in;
            size: A4;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          /* Forçar quebras de página adequadas */
          .break-before-page {
            page-break-before: always;
          }
          
          .break-after-page {
            page-break-after: always;
          }
          
          /* Evitar quebras dentro de elementos importantes */
          .print-together {
            page-break-inside: avoid;
          }
          
          /* Garantir cores de fundo e bordas na impressão */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};