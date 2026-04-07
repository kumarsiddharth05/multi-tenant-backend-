import React from 'react';

export const VegIcon = ({ size = 22 }) => (
  <div 
    style={{ width: size, height: size }} 
    className="border-[2.5px] border-[#34A853] rounded-[4px] flex items-center justify-center bg-white shrink-0 shadow-[1px_1px_0px_rgba(0,0,0,1)]"
  >
    <div className="w-[65%] h-[65%] rounded-full bg-[#34A853]" />
  </div>
);

export const NonVegIcon = ({ size = 22 }) => (
  <div 
    style={{ width: size, height: size }} 
    className="border-[2.5px] border-[#EA4335] rounded-[4px] flex items-center justify-center bg-white shrink-0 shadow-[1px_1px_0px_rgba(0,0,0,1)]"
  >
    <div 
      style={{ 
        width: 0, 
        height: 0, 
        borderLeft: `${size * 0.28}px solid transparent`,
        borderRight: `${size * 0.28}px solid transparent`,
        borderBottom: `${size * 0.5}px solid #EA4335`
      }} 
    />
  </div>
);

const DietaryIcon = ({ isVeg, size = 22 }) => {
  return isVeg ? <VegIcon size={size} /> : <NonVegIcon size={size} />;
};

export default DietaryIcon;
