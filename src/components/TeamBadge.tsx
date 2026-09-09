import React from 'react';

interface TeamBadgeProps {
  teamName?: string;
  shortName?: string;
  logoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isHost?: boolean;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  teamName = '',
  shortName = '',
  logoUrl,
  className = '',
  size = 'md',
}) => {
  const nameLower = (teamName + ' ' + shortName).toLowerCase();

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-10 h-10 sm:w-12 sm:h-12 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-16 h-16 text-base',
  }[size];

  // If local asset or clean data URL, use image directly
  if (logoUrl && (logoUrl.startsWith('/') || logoUrl.startsWith('data:image'))) {
    return (
      <img
        src={logoUrl}
        alt={teamName || 'Team Logo'}
        className={`${sizeClasses} object-contain drop-shadow shrink-0 ${className}`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // Vector SVG Crests for Liga Endesa & European Teams
  // 1. UCAM Murcia
  if (nameLower.includes('ucam') || nameLower.includes('murcia')) {
    return (
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-red-800 via-red-900 to-amber-900 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-amber-400/40 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#7f1d1d" stroke="#f59e0b" strokeWidth="4" />
          <path d="M50 16 L74 30 L74 62 L50 84 L26 62 L26 30 Z" fill="#991b1b" stroke="#fbbf24" strokeWidth="2.5" />
          <text x="50" y="44" textAnchor="middle" fill="#fbbf24" fontSize="16" fontWeight="900" fontFamily="sans-serif">UCAM</text>
          <text x="50" y="60" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="800" fontFamily="sans-serif">MURCIA</text>
          <circle cx="50" cy="72" r="3.5" fill="#fbbf24" />
        </svg>
      </div>
    );
  }

  // 2. FC Barcelona (Barça)
  if (nameLower.includes('barça') || nameLower.includes('barca') || nameLower.includes('barcelona')) {
    return (
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-blue-900 via-indigo-950 to-red-950 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-amber-400/40 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="4" />
          {/* Blaugrana Stripes */}
          <path d="M30 40 L70 40 L70 80 C70 80 50 92 50 92 C50 92 30 80 30 80 Z" fill="#991b1b" stroke="#fbbf24" strokeWidth="2" />
          <rect x="42" y="40" width="8" height="46" fill="#1d4ed8" />
          <rect x="58" y="40" width="8" height="40" fill="#1d4ed8" />
          {/* St George & Catalan flags at top */}
          <rect x="30" y="24" width="20" height="16" fill="#f8fafc" stroke="#fbbf24" strokeWidth="1" />
          <path d="M40 24 L40 40 M30 32 L50 32" stroke="#dc2626" strokeWidth="3" />
          <rect x="50" y="24" width="20" height="16" fill="#eab308" stroke="#fbbf24" strokeWidth="1" />
          <path d="M50 28 L70 28 M50 36 L70 36" stroke="#dc2626" strokeWidth="2" />
          <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="sans-serif">FCB</text>
        </svg>
      </div>
    );
  }

  // 3. Real Madrid
  if (nameLower.includes('madrid')) {
    return (
      <div className={`${sizeClasses} rounded-full bg-slate-900 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-amber-400/50 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="54" r="38" fill="#ffffff" stroke="#eab308" strokeWidth="4" />
          <path d="M26 40 L74 68 M26 48 L74 76" stroke="#7c3aed" strokeWidth="6" strokeLinecap="round" />
          {/* Crown */}
          <path d="M32 24 L38 34 L50 20 L62 34 L68 24 L66 38 L34 38 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
          <circle cx="50" cy="18" r="3" fill="#dc2626" />
          <circle cx="32" cy="22" r="2.5" fill="#3b82f6" />
          <circle cx="68" cy="22" r="2.5" fill="#3b82f6" />
          <text x="50" y="60" textAnchor="middle" fill="#1e1b4b" fontSize="18" fontWeight="900" fontFamily="serif">RMCF</text>
        </svg>
      </div>
    );
  }

  // 4. Valencia Basket
  if (nameLower.includes('valencia')) {
    return (
      <div className={`${sizeClasses} rounded-full bg-orange-950 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-orange-500/50 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#ea580c" stroke="#18181b" strokeWidth="4" />
          <path d="M50 18 L76 32 L76 66 L50 86 L24 66 L24 32 Z" fill="#09090b" stroke="#f97316" strokeWidth="2.5" />
          {/* Bat outline */}
          <path d="M35 34 C42 38 46 36 50 30 C54 36 58 38 65 34 C63 42 58 44 50 48 C42 44 37 42 35 34 Z" fill="#f97316" />
          <text x="50" y="64" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900" fontFamily="sans-serif">VALENCIA</text>
          <text x="50" y="76" textAnchor="middle" fill="#fb923c" fontSize="10" fontWeight="800" fontFamily="sans-serif">BASKET</text>
        </svg>
      </div>
    );
  }

  // 5. Unicaja Málaga
  if (nameLower.includes('unicaja') || nameLower.includes('malaga') || nameLower.includes('málaga')) {
    return (
      <div className={`${sizeClasses} rounded-full bg-emerald-950 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-emerald-500/50 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#047857" stroke="#10b981" strokeWidth="4" />
          {/* Unicaja tree leaf emblem */}
          <path d="M50 20 C68 20 78 36 70 54 C64 68 50 82 50 82 C50 82 36 68 30 54 C22 36 32 20 50 20 Z" fill="#065f46" stroke="#34d399" strokeWidth="2.5" />
          <path d="M50 32 L50 68 M40 46 L50 54 M60 46 L50 54" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
          <text x="50" y="60" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="sans-serif">UNICAJA</text>
        </svg>
      </div>
    );
  }

  // 6. Baskonia
  if (nameLower.includes('baskonia') || nameLower.includes('vitoria')) {
    return (
      <div className={`${sizeClasses} rounded-full bg-blue-950 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-red-500/50 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#1e3a8a" stroke="#dc2626" strokeWidth="4" />
          <path d="M50 18 L76 34 L76 66 L50 84 L24 66 L24 34 Z" fill="#991b1b" stroke="#3b82f6" strokeWidth="2.5" />
          <text x="50" y="52" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" fontFamily="sans-serif">SASKI</text>
          <text x="50" y="66" textAnchor="middle" fill="#93c5fd" fontSize="12" fontWeight="900" fontFamily="sans-serif">BASKONIA</text>
        </svg>
      </div>
    );
  }

  // 7. Joventut Badalona
  if (nameLower.includes('joventut') || nameLower.includes('badalona') || nameLower.includes('penya')) {
    return (
      <div className={`${sizeClasses} rounded-full bg-emerald-950 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-emerald-400/50 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#065f46" stroke="#000000" strokeWidth="4" />
          <circle cx="50" cy="50" r="36" fill="#047857" stroke="#10b981" strokeWidth="2" />
          <rect x="25" y="44" width="50" height="12" fill="#000000" rx="2" />
          <text x="50" y="54" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="900" fontFamily="sans-serif">PENYA</text>
          <text x="50" y="70" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif">JOVENTUT</text>
        </svg>
      </div>
    );
  }

  // 8. Tenerife / Canarias
  if (nameLower.includes('tenerife') || nameLower.includes('canarias') || nameLower.includes('laguna')) {
    return (
      <div className={`${sizeClasses} rounded-full bg-yellow-950 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-yellow-400/50 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#eab308" stroke="#1e1b4b" strokeWidth="4" />
          <path d="M50 18 L76 34 L76 66 L50 84 L24 66 L24 34 Z" fill="#1e1b4b" stroke="#facc15" strokeWidth="2.5" />
          <text x="50" y="48" textAnchor="middle" fill="#facc15" fontSize="11" fontWeight="900" fontFamily="sans-serif">CB</text>
          <text x="50" y="62" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" fontFamily="sans-serif">TENERIFE</text>
        </svg>
      </div>
    );
  }

  // 9. Manresa
  if (nameLower.includes('manresa') || nameLower.includes('baxi')) {
    return (
      <div className={`${sizeClasses} rounded-full bg-red-950 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-red-500/50 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#dc2626" stroke="#ffffff" strokeWidth="4" />
          <rect x="25" y="38" width="50" height="24" fill="#ffffff" rx="4" />
          <text x="50" y="55" textAnchor="middle" fill="#dc2626" fontSize="14" fontWeight="900" fontFamily="sans-serif">BAXI</text>
          <text x="50" y="74" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif">MANRESA</text>
        </svg>
      </div>
    );
  }

  // 10. Gran Canaria
  if (nameLower.includes('gran canaria') || nameLower.includes('palmas')) {
    return (
      <div className={`${sizeClasses} rounded-full bg-yellow-950 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-yellow-400/50 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="#ca8a04" stroke="#1e3a8a" strokeWidth="4" />
          <circle cx="50" cy="50" r="36" fill="#1e3a8a" />
          <text x="50" y="48" textAnchor="middle" fill="#facc15" fontSize="11" fontWeight="900" fontFamily="sans-serif">GRAN</text>
          <text x="50" y="62" textAnchor="middle" fill="#facc15" fontSize="11" fontWeight="900" fontFamily="sans-serif">CANARIA</text>
        </svg>
      </div>
    );
  }

  // Generic fallback with clean monogram and basketball lines
  const initials = (shortName || teamName || 'CB')
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 3)
    .toUpperCase();

  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-slate-800 to-slate-900 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-amber-400/40 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="46" fill="#1e293b" stroke="#f59e0b" strokeWidth="3.5" />
        <path d="M10 50 A40 40 0 0 0 90 50" fill="none" stroke="#475569" strokeWidth="1.5" />
        <path d="M50 10 A40 40 0 0 0 50 90" fill="none" stroke="#475569" strokeWidth="1.5" />
        <text x="50" y="56" textAnchor="middle" fill="#fbbf24" fontSize="18" fontWeight="900" fontFamily="sans-serif">
          {initials}
        </text>
      </svg>
    </div>
  );
};
