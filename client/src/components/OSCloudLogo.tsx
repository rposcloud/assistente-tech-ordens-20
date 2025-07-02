import React from 'react';

interface OSCloudLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const OSCloudLogo: React.FC<OSCloudLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeConfig = {
    sm: { width: 32, height: 32, text: 'text-lg', subtitle: 'text-xs' },
    md: { width: 40, height: 40, text: 'text-xl', subtitle: 'text-sm' },
    lg: { width: 48, height: 48, text: 'text-2xl', subtitle: 'text-base' },
    xl: { width: 64, height: 64, text: 'text-4xl', subtitle: 'text-lg' }
  };

  const config = sizeConfig[size];

  const LogoSVG = () => (
    <svg 
      width={config.width} 
      height={config.height} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1d4ed8"/>
        </linearGradient>
        <linearGradient id="docGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc"/>
          <stop offset="100%" stopColor="#e2e8f0"/>
        </linearGradient>
        <linearGradient id="gearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#d97706"/>
        </linearGradient>
      </defs>
      
      {/* Nuvem de fundo */}
      <path 
        d="M48 28c0-2.2-1.8-4-4-4-0.4 0-0.8 0.1-1.2 0.2C41.4 20.8 38 18 34 18c-4.4 0-8 3.6-8 8 0 0.3 0 0.6 0.1 0.9C24.8 27.6 23 29.2 23 31.5c0 2.5 2 4.5 4.5 4.5h16c2.8 0 5-2.2 5-5z" 
        fill="url(#cloudGradient)"
      />
      
      {/* Documento/OS */}
      <rect x="22" y="32" width="20" height="26" rx="2" fill="url(#docGradient)" stroke="#1e40af" strokeWidth="1"/>
      
      {/* Linhas do documento */}
      <line x1="26" y1="38" x2="38" y2="38" stroke="#64748b" strokeWidth="1"/>
      <line x1="26" y1="42" x2="36" y2="42" stroke="#64748b" strokeWidth="1"/>
      <line x1="26" y1="46" x2="38" y2="46" stroke="#64748b" strokeWidth="1"/>
      <line x1="26" y1="50" x2="34" y2="50" stroke="#64748b" strokeWidth="1"/>
      
      {/* Engrenagem pequena */}
      <circle cx="50" cy="48" r="6" fill="url(#gearGradient)" stroke="#d97706" strokeWidth="1"/>
      <circle cx="50" cy="48" r="3" fill="none" stroke="#d97706" strokeWidth="1"/>
      <path d="M50 42v2 M50 52v2 M56 48h-2 M46 48h-2 M54.24 43.76l-1.41 1.41 M47.17 50.83l-1.41 1.41 M54.24 52.24l-1.41-1.41 M47.17 45.17l-1.41-1.41" stroke="#d97706" strokeWidth="1"/>
    </svg>
  );

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <LogoSVG />
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 ${config.text} tracking-tight`}>
            OS Cloud
          </span>
          <span className={`text-gray-600 ${config.subtitle} -mt-1 font-medium`}>
            Sistema de Gestão
          </span>
        </div>
      )}
    </div>
  );
};