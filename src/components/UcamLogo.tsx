import React from 'react';

interface UcamLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  glow?: boolean;
  customLogoUrl?: string;
}

export const UcamLogo: React.FC<UcamLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
  glow = false,
  customLogoUrl
}) => {
  const logoSrc = customLogoUrl || '/ucam-logo.png';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div 
        className={`relative flex items-center justify-center transition-all ${
          glow ? 'drop-shadow-[0_0_12px_rgba(234,160,4,0.4)]' : ''
        }`}
        style={{ width: size, height: size * 1.12 }}
      >
        <img 
          src={logoSrc} 
          alt="UCAM Murcia CB Logo Oficial" 
          className="w-full h-full object-contain filter drop-shadow-sm select-none" 
          crossOrigin="anonymous"
          onError={(e) => {
            // Fallback to Wikipedia direct link if local path fails
            const target = e.currentTarget;
            if (target.src !== 'https://upload.wikimedia.org/wikipedia/commons/5/54/Escudo_Deportivo_UCAM_-_UCAM_Murcia_CF_-_UCAM_Murcia_CB.png') {
              target.src = 'https://upload.wikimedia.org/wikipedia/commons/5/54/Escudo_Deportivo_UCAM_-_UCAM_Murcia_CF_-_UCAM_Murcia_CB.png';
            }
          }}
          referrerPolicy="no-referrer"
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <span className="font-black tracking-wider text-white text-lg leading-none uppercase font-sans">
            UCAM MURCIA CB
          </span>
          <span className="text-[10px] font-bold tracking-wide text-amber-400 mt-1 uppercase">
            Liga Endesa / Basketball Champions League
          </span>
        </div>
      )}
    </div>
  );
};


