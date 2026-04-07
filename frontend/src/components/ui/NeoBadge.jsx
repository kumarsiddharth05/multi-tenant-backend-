import React from 'react';

/**
 * A standard Neo-Brutalist Badge (Pill) component.
 * High contrast, punchy font, and unignorable borders.
 */
export const NeoBadge = ({ 
  children, 
  color = '#000', 
  bg = '#fff', 
  className = '', 
  ...props 
}) => {
  return (
    <div
      className={`
        inline-flex items-center justify-center 
        px-3 py-1 rounded-full border-[2px] border-black 
        font-black uppercase tracking-[0.2em] text-[8px] 
        transition-all group relative overflow-hidden
        ${className}
      `}
      style={{ backgroundColor: bg, color: color, borderColor: color }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </div>
  );
};
