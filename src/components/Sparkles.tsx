import { useEffect, useRef } from "react";

// Navy and gold glitter on the pearl background. The pointer nudges nearby
// sparkles away; clicking on the background (not on a button or link) pops
// the ones under it. A page reload brings them all back.
const COLORS = ["#c9a85a", "#e3c77d", "#b8964a", "#1f3a7a", "#2c4a94"];
const INTERACTIVE = "a,button,input,textarea,select,label,summary,[role=button],[role=dialog]";

type Sparkle = {
  x: number; // resting position
  y: number;
  dx: number; // current push away from rest
  dy: number;
  r: number;
  color: string;
  star: boolean;
  phase: number;
  speed: number;
  pop: number; // > 0 while bursting, then removed
};

export function Sparkles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let sparkles: Sparkle[] = [];
    const pointer = { x: -1e4, y: -1e4 };

    const make = (): Sparkle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      dx: 0,
      dy: 0,
      r: 1.2 + Math.random() * 2.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      star: Math.random() < 0.45,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.4,
      pop: 0,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const oldW = w;
      const oldH = h;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(170, Math.round((w * h) / 9000));
      if (!oldW) sparkles = Array.from({ length: target }, make);
      else {
        // Keep popped ones popped: rescale positions instead of starting over.
        for (const s of sparkles) {
          s.x *= w / oldW;
          s.y *= h / oldH;
        }
      }
    };

    const drawStar = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y - r * 2.2);
      ctx.quadraticCurveTo(x, y, x + r * 2.2, y);
      ctx.quadraticCurveTo(x, y, x, y + r * 2.2);
      ctx.quadraticCurveTo(x, y, x - r * 2.2, y);
      ctx.quadraticCurveTo(x, y, x, y - r * 2.2);
      ctx.fill();
    };

    let raf = 0;
    const frame = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of sparkles) {
        // Push away from the pointer, then ease back to rest.
        const px = s.x + s.dx - pointer.x;
        const py = s.y + s.dy - pointer.y;
        const d2 = px * px + py * py;
        if (d2 < 90 * 90 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = (90 - d) / 90;
          s.dx += (px / d) * f * 6;
          s.dy += (py / d) * f * 6;
        }
        s.dx *= 0.92;
        s.dy *= 0.92;

        const twinkle = still
          ? 0.8
          : 0.45 + 0.55 * Math.abs(Math.sin((t / 1000) * s.speed + s.phase));
        let r = s.r;
        let alpha = twinkle * 0.75;
        if (s.pop > 0) {
          s.pop += 0.06;
          r = s.r * (1 + s.pop * 2.5);
          alpha = Math.max(0, 1 - s.pop);
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        const x = s.x + s.dx;
        const y = s.y + s.dy;
        if (s.star) drawStar(x, y, r);
        else {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      sparkles = sparkles.filter((s) => s.pop < 1);
      if (!still) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (still) frame(performance.now());
    };
    const onLeave = () => {
      pointer.x = pointer.y = -1e4;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.(INTERACTIVE)) return;
      for (const s of sparkles) {
        const x = s.x + s.dx - e.clientX;
        const y = s.y + s.dy - e.clientY;
        if (s.pop === 0 && x * x + y * y < 22 * 22) s.pop = 0.01;
      }
      if (still) {
        sparkles = sparkles.filter((s) => s.pop === 0);
        frame(performance.now());
      }
    };
    // Pause while the tab is hidden.
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !still) raf = requestAnimationFrame(frame);
    };

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 print:hidden"
    />
  );
}
