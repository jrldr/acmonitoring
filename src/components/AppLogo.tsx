import React, { useState } from 'react';
import acFlatIcon from '../assets/images/ac_flat_minimalist_icon_1793782384021.jpg';

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
      className={`relative bg-[#1c2260] border border-indigo-400/20 dark:border-indigo-400/30 flex items-center justify-center text-white shrink-0 overflow-hidden ${sizeClasses} ${className}`}
      title="AC Power Tracker"
    >
      {!imageError ? (
        <img
          src={acFlatIcon}
          alt="AC Power Tracker Minimalist Flat Icon"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Pure Minimalist Flat 2D Vector Graphic */
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-label="AC Power Tracker"
        >
          {/* Flat Indigo Background */}
          <rect width="100" height="100" fill="#1c2260" />

          {/* Minimalist White AC Unit Body */}
          <rect x="18" y="28" width="46" height="44" rx="6" fill="#ffffff" />
          
          {/* Inner Flat Dark Frame */}
          <rect x="23" y="34" width="36" height="32" rx="3" fill="#1c2260" />

          {/* Clean Flat Cyan Vent Slats */}
          <rect x="26" y="38" width="30" height="4.5" rx="1.5" fill="#00e5ff" />
          <rect x="26" y="45" width="30" height="4.5" rx="1.5" fill="#00e5ff" />
          <rect x="26" y="52" width="30" height="4.5" rx="1.5" fill="#00e5ff" />
          <rect x="26" y="59" width="30" height="4.5" rx="1.5" fill="#00e5ff" />

          {/* Minimalist Flat Lightning Bolt */}
          <path
            d="M74 24L56 54H68L64 78L84 46H71L74 24Z"
            fill="#ffffff"
          />
        </svg>
      )}
    </div>
  );
};

