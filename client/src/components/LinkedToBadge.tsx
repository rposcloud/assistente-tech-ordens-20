import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Link2, FileText } from 'lucide-react';

interface LinkedToBadgeProps {
  type: 'ordem-servico' | 'entrada-financeira';
  linkedId?: string;
  linkedNumber?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LinkedToBadge: React.FC<LinkedToBadgeProps> = ({
  type,
  linkedId,
  linkedNumber,
  className = '',
  size = 'sm'
}) => {
  if (!linkedId) {
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

  const getConfig = () => {
    switch (type) {
      case 'ordem-servico':
        return {
          icon: <FileText className={`${iconSize[size]} mr-1`} />,
          text: `Vinculado à OS ${linkedNumber || linkedId.slice(-6)}`,
          colors: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
        };
      case 'entrada-financeira':
        return {
          icon: <Link2 className={`${iconSize[size]} mr-1`} />,
          text: `Entrada vinculada`,
          colors: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
        };
      default:
        return {
          icon: <Link2 className={`${iconSize[size]} mr-1`} />,
          text: 'Vinculado',
          colors: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
        };
    }
  };

  const config = getConfig();

  return (
    <Badge 
      variant="outline" 
      className={`
        ${config.colors}
        transition-colors
        ${sizeClasses[size]} 
        ${className}
      `}
      title={config.text}
    >
      {config.icon}
      {size !== 'sm' && config.text}
      {size === 'sm' && 'Vinculado'}
    </Badge>
  );
};