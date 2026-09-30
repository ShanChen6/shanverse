"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Thời gian sống của đuôi (ms). Lớn hơn = đuôi dài hơn */
  lifetime?: number;
  /** Độ dày tối đa ở đầu sao chổi (px) */
  maxWidth?: number;
  /** Độ "trễ" của đầu so với chuột, 0..1. Nhỏ hơn = trễ hơn, đuôi cong/uốn nhiều hơn */
  follow?: number;
  /** Hue (HSL) ở đầu và ở đuôi. 48 = vàng, 24 = cam */
  headHue?: number;
  tailHue?: number;
  /** Độ mạnh vầng sáng (px) */
  glow?: number;
};

type Point = { x: number; y: number; t: number };

export default function CursorTrail({
  lifetime = 650,
  maxWidth = 7,
  follow = 0.22,
  headHue = 48,
  tailHue = 22,
  glow = 18,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Không chạy trên thiết bị cảm ứng hoặc khi người dùng muốn giảm chuyển động
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!finePointer || reduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const mouse = { x: 0, y: 0, active: false };
    const head = { x: 0, y: 0 };
    let points: Point[] = [];
    let raf = 0;
    let running = false;
    let last = performance.now();

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!mouse.active) {
        // lần di chuột đầu tiên: đặt đầu tại chỗ, tránh vệt kéo từ góc (0,0)
        head.x = mouse.x;
        head.y = mouse.y;
        mouse.active = true;
      }
      start();
    };

    const frame = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;

      // Đầu sao chổi đuổi theo chuột với độ trễ (không phụ thuộc FPS)
      const k = 1 - Math.pow(1 - follow, dt / 16.667);
      head.x += (mouse.x - head.x) * k;
      head.y += (mouse.y - head.y) * k;

      const prev = points[points.length - 1];
      if (!prev || Math.hypot(head.x - prev.x, head.y - prev.y) > 0.5) {
        points.push({ x: head.x, y: head.y, t: now });
      }
      points = points.filter((p) => now - p.t < lifetime);

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const life = 1 - (now - p1.t) / lifetime; // 1 = mới, 0 = sắp biến mất
        if (life <= 0) continue;

        const taper = Math.pow(life, 1.6); // thon dần về đuôi
        const hue = tailHue + (headHue - tailHue) * life;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineWidth = Math.max(0.5, maxWidth * taper);
        ctx.strokeStyle = `hsla(${hue}, 100%, ${55 + 15 * life}%, ${life})`;
        ctx.shadowColor = `hsla(${hue}, 100%, 55%, ${0.9 * life})`;
        ctx.shadowBlur = glow * life;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Dừng vòng lặp khi đuôi đã tan hết và đầu đã tới chuột
      const settled =
        points.length === 0 &&
        Math.hypot(mouse.x - head.x, mouse.y - head.y) < 0.5;
      if (settled) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    function start() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [lifetime, maxWidth, follow, headHue, tailHue, glow]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
