import React, { useState } from 'react';
import acAppIcon from '../assets/images/ac_app_icon_1793780360481.jpg';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 'md' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg text-xs',
    md: 'w-10 h-10 rounded-xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base',
    xl: 'w-16 h-16 rounded-2xl text-xl',
  }[size];

  return (
    <div
      className={`relative bg-slate-900 border border-slate-700/60 flex items-center justify-center text-white shadow-md shadow-indigo-950/40 shrink-0 overflow-hidden ${sizeClasses} ${className}`}
      title="AC Power Tracker"
    >
      {!imageError ? (
        <img
          src={acAppIcon}
          alt="AC Power Tracker Icon"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        /* High-fidelity Vector Fallback: AC Unit with LED Display & Air Waves */
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-indigo-400"
          aria-label="AC Power Tracker"
        >
          <rect x="2" y="4" width="20" height="9" rx="2" fill="currentColor" fillOpacity="0.15" />
          <line x1="5" y1="7" x2="19" y2="7" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="5" y1="9.5" x2="13" y2="9.5" strokeWidth="1.2" strokeOpacity="0.8" />
          <text
            x="17.5"
            y="9.8"
            fontSize="3.8"
            fontWeight="bold"
            fill="#38bdf8"
            stroke="none"
            textAnchor="middle"
            fontFamily="monospace"
          >
            24
          </text>
          <path d="M6 16c1.2 1.3 2.4 1.3 3.6 0s2.4-1.3 3.6 0 2.4 1.3 3.6 0" strokeWidth="1.4" stroke="#38bdf8" />
          <path d="M8 19c1.2 1 2.4 1 3.6 0s2.4-1 3.6 0" strokeWidth="1.4" stroke="#818cf8" />
        </svg>
      )}
    </div>
  );
};
