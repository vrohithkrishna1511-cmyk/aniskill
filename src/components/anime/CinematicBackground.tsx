'use client';

import React, { useRef, useEffect } from 'react';
import { GlobalFooter } from '../ui/GlobalFooter';

interface CinematicBackgroundProps {
  children?: React.ReactNode;
  theme?: 'orange' | 'cyan' | 'red' | 'purple';
  backgroundImage?: string;
  overlayOpacity?: string;
}

export const CinematicBackground: React.FC<CinematicBackgroundProps> = ({ 
  children, 
  theme = 'orange',
  backgroundImage,
  overlayOpacity = 'bg-black/20'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 45;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 1.2 - 0.2,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    let animId: number;
    const colorMap = {
      orange: '#FF6B00',
      cyan: '#00F0FF',
      red: '#FF2E54',
      purple: '#9D4EDD'
    };
    const activeColor = colorMap[theme] || '#FF6B00';

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < 0) {
          p.y = height + 5;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = activeColor;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = activeColor;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [theme]);

  return (
    <div className="relative min-h-screen w-full bg-[#07080B] text-slate-100 overflow-x-hidden">
      {/* Background Image Layer (Full Viewport, Crisp & Responsive) */}
      {backgroundImage && (
        <div 
          className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none z-0"
          style={{ backgroundImage: `url("${backgroundImage}")` }}
        />
      )}

      {/* Subtle Overlay Layer (20% Opacity) */}
      {backgroundImage ? (
        <div className={`fixed inset-0 ${overlayOpacity} pointer-events-none z-0`} />
      ) : (
        <>
          {/* Layer 1: Base Gradient Radial Glows */}
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
          <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-950/15 rounded-full blur-[160px] pointer-events-none z-0" />
        </>
      )}

      {/* Canvas Floating Particles Layer */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />

      {/* Layer 2: Subtle HUD Grid & Scanlines */}
      <div className="fixed inset-0 hud-grid opacity-10 pointer-events-none z-0" />
      <div className="fixed inset-0 hud-scanline opacity-15 pointer-events-none z-0" />

      {/* Page Content */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        <div className="flex-1">{children}</div>
        <GlobalFooter />
      </div>
    </div>
  );
};
