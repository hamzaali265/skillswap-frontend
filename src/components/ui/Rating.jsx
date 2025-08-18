import React, { useState } from 'react';
import { Star } from 'lucide-react';

const Rating = ({ 
  value = 0, 
  maxValue = 5, 
  size = 'md', 
  readonly = false, 
  onChange,
  showValue = false,
  className = ''
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[...Array(maxValue)].map((_, index) => {
          const starValue = index + 1;
          const filled = starValue <= displayValue;
          
          return (
            <button
              key={index}
              type="button"
              disabled={readonly}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              className={`transition-colors duration-200 ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              }`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  filled 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-2">
          {value.toFixed(1)} / {maxValue}
        </span>
      )}
    </div>
  );
};

export default Rating;
