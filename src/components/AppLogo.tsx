import React, { useState } from 'react';
import acMaterialIcon from '../assets/images/ac_material_icon_1793780920414.jpg';

interface AppLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 'md' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 rounded-lg',
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  }[size];

  return (
    <div
      className={`relative bg-[#0d121f] border border-indigo-500/25 dark:border-indigo-400/25 flex items-center justify-center text-white shadow-md shadow-indigo-950/40 shrink-0 overflow-hidden ${sizeClasses} ${className}`}
      title="AC Power Tracker"
    >
      {!imageError ? (
        <img
          src={acMaterialIcon}
          alt="AC Power Tracker Material Icon"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Material Design 3 Layered Vector: Elevated Air Conditioner + Energy Bolt */
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
          aria-label="AC Power Tracker"
        >
          {/* Base Surface Squircle */}
          <rect x="2" y="2" width="44" height="44" rx="12" fill="#1e1b4b" />
          
          {/* Top Unit Housing */}
          <rect x="10" y="8" width="28" height="14" rx="4" fill="#06b6d4" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Digital Temp Display */}
          <rect x="18" y="11" width="12" height="7" rx="2" fill="#090d16" />
          <text
            x="24"
            y="16.2"
            fontSize="4.8"
            fontWeight="bold"
            fill="#38bdf8"
            textAnchor="middle"
            fontFamily="monospace"
          >
            21°
          </text>
          
          {/* Main Air Flow Housing (Elevated Surface) */}
          <rect x="8" y="19" width="32" height="21" rx="5" fill="#4338ca" />
          <rect x="10" y="21" width="28" height="17" rx="3.5" fill="#0f172a" stroke="#6366f1" strokeWidth="1" />
          
          {/* Energy Bolt */}
          <path
            d="M24.5 22.5L21.5 27.5H24L23.5 31.5L26.5 26.5H24L24.5 22.5Z"
            fill="#38bdf8"
          />
          
          {/* Material Airflow Louvers */}
          <rect x="13" y="32" width="22" height="1.8" rx="0.9" fill="#06b6d4" />
          <rect x="13" y="34.8" width="22" height="1.8" rx="0.9" fill="#38bdf8" />
        </svg>
      )}
    </div>
  );
};

