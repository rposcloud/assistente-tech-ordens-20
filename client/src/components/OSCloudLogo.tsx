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
      {/* Background with gradient */}
      <rect width="64" height="64" rx="16" fill="url(#bgGradient)"/>
      
      {/* Cloud shape */}
      <path 
        d="M20 38c-2.2 0-4-1.8-4-4s1.8-4 4-4c.4-4.6 4.2-8 9-8 3.8 0 7 2.4 8.4 5.6.6-.2 1.2-.2 1.6-.2 3.4 0 6 2.6 6 6s-2.6 6-6 6H20z" 
        fill="white" 
        fillOpacity="0.9"
      />
      
      {/* Document/Order icon */}
      <rect x="28" y="28" width="16" height="12" rx="2" fill="url(#docGradient)" stroke="white" strokeWidth="1"/>
      <line x1="30" y1="32" x2="42" y2="32" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="30" y1="35" x2="40" y2="35" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="30" y1="38" x2="36" y2="38" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      
      {/* Service gear */}
      <circle cx="44" cy="44" r="6" fill="url(#gearGradient)" stroke="white" strokeWidth="1.5"/>
      <circle cx="44" cy="44" r="2" fill="white"/>
      
      {/* Gear teeth */}
      <rect x="43" y="36" width="2" height="3" rx="1" fill="white"/>
      <rect x="43" y="49" width="2" height="3" rx="1" fill="white"/>
      <rect x="36" y="43" width="3" height="2" rx="1" fill="white"/>
      <rect x="49" y="43" width="3" height="2" rx="1" fill="white"/>
      
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6"/>
          <stop offset="50%" stopColor="#1D4ED8"/>
          <stop offset="100%" stopColor="#1E3A8A"/>
        </linearGradient>
        <linearGradient id="docGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA"/>
          <stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
        <linearGradient id="gearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24"/>
          <stop offset="100%" stopColor="#F59E0B"/>
        </linearGradient>
      </defs>
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