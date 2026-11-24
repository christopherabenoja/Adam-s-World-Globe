import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  s: number;
  c: string;
  r: number;
  life: number;
}

interface ConfettiOverlayProps {
  burstKey: number;
  accentColor: string;
}

export function ConfettiOverlay({ burstKey, accentColor }: ConfettiOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (burstKey === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const palette = [accentColor, '#ffffff', '#FFD23F', '#FF5964', '#35C26B', '#2EC4F1'];
    const wasEmpty = particlesRef.current.length === 0;

    for (let i = 0; i < 120; i++) {
      particlesRef.current.push({
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.45,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 4,
        s: 6 + Math.random() * 8,
        c: palette[i % palette.length],
        r: Math.random() * Math.PI * 2,
        life: 0,
      });
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const list = particlesRef.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.vy += 0.4;
        p.x += p.vx;
        p.y += p.vy;
        p.r += 0.2;
        p.life += 1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();

        if (p.y >= canvas.height + 24 || p.life >= 200) {
          list.splice(i, 1);
        }
      }

      if (list.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafRef.current = 0;
      }
    };

    if (wasEmpty && !rafRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [burstKey, accentColor]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
    />
  );
}
