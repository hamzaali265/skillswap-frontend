import React from 'react';

const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'rounded-2xl border transition-all duration-200';
  
  const variants = {
    default: 'bg-white border-gray-100 shadow-card hover:shadow-card-hover',
    compact: 'bg-white border-gray-100 shadow-sm p-4',
    glass: 'bg-white/80 backdrop-blur-sm border-white/20 shadow-xl',
    gradient: 'bg-gradient-to-br from-primary-500 to-primary-600 text-white border-transparent'
  };
  
  const defaultPadding = variant === 'compact' ? '' : 'p-6';
  const classes = `${baseClasses} ${variants[variant]} ${defaultPadding} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
