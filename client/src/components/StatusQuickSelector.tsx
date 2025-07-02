import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface StatusQuickSelectorProps {
  ordemId: string;
  currentStatus: string;
  size?: 'sm' | 'md' | 'lg';
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
  size = 'md'
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['/api/ordens'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== currentStatus) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  const currentConfig = statusConfig[currentStatus as keyof typeof statusConfig];
  
  const buttonSize = size === 'sm' ? 'h-8 px-2 text-xs' : 
                   size === 'lg' ? 'h-12 px-4 text-base' : 
                   'h-10 px-3 text-sm';

  const emojiSize = size === 'sm' ? 'text-sm' : 
                   size === 'lg' ? 'text-xl' : 
                   'text-base';

  return (
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
              status === currentStatus ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            <span className="text-lg">{config.emoji}</span>
            <div className="flex flex-col">
              <span className="font-medium">{config.label}</span>
              <span className="text-xs text-gray-500">{config.description}</span>
            </div>
            {status === currentStatus && (
              <span className="ml-auto text-xs text-blue-600">✓ Atual</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusQuickSelector;