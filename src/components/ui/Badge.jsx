import React from 'react';
import { getSkillLevelColor, getSkillLevelLabel } from '../../utils/helpers';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-lg transition-colors duration-200';
  
  const variants = {
    default: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
    offered: 'bg-secondary-green/10 text-secondary-green',
    wanted: 'bg-secondary-orange/10 text-secondary-orange',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    error: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
};

// Specialized skill badge component
export const SkillBadge = ({ skill, showLevel = false, className = '' }) => {
  const levelColor = showLevel ? getSkillLevelColor(skill.level) : '';
  const levelLabel = showLevel ? getSkillLevelLabel(skill.level) : '';
  
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Badge variant="default" className="hover:bg-primary-100">
        {skill.name}
      </Badge>
      {showLevel && (
        <Badge variant="info" size="sm" className={levelColor}>
          {levelLabel}
        </Badge>
      )}
    </div>
  );
};

export default Badge;
