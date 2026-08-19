'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface EnergyRingsProps {
  color?: string;
  className?: string;
}

export const EnergyRings: React.FC<EnergyRingsProps> = ({
  color = '#FF6B00',
  className = '',
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.3, opacity: 0.8 }}
          animate={{ scale: [0.3, 1.8, 2.5], opacity: [0.8, 0.4, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 1.3,
            ease: 'easeOut',
          }}
          className="absolute w-72 h-72 rounded-full border-2 border-dashed pointer-events-none"
          style={{
            borderColor: color,
            boxShadow: `0 0 30px ${color}`,
          }}
        />
      ))}
    </div>
  );
};
