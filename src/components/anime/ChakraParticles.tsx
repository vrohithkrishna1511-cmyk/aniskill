'use client';

import React, { useEffect, useRef } from 'react';

interface ChakraParticlesProps {
  particleCount?: number;
  colorScheme?: 'orange' | 'cyan' | 'red' | 'gold';
  interactive?: boolean;
  className?: string;
}

export const ChakraParticles: React.FC<ChakraParticlesProps> = ({
  particleCount = 100,
  colorScheme = 'orange',
  interactive = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const colorsMap = {
    orange: ['#FF6B00', '#FF2E54', '#FFD700', '#FF4500'],
    cyan: ['#00F0FF', '#3B82F6', '#06B6D4', '#60A5FA'],
    red: ['#FF2E54', '#DC2626', '#FF6B00', '#991B1B'],
    gold: ['#FFD700', '#F59E0B', '#FEF08A', '#D97706'],
  };

  useEffect(() => {
    // Respect OS prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    const palette = colorsMap[colorScheme] || colorsMap.orange;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      baseAlpha: number;
      pulseSpeed: number;
      life: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const alpha = Math.random() * 0.7 + 0.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3.5 + 1,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -Math.random() * 1.8 - 0.5,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha,
        baseAlpha: alpha,
        pulseSpeed: Math.random() * 0.05 + 0.01,
        life: Math.random() * 100,
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Natural rising motion & horizontal drift
        p.x += p.vx + Math.sin(p.life * 0.05) * 0.5;
        p.y += p.vy;
        p.life += 1;

        // Alpha pulsing
        p.alpha = p.baseAlpha + Math.sin(p.life * p.pulseSpeed) * 0.25;
        if (p.alpha < 0.1) p.alpha = 0.1;

        // Mouse deflection interaction
        if (interactive) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const angle = Math.atan2(dy, dx);
            const force = (120 - dist) * 0.08;
            p.x += Math.cos(angle) * force;
            p.y += Math.sin(angle) * force;
          }
        }

        // Reset particle when floating past top boundary
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [particleCount, colorScheme, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-10 ${className}`}
    />
  );
};
