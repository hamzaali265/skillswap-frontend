import React from 'react';
import { getStatusColor } from '../../utils/helpers';

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  status, 
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
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
  
  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm`}
      />
      {status && (
        <div className={`absolute ${statusPositions[size]} ${statusSizes[size]} ${getStatusColor(status)} rounded-full border-2 border-white`} />
      )}
    </div>
  );
};

export default Avatar;
