'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MousePosContextType {
  mouseX: number;
  mouseY: number;
}

const MouseParallaxContext = createContext<MousePosContextType>({ mouseX: 0, mouseY: 0 });

interface MouseParallaxContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const MouseParallaxContainer: React.FC<MouseParallaxContainerProps> = ({
  children,
  className = '',
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <MouseParallaxContext.Provider value={{ mouseX: mousePos.x, mouseY: mousePos.y }}>
      <div className={`relative overflow-hidden ${className}`}>
        {children}
      </div>
    </MouseParallaxContext.Provider>
  );
};

export interface ParallaxLayerProps {
  factor?: number; // Depth multiplier e.g. 0.02 (bg), 0.05 (aura), 0.08 (character), 0.12 (foreground)
  children: React.ReactNode;
  className?: string;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  factor = 0.05,
  children,
  className = '',
}) => {
  const { mouseX, mouseY } = useContext(MouseParallaxContext);

  const offsetX = mouseX * factor * 50;
  const offsetY = mouseY * factor * 50;

  return (
    <motion.div
      animate={{
        x: offsetX,
        y: offsetY,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 120, mass: 0.5 }}
      className={`w-full h-full ${className}`}
    >
      {children}
    </motion.div>
  );
};
