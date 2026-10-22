import { useEffect, useRef } from "react";

// Navy and gold glitter on the pearl background. The pointer pushes nearby
// sparkles away; clicking on the background (not on a button or link) pops
// the ones under it. A page reload brings them all back.
const COLORS = ["#c9a85a", "#e3c77d", "#b8964a", "#1f3a7a", "#2c4a94"];
// Text and panels keep a quiet background: no sparkles are drawn behind them.
const QUIET =
  "main h1, main h2, main h3, main h4, main p, main li, main label, main dt, main dd, main blockquote, main .rounded-2xl, main .rounded-3xl, main .rounded-\\[2rem\\], footer, header, [data-quiet]";
const QUIET_PAD = 6;
const CELL = 12; // quiet-zone grid cell, px
const INTERACTIVE = "a,button,input,textarea,select,label,summary,[role=button],[role=dialog]";
const PUSH_RADIUS = 110;
const PUSH_DISTANCE = 42;
const SIZES = [1.2, 1.7, 2.2, 2.7, 3.2, 3.8];
// Twinkle brightness steps baked into the sprites (no per-draw alpha changes).
const ALPHAS = [0.2, 0.32, 0.44, 0.56, 0.68, 0.8];

type Sparkle = {
  x: number; // resting position
  y: number;
  dx: number; // current push away from rest
  dy: number;
  sprite: number;
  phase: number;
  speed: number;
  pop: number; // > 0 while bursting, then removed
};

// Each colour/shape/size is drawn once to a small canvas and then stamped,
// which is far cheaper than drawing thousands of paths every frame.
// sprites[shape][alphaStep]: shape = colour × star/dot × size.
function makeSprites(dpr: number) {
  const sprites: { img: HTMLCanvasElement; half: number }[][] = [];
  for (const color of COLORS)
    for (const star of [false, true])
      for (const r of SIZES) {
        const steps: { img: HTMLCanvasElement; half: number }[] = [];
        for (const alpha of ALPHAS) {
        const half = Math.ceil(r * (star ? 2.4 : 1.2)) + 1;
        const c = document.createElement("canvas");
        c.width = c.height = Math.ceil(half * 2 * dpr);
        const g = c.getContext("2d")!;
        g.scale(dpr, dpr);
        g.globalAlpha = alpha;
        g.fillStyle = color;
        g.beginPath();
        if (star) {
          const k = r * 2.2;
          g.moveTo(half, half - k);
          g.quadraticCurveTo(half, half, half + k, half);
          g.quadraticCurveTo(half, half, half, half + k);
          g.quadraticCurveTo(half, half, half - k, half);
          g.quadraticCurveTo(half, half, half, half - k);
        } else g.arc(half, half, r, 0, Math.PI * 2);
        g.fill();
        steps.push({ img: c, half });
        }
        sprites.push(steps);
      }
  return sprites;
}

export function Sparkles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Tiny shapes look the same at 1x, and a full-screen canvas costs much less.
    const dpr = 1;
    const sprites = makeSprites(dpr);
    let w = 0;
    let h = 0;
    let sparkles: Sparkle[] = [];
    const pointer = { x: -1e4, y: -1e4 };

    // Quiet zones as a coarse grid, measured now and then and shifted by the
    // scroll in between, so scrolling never forces a layout every frame.
    let cols = 0;
    let rows = 0;
    let grid = new Uint8Array(0);
    let measuredScroll = 0;
    let quietDirty = true;
    const measureQuiet = () => {
      quietDirty = false;
      measuredScroll = window.scrollY;
      cols = Math.ceil(w / CELL);
      rows = Math.ceil((h * 3) / CELL); // a screen above and below too
      grid = new Uint8Array(cols * rows);
      for (const el of document.querySelectorAll(QUIET)) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.bottom < -h || r.top > h * 2) continue;
        const c0 = Math.max(0, Math.floor((r.left - QUIET_PAD) / CELL));
        const c1 = Math.min(cols - 1, Math.floor((r.right + QUIET_PAD) / CELL));
        const r0 = Math.max(0, Math.floor((r.top - QUIET_PAD + h) / CELL));
        const r1 = Math.min(rows - 1, Math.floor((r.bottom + QUIET_PAD + h) / CELL));
        for (let y = r0; y <= r1; y++) grid.fill(1, y * cols + c0, y * cols + c1 + 1);
      }
    };
    const inQuiet = (x: number, y: number) => {
      const gy = Math.floor((y + window.scrollY - measuredScroll + h) / CELL);
      const gx = Math.floor(x / CELL);
      return gx >= 0 && gx < cols && gy >= 0 && gy < rows && grid[gy * cols + gx] === 1;
    };

    const make = (): Sparkle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      dx: 0,
      dy: 0,
      sprite: Math.floor(Math.random() * sprites.length),
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.4,
      pop: 0,
    });

    const resize = () => {
      const oldW = w;
      const oldH = h;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      quietDirty = true;
      const target = Math.min(2700, Math.round((w * h) / 560));
      if (!oldW) sparkles = Array.from({ length: target }, make);
      else {
        // Keep popped ones popped: rescale positions instead of starting over.
        for (const s of sparkles) {
          s.x *= w / oldW;
          s.y *= h / oldH;
        }
      }
    };

    // Slower computers get fewer sparkles rather than a sluggish page.
    let slowFrames = 0;
    let lastT = 0;

    // Twinkling alone is smooth at ~30fps; full speed only while the pointer moves.
    let lastDraw = 0;
    let lastMove = 0;

    let raf = 0;
    const frame = (t: number) => {
      if (!still && t - lastMove > 400 && t - lastDraw < 30) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastDraw = t;
      // Switched off in the accessibility menu: draw nothing (CSS hides the canvas).
      if (document.documentElement.classList.contains("a11y-no-motion")) {
        raf = requestAnimationFrame(frame);
        return;
      }
      if (quietDirty) measureQuiet();
      if (!still && lastT) {
        slowFrames = t - lastT > 45 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
        if (slowFrames > 20 && sparkles.length > 400) {
          sparkles = sparkles.filter((_, i) => i % 4 !== 0);
          slowFrames = 0;
        }
      }
      lastT = t;

      ctx.clearRect(0, 0, w, h);
      const ease = still ? 1 : 0.22;
      for (const s of sparkles) {
        // Ease towards a spot pushed away from the pointer, or back to rest.
        const px = s.x - pointer.x;
        const py = s.y - pointer.y;
        const d2 = px * px + py * py;
        let tx = 0;
        let ty = 0;
        if (d2 < PUSH_RADIUS * PUSH_RADIUS) {
          const d = Math.sqrt(d2) || 1;
          const f = (PUSH_RADIUS - d) / PUSH_RADIUS;
          tx = (px / d) * f * PUSH_DISTANCE;
          ty = (py / d) * f * PUSH_DISTANCE;
        }
        s.dx += (tx - s.dx) * ease;
        s.dy += (ty - s.dy) * ease;
        const x = s.x + s.dx;
        const y = s.y + s.dy;

        const steps = sprites[s.sprite]!;
        if (s.pop > 0) {
          // Bursting: grow and fade (rare, so the slower scaled draw is fine).
          s.pop += 0.06;
          const sp = steps[steps.length - 1]!;
          const size = sp.half * 2 * (1 + s.pop * 2.5);
          ctx.globalAlpha = Math.max(0, 1 - s.pop);
          ctx.drawImage(sp.img, x - size / 2, y - size / 2, size, size);
          ctx.globalAlpha = 1;
          continue;
        }
        if (inQuiet(x, y)) continue;
        const level = still
          ? 3
          : Math.min(
              ALPHAS.length - 1,
              Math.floor(Math.abs(Math.sin((t / 1000) * s.speed + s.phase)) * ALPHAS.length),
            );
        const sp = steps[level]!;
        // Whole pixels: no resampling, much cheaper to draw.
        ctx.drawImage(sp.img, (x - sp.half) | 0, (y - sp.half) | 0);
      }
      if (sparkles.some((s) => s.pop >= 1)) sparkles = sparkles.filter((s) => s.pop < 1);
      if (!still) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      lastMove = performance.now();
      if (still) frame(lastMove);
    };
    const onLeave = () => {
      pointer.x = pointer.y = -1e4;
      if (still) frame(performance.now());
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
      lastT = 0;
      if (!document.hidden && !still) raf = requestAnimationFrame(frame);
    };
    // Re-measure the quiet zones once scrolling settles, and now and then
    // (pages change as they load).
    let scrollTimer = 0;
    const onScroll = () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        quietDirty = true;
        if (still) frame(performance.now());
      }, 120);
    };
    const markQuiet = () => {
      quietDirty = true;
    };

    resize();
    raf = requestAnimationFrame(frame);
    const quietTimer = window.setInterval(markQuiet, 1000);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(quietTimer);
      window.clearTimeout(scrollTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
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
