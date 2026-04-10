// client/src/components/GradientBackground.jsx
import { useEffect, useRef } from 'react';

const BLOBS = [
  { x: 0.15, y: 0.25, size: 0.55, color: [99, 102, 241],  speed: 0.28, phase: 0.0 },
  { x: 0.82, y: 0.18, size: 0.50, color: [139, 92, 246],  speed: 0.35, phase: 1.8 },
  { x: 0.55, y: 0.78, size: 0.48, color: [6, 182, 212],   speed: 0.22, phase: 3.5 },
  { x: 0.72, y: 0.50, size: 0.42, color: [236, 72, 153],  speed: 0.30, phase: 2.2 },
  { x: 0.28, y: 0.65, size: 0.38, color: [124, 58, 237],  speed: 0.18, phase: 4.1 },
];

export default function GradientBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      t += 0.004;
      const W = canvas.width, H = canvas.height;

      // Deep dark base
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, W, H);

      // Layer blobs with 'lighter' blending (like Stripe)
      ctx.globalCompositeOperation = 'lighter';

      BLOBS.forEach(blob => {
        const bx = (blob.x + Math.sin(t * blob.speed + blob.phase) * 0.18) * W;
        const by = (blob.y + Math.cos(t * blob.speed + blob.phase + 1) * 0.14) * H;
        const br = blob.size * Math.min(W, H) * 0.85;

        const [r, g, b] = blob.color;
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        grad.addColorStop(0.0, `rgba(${r},${g},${b},0.28)`);
        grad.addColorStop(0.4, `rgba(${r},${g},${b},0.10)`);
        grad.addColorStop(1.0, `rgba(${r},${g},${b},0.00)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });

      // Reset blend mode
      ctx.globalCompositeOperation = 'source-over';

      // Edge vignette
      const vignette = ctx.createRadialGradient(
        W / 2, H / 2, H * 0.2,
        W / 2, H / 2, Math.max(W, H) * 0.75
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(3,5,15,0.55)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
