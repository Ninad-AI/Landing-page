'use client';

import { useEffect, useRef } from 'react';

interface ParticleOrbProps {
  size?: number;
  particleCount?: number;
  className?: string;
}

/**
 * Fibonacci-spiral particle sphere on canvas. Idles with a slow yaw and a
 * breathing pulse; the pointer tilts it and pushes nearby particles, with a
 * spring pulling each one back to its shell position.
 */
export default function ParticleOrb({ size = 260, particleCount = 1300, className }: ParticleOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const SIZE = size;
    const CX = size / 2;
    const CY = size / 2;
    const R = size * 0.3;
    const FOV = size * (340 / 260);
    const COUNT = particleCount;
    const INFLUENCE = size * (62 / 260);
    const TAU = Math.PI * 2;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = SIZE * dpr;
      canvas!.height = SIZE * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const bx = new Float32Array(COUNT);
    const by = new Float32Array(COUNT);
    const bz = new Float32Array(COUNT);
    const rad = new Float32Array(COUNT);
    const psize = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);

    const dx = new Float32Array(COUNT);
    const dy = new Float32Array(COUNT);
    const vx = new Float32Array(COUNT);
    const vy = new Float32Array(COUNT);
    const sx = new Float32Array(COUNT);
    const sy = new Float32Array(COUNT);
    const lit = new Float32Array(COUNT);

    const bxProj = new Float32Array(COUNT);
    const byProj = new Float32Array(COUNT);
    const bzProj = new Float32Array(COUNT);
    const bsProj = new Float32Array(COUNT);

    const GOLDEN = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const th = GOLDEN * i;
      bx[i] = Math.cos(th) * ring;
      by[i] = y;
      bz[i] = Math.sin(th) * ring;

      // most sit on the shell; a fifth float inside so the orb has a core
      rad[i] = i % 5 === 0 ? R * (0.35 + Math.random() * 0.5) : R * (0.95 + Math.random() * 0.05);

      psize[i] = 0.55 + Math.random() * 1.15;
      seed[i] = Math.random() * TAU;
      sx[i] = CX;
      sy[i] = CY;
    }

    const pointer = { x: 0, y: 0, near: 0, active: false };

    function track(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * SIZE;
      const y = ((e.clientY - rect.top) / rect.height) * SIZE;
      pointer.x = x;
      pointer.y = y;
      const d = Math.hypot(x - CX, y - CY);
      pointer.active = d < R + 96;
    }
    const clearActive = () => {
      pointer.active = false;
    };

    window.addEventListener('pointermove', track, { passive: true });
    window.addEventListener('pointerdown', track, { passive: true });
    window.addEventListener('pointerleave', clearActive);
    canvas.addEventListener('pointerleave', clearActive);

    let yaw = 0.6;
    const pitch = -0.12;
    let tiltX = 0;
    let tiltY = 0;

    function drawGlow(energy: number) {
      const g = ctx!.createRadialGradient(CX, CY, R * 0.15, CX, CY, R * 1.85);
      const s = 0.16 + energy * 0.14;
      g.addColorStop(0, `rgba(139,96,255,${s})`);
      g.addColorStop(0.45, `rgba(96,54,214,${s * 0.42})`);
      g.addColorStop(1, 'rgba(80,44,190,0)');
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, SIZE, SIZE);
    }

    let prev = performance.now();
    let rafId = 0;

    function frame(now: number) {
      const dt = Math.min(48, now - prev);
      prev = now;
      const t = now;

      const pd = pointer.active ? Math.hypot(pointer.x - CX, pointer.y - CY) : 999;
      const targetNear = pointer.active ? Math.max(0, 1 - pd / (R + 96)) : 0;
      pointer.near += (targetNear - pointer.near) * 0.08;

      if (!reduceMotion) yaw += 0.00018 * dt * (1 + pointer.near * 0.55);
      const wantX = pointer.active ? (pointer.y - CY) / 260 : 0;
      const wantY = pointer.active ? (pointer.x - CX) / 260 : 0;
      tiltX += (wantX - tiltX) * 0.05;
      tiltY += (wantY - tiltY) * 0.05;

      const breath = 1 + Math.sin(t * 0.0009) * 0.022 + pointer.near * 0.04;

      const cosY = Math.cos(yaw + tiltY);
      const sinY = Math.sin(yaw + tiltY);
      const cosX = Math.cos(pitch + tiltX);
      const sinX = Math.sin(pitch + tiltX);

      ctx!.clearRect(0, 0, SIZE, SIZE);
      drawGlow(pointer.near);
      ctx!.globalCompositeOperation = 'lighter';

      const order: number[] = [];
      for (let i = 0; i < COUNT; i++) {
        const shimmer = 1 + Math.sin(t * 0.0012 + seed[i]) * 0.03;
        const r = rad[i] * breath * shimmer;

        // rotate: yaw about Y, then pitch about X
        const x = bx[i] * r;
        const y = by[i] * r;
        const z = bz[i] * r;
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const persp = FOV / (FOV - z2);
        let px = CX + x1 * persp;
        let py = CY + y1 * persp;

        // pointer force, measured against where the particle was last frame
        if (pointer.active) {
          const ox = sx[i] - pointer.x;
          const oy = sy[i] - pointer.y;
          const d = Math.hypot(ox, oy);
          if (d < INFLUENCE) {
            const f = 1 - d / INFLUENCE;
            const push = f * f * 3.4;
            const inv = d > 0.001 ? 1 / d : 0;
            vx[i] += ox * inv * push;
            vy[i] += oy * inv * push;
            lit[i] = Math.min(1, lit[i] + f * 0.5);
          }
        }

        // spring the displacement back to zero
        vx[i] += -dx[i] * 0.055;
        vy[i] += -dy[i] * 0.055;
        vx[i] *= 0.88;
        vy[i] *= 0.88;
        dx[i] += vx[i];
        dy[i] += vy[i];
        lit[i] *= 0.94;

        px += dx[i];
        py += dy[i];
        sx[i] = px;
        sy[i] = py;

        order.push(i);
        bxProj[i] = px;
        byProj[i] = py;
        bzProj[i] = z2;
        bsProj[i] = psize[i] * persp;
      }

      order.sort((a, b) => bzProj[a] - bzProj[b]);

      for (let k = 0; k < COUNT; k++) {
        const i = order[k];
        const depth = 0.28 + ((bzProj[i] + R) / (R * 2)) * 0.72;
        const l = lit[i];
        const a = Math.min(1, (0.3 + depth * 0.55) * (1 + l * 0.9));

        ctx!.beginPath();
        ctx!.arc(bxProj[i], byProj[i], Math.max(0.3, bsProj[i] * (1 + l * 0.4)), 0, TAU);

        if (l > 0.12) {
          ctx!.fillStyle = `rgba(${226 - l * 10},${214 + l * 30},255,${a})`;
        } else if (bzProj[i] > R * 0.55) {
          ctx!.fillStyle = `rgba(214,196,255,${a * 0.9})`;
        } else {
          ctx!.fillStyle = `rgba(132,86,232,${a})`;
        }
        ctx!.fill();
      }

      ctx!.globalCompositeOperation = 'source-over';
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', track);
      window.removeEventListener('pointerdown', track);
      window.removeEventListener('pointerleave', clearActive);
      canvas.removeEventListener('pointerleave', clearActive);
    };
  }, [size, particleCount]);

  return <canvas ref={canvasRef} style={{ width: size, height: size, touchAction: 'none' }} className={className} />;
}
