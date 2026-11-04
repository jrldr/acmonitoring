import React, { useState } from 'react';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 'md' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }[size];

  // Resolve correct path on GitHub Pages (e.g. /acmonitoring/ or /acmonitoring)
  const getLogoSrc = () => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.includes('/acmonitoring')) {
        return '/acmonitoring/icon-192.png';
      }
    }
    return './icon-192.png';
  };

  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0 overflow-hidden ${sizeClasses} ${className}`}
      title="AC Power Tracker"
    >
      {!imageError ? (
        <img
          src={getLogoSrc()}
          alt="AC Power Tracker"
          className="w-full h-full object-contain p-1.5 transition-transform duration-200 hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        /* High-fidelity Vector Fallback: Modern AC Unit with Digital Display */
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
          aria-label="AC Power Tracker Icon"
        >
          {/* AC Indoor Wall Unit */}
          <rect x="2" y="4" width="20" height="9" rx="2" fill="white" fillOpacity="0.18" />
          <line x1="5" y1="7" x2="19" y2="7" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="5" y1="9.5" x2="13" y2="9.5" strokeWidth="1.2" strokeOpacity="0.8" />
          {/* Digital LED Display 24 */}
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
          {/* Air flow waves */}
          <path d="M6 16c1.2 1.3 2.4 1.3 3.6 0s2.4-1.3 3.6 0 2.4 1.3 3.6 0" strokeWidth="1.4" stroke="#38bdf8" />
          <path d="M8 19c1.2 1 2.4 1 3.6 0s2.4-1 3.6 0" strokeWidth="1.4" stroke="#818cf8" />
        </svg>
      )}
    </div>
  );
};
