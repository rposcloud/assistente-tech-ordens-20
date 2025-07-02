import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Link, Shield } from 'lucide-react';

interface FinancialStatusBadgeProps {
  ordemId: string;
  status: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FinancialStatusBadge: React.FC<FinancialStatusBadgeProps> = ({
  ordemId,
  status,
  className = '',
  showIcon = true,
  size = 'sm'
}) => {
  // Verificar se existe entrada financeira vinculada
  const { data: financialCheck } = useQuery<{hasFinancialEntry: boolean; financialEntry: any}>({
    queryKey: ['/api/financeiro/check-ordem', ordemId],
    enabled: status === 'finalizada',
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const hasFinancialEntry = financialCheck?.hasFinancialEntry || false;

  // Só mostrar badge se houver vínculo financeiro
  if (!hasFinancialEntry) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5', 
    lg: 'h-4 w-4'
  };

  return (
    <Badge 
      variant="secondary" 
      className={`
        bg-green-100 text-green-800 border-green-200 
        hover:bg-green-200 transition-colors
        ${sizeClasses[size]} 
        ${className}
      `}
    >
      {showIcon && <DollarSign className={`${iconSize[size]} mr-1`} />}
      Faturada
    </Badge>
  );
};

interface ProtectedStatusBadgeProps {
  hasFinancialEntry: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProtectedStatusBadge: React.FC<ProtectedStatusBadgeProps> = ({
  hasFinancialEntry,
  className = '',
  size = 'sm'
}) => {
  if (!hasFinancialEntry) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5', 
    lg: 'h-4 w-4'
  };

  return (
    <Badge 
      variant="outline" 
      className={`
        bg-orange-50 text-orange-700 border-orange-200 
        hover:bg-orange-100 transition-colors
        ${sizeClasses[size]} 
        ${className}
      `}
    >
      <Shield className={`${iconSize[size]} mr-1`} />
      Protegida
    </Badge>
  );
};