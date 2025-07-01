import React from 'react';
import { Cloud } from 'lucide-react';

interface OSCloudLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const OSCloudLogo: React.FC<OSCloudLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: {
      icon: 'w-6 h-6',
      text: 'text-lg',
      subtitle: 'text-xs'
    },
    md: {
      icon: 'w-8 h-8',
      text: 'text-xl',
      subtitle: 'text-sm'
    },
    lg: {
      icon: 'w-12 h-12',
      text: 'text-3xl',
      subtitle: 'text-base'
    }
  };

  const styles = sizeClasses[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <Cloud className={`${styles.icon} text-blue-600 fill-blue-600`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-xs">OS</span>
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 ${styles.text}`}>
            Cloud
          </span>
          <span className={`text-gray-600 ${styles.subtitle} -mt-1`}>
            Sistema de Gestão
          </span>
        </div>
      )}
    </div>
  );
};