import React from 'react';

/**
 * A Neo-Brutalist Button with the "Brutal Jolt" effect.
 * High contrast, thick borders, and tactile transition.
 */
export const NeoButton = ({
  children,
  variant = 'primary',
  color = '#000',
  textColor = 'black',
  bg = 'white',
  borderColor = 'black',
  showDots = true,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = `
    flex items-center justify-center gap-2 px-6 py-3 
    border-[3px] rounded-full
    font-black text-xs uppercase tracking-widest 
    transition-all duration-150 relative overflow-hidden
  `;

  // Custom shadow logic utilizing CSS variables for dynamic Tailwind support
  const hoverClasses = `
    hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--neo-shadow-color)]
    active:translate-x-1 active:translate-y-1 active:shadow-none
  `;

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${hoverClasses} ${className}`}
      style={{ 
        backgroundColor: bg, 
        color: textColor, 
        borderColor: borderColor,
        '--neo-shadow-color': color,
        boxShadow: `4px 4px 0px 0px var(--neo-shadow-color)`
      }}
      {...props}
    >
      {/* Optional subtle dot grid overlay for premium feel */}
      {showDots && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '8px 8px',
          }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2 font-black">{children}</span>
    </button>
  );
};
