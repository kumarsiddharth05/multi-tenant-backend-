import React from 'react';

/**
 * A classic Neo-Brutalist Card container.
 * Base properties provide the standard thick black border and aggressive shadow.
 */
export const NeoCard = ({ 
  children, 
  className = '', 
  padding = 'p-6 sm:p-8', 
  bg = '#FFFFFF',
  rounded = 'rounded-[24px]',
  interactive = false,
  shadowColor = 'rgba(0,0,0,1)',
  ...props 
}) => {
  const baseClasses = `border-[3px] border-black ${rounded} ${padding} transition-all duration-200 relative overflow-hidden`;
  const staticShadow = `shadow-[6px_6px_0px_0px_var(--shadow-color,black)]`;
  const interactiveClasses = interactive 
    ? `hover:-translate-y-1.5 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_var(--shadow-color,black)] active:translate-x-1 active:translate-y-1 active:shadow-none`
    : '';

  return (
    <div 
      className={`${baseClasses} ${staticShadow} ${interactiveClasses} ${className}`}
      style={{ '--shadow-color': shadowColor, backgroundColor: bg, ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
};
