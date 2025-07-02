import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { StatusChangeConfirmationModal } from './modals/StatusChangeConfirmationModal';

interface StatusQuickSelectorProps {
  ordemId: string;
  currentStatus: string;
  size?: 'sm' | 'md' | 'lg';
  valorTotal?: number;
}

const statusConfig = {
  'aberta': {
    emoji: '📝',
    label: 'Aberta',
    color: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    description: 'Ordem recém-criada'
  },
  'em_andamento': {
    emoji: '🔧',
    label: 'Em Andamento',
    color: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
    description: 'Trabalho em execução'
  },
  'aguardando_pecas': {
    emoji: '⏳',
    label: 'Aguardando Peças',
    color: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100',
    description: 'Esperando componentes'
  },
  'pronta': {
    emoji: '✅',
    label: 'Pronta',
    color: 'text-green-600 bg-green-50 hover:bg-green-100',
    description: 'Trabalho concluído'
  },
  'finalizada': {
    emoji: '🎯',
    label: 'Finalizada',
    color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
    description: 'Entregue ao cliente'
  }
};

export const StatusQuickSelector: React.FC<StatusQuickSelectorProps> = ({
  ordemId,
  currentStatus,
  size = 'md',
  valorTotal = 0
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado local para atualização instantânea da UI
  const [displayStatus, setDisplayStatus] = useState(currentStatus);
  
  // Estados do modal de confirmação
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  
  // Sincronizar com prop quando ela mudar
  useEffect(() => {
    setDisplayStatus(currentStatus);
  }, [currentStatus]);

  // Verificar se existe entrada financeira vinculada
  const { data: financialCheck } = useQuery<{hasFinancialEntry: boolean; financialEntry: any}>({
    queryKey: ['/api/financeiro/check-ordem', ordemId],
    enabled: currentStatus === 'finalizada',
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const hasFinancialEntry = financialCheck?.hasFinancialEntry || false;

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await apiRequest(`/ordens/${ordemId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      return response;
    },
    onSuccess: (_, newStatus) => {
      toast({
        title: "Status atualizado!",
        description: `Ordem alterada para: ${statusConfig[newStatus as keyof typeof statusConfig]?.label}`,
      });
      // Invalidar cache para atualização em outras partes
      queryClient.invalidateQueries({ queryKey: ['/api/ordens'] });
    },
    onError: (error: any, newStatus) => {
      // Reverter estado local em caso de erro
      setDisplayStatus(currentStatus);
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== displayStatus) {
      // Verificar se precisa de confirmação (saindo de finalizada com entrada financeira)
      const needsConfirmation = currentStatus === 'finalizada' && 
                               newStatus !== 'finalizada' && 
                               hasFinancialEntry;
      
      if (needsConfirmation) {
        // Mostrar modal de confirmação
        setPendingStatus(newStatus);
        setShowConfirmModal(true);
      } else {
        // Mudança simples - prosseguir normalmente
        setDisplayStatus(newStatus);
        updateStatusMutation.mutate(newStatus);
      }
    }
  };

  const handleConfirmStatusChange = (action: 'keep' | 'delete' | 'pending') => {
    setShowConfirmModal(false);
    setDisplayStatus(pendingStatus);
    
    // Enviar com informação da ação escolhida
    updateStatusMutation.mutate(pendingStatus, {
      onSettled: () => {
        // Reset do estado
        setPendingStatus('');
      }
    });

    // TODO: Implementar lógica específica para cada ação no backend
    if (action === 'delete') {
      // Excluir entrada financeira vinculada
      console.log('Excluindo entrada financeira vinculada');
    } else if (action === 'pending') {
      // Marcar entrada como pendente
      console.log('Marcando entrada como pendente');
    }
    // action === 'keep' não faz nada especial
  };

  const currentConfig = statusConfig[displayStatus as keyof typeof statusConfig];
  
  const buttonSize = size === 'sm' ? 'h-8 px-2 text-xs' : 
                   size === 'lg' ? 'h-12 px-4 text-base' : 
                   'h-10 px-3 text-sm';

  const emojiSize = size === 'sm' ? 'text-sm' : 
                   size === 'lg' ? 'text-xl' : 
                   'text-base';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`${buttonSize} ${currentConfig?.color || 'text-gray-600 bg-gray-50'} border-0 rounded-full font-medium transition-all hover:scale-105`}
            disabled={updateStatusMutation.isPending}
          >
            <span className={`${emojiSize} mr-1`}>
              {currentConfig?.emoji || '❓'}
            </span>
            {size !== 'sm' && (
              <span className="hidden sm:inline">
                {currentConfig?.label || 'Status'}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          {Object.entries(statusConfig).map(([status, config]) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`flex items-center gap-3 py-3 px-3 cursor-pointer ${
                status === displayStatus ? 'bg-gray-100 font-medium' : ''
              }`}
            >
              <span className="text-lg">{config.emoji}</span>
              <div className="flex flex-col">
                <span className="font-medium">{config.label}</span>
                <span className="text-xs text-gray-500">{config.description}</span>
              </div>
              {status === displayStatus && (
                <span className="ml-auto text-xs text-blue-600">✓ Atual</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <StatusChangeConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingStatus('');
        }}
        onConfirm={handleConfirmStatusChange}
        currentStatus={currentStatus}
        newStatus={pendingStatus}
        hasFinancialEntry={hasFinancialEntry}
        financialValue={valorTotal}
        loading={updateStatusMutation.isPending}
      />
    </>
  );
};

export default StatusQuickSelector;