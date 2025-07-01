import React, { useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { OrdemPrintView } from '@/components/print/OrdemPrintView';
import { Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ImpressaoOrdemDedicada: React.FC = () => {
  const { id } = useParams();

  // Buscar dados da ordem
  const { data: ordem, isLoading: isLoadingOrdem } = useQuery({
    queryKey: ['/api/ordens', id],
    enabled: !!id
  });

  // Buscar dados do perfil da empresa
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/profile']
  });

  const handlePrint = () => {
    window.print();
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
    <div className="min-h-screen bg-white">
      {/* Botão de impressão - visível apenas na tela */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <Button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Conteúdo da impressão */}
      <div className="print:p-0">
        <OrdemPrintView ordem={ordem} profile={profile} />
      </div>

      {/* CSS específico para impressão */}
      <style jsx>{`
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