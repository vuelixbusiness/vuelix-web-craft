import React from 'react';

interface PotIconProps {
  className?: string;
}

const PotIcon: React.FC<PotIconProps> = ({ className = "w-5 h-5" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Coin base */}
      <circle cx="60" cy="60" r="50" fill="gold" stroke="#d4af37" strokeWidth="6"/>
      
      {/* Inner shading */}
      <circle cx="60" cy="60" r="40" fill="#ffd700" stroke="#e6c200" strokeWidth="3"/>
      
      {/* Vuelix "V" */}
      <path d="M40 45 L60 85 L80 45 L70 45 L60 70 L50 45 Z" fill="purple"/>
    </svg>
  );
};

export default PotIcon;
