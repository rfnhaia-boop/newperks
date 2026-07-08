"use client";

import { useEffect, useRef } from "react";

type Peca = {
  x: number;
  y: number;
  w: number;
  h: number;
  cor: string;
  vy: number;
  vx: number;
  rot: number;
  vrot: number;
};

/** Chuva de confete em canvas — monta, toca por `duracao`ms e se limpa. */
export default function Confete({ duracao = 4500 }: { duracao?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cores = ["#7c3aed", "#a855f7", "#ec4899", "#f59e0b", "#10b981", "#38bdf8", "#ffffff"];
    const pecas: Peca[] = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.6,
      w: 5 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      cor: cores[(Math.random() * cores.length) | 0],
      vy: 2.2 + Math.random() * 3.2,
      vx: -1.5 + Math.random() * 3,
      rot: Math.random() * Math.PI,
      vrot: -0.12 + Math.random() * 0.24,
    }));

    let rodando = true;
    const inicio = Date.now();

    function frame() {
      if (!rodando || !ctx || !canvas) return;
      const t = Date.now() - inicio;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of pecas) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.y * 0.02) * 0.8;
        p.rot += p.vrot;
        if (p.y > canvas.height + 20) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        // some suave nos últimos 800ms
        ctx.globalAlpha = t > duracao - 800 ? Math.max(0, (duracao - t) / 800) : 1;
        ctx.fillStyle = p.cor;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (t < duracao) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    frame();
    return () => {
      rodando = false;
    };
  }, [duracao]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[90]" aria-hidden="true" />;
}
