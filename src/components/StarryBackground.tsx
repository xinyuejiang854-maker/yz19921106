import React, { useEffect, useRef } from 'react';

export const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Star particles
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      alpha: number;
      alphaSpeed: number;
      color: string;
    }> = [];

    const starColors = ['#ffffff', '#e9d5ff', '#c084fc', '#fbcfe8', '#fef08a'];

    for (let i = 0; i < 160; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        alphaSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }

    // Floating wisteria petals / purple butterflies
    const petals: Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      angle: number;
      vAngle: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 24; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 6 + 4,
        vx: (Math.random() - 0.5) * 0.5 - 0.2,
        vy: Math.random() * 0.6 + 0.3,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.03,
        opacity: Math.random() * 0.4 + 0.2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw starry sky background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#090414');
      bgGrad.addColorStop(0.4, '#120826');
      bgGrad.addColorStop(0.8, '#1b0d38');
      bgGrad.addColorStop(1, '#0e061c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw faint nebula glow orbs
      const drawNebula = (cx: number, cy: number, r: number, colorStart: string) => {
        const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        radGrad.addColorStop(0, colorStart);
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      };

      drawNebula(width * 0.2, height * 0.25, width * 0.35, 'rgba(147, 51, 234, 0.12)');
      drawNebula(width * 0.8, height * 0.65, width * 0.4, 'rgba(168, 85, 247, 0.09)');
      drawNebula(width * 0.5, height * 0.9, width * 0.3, 'rgba(236, 72, 153, 0.06)');

      // Draw twinkling stars
      for (const s of stars) {
        s.alpha += s.alphaSpeed;
        if (s.alpha > 0.95 || s.alpha < 0.2) {
          s.alphaSpeed = -s.alphaSpeed;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
        ctx.fillStyle = s.color;
        ctx.shadowBlur = s.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw floating wisteria flower petals
      for (const p of petals) {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.vAngle;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#d8b4fe';
        ctx.beginPath();
        // Petal ellipse
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
};
