import React from 'react';

/**
 * A Neo-Brutalist Button with the "Brutal Jolt" effect.
 * High contrast, thick borders, and tactile transition.
 */
export const NeoButton = ({
  children,
  variant = 'primary',
  color = '#000',
  bg = 'white',
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = `
    flex items-center justify-center gap-2 px-6 py-3 
    border-[3px] border-black rounded-full 
    font-black text-xs uppercase tracking-widest 
    transition-all duration-150 relative overflow-hidden
  `;

  // Custom shadow based on the provided color
  const shadowClasses = `
    shadow-[4px_4px_0px_0px_${color}] 
    hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_${color}] 
    active:translate-x-1 active:translate-y-1 active:shadow-none
  `;

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${shadowClasses} ${className}`}
      style={{ backgroundColor: bg, color: variant === 'primary' ? 'black' : color }}
      {...props}
    >
      {/* Optional subtle dot grid overlay for premium feel */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};
