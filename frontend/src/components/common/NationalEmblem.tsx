import React from 'react';
import emblemImg from '../../assets/emblem-india.png';

export const NationalEmblem: React.FC<{ className?: string }> = ({ className = "h-11 w-auto" }) => {
  return (
    <img
      src={emblemImg}
      alt="State Emblem of India"
      className={`${className} object-contain`}
      draggable={false}
    />
  );
};
