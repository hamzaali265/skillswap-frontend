import React from 'react';

const Input = React.forwardRef(({ 
  label,
  error,
  icon: Icon,
  multiline = false,
  maxRows = 4,
  className = '',
  ...props 
}, ref) => {
  const inputClasses = `
    w-full px-4 py-3 border rounded-xl transition-all duration-200
    focus:ring-4 focus:ring-primary-100 focus:border-primary-500
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-300'}
    ${Icon && !multiline ? 'pl-12' : ''}
    ${className}
  `;
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && !multiline && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        {multiline ? (
          <textarea 
            ref={ref}
            className={inputClasses}
            rows={1}
            style={{ 
              resize: 'none',
              minHeight: '44px',
              maxHeight: `${maxRows * 44}px`
            }}
            {...props}
          />
        ) : (
          <input 
            ref={ref}
            className={inputClasses}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
