import React from 'react';
import { getStatusColor } from '../../utils/helpers';

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  status, 
  fallback,
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };
  
  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };
  
  const statusPositions = {
    sm: '-bottom-0.5 -right-0.5',
    md: '-bottom-1 -right-1',
    lg: '-bottom-1.5 -right-1.5',
    xl: '-bottom-2 -right-2'
  };

  // Generate initials from fallback text
  const getInitials = (text) => {
    if (!text) return '?';
    return text
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate background color based on text
  const getBackgroundColor = (text) => {
    if (!text) return 'bg-gray-400';
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };
  
  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm`}
        />
      ) : (
        <div 
          className={`${sizes[size]} ${textSizes[size]} ${getBackgroundColor(fallback)} rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-semibold`}
        >
          {getInitials(fallback)}
        </div>
      )}
      {status && (
        <div className={`absolute ${statusPositions[size]} ${statusSizes[size]} ${getStatusColor(status)} rounded-full border-2 border-white`} />
      )}
    </div>
  );
};

export default Avatar;
