import { useEffect, useRef, useState } from "react";
import { SIGNALS } from "../data/samples";
import { BINS } from "../lib/lanes";
import { fmtTime } from "../lib/format";
import type { Lanes, Moment, SignalId } from "../types";

const ROW = 38; // высота дорожки
const TOP = 24; // место под номера моментов
const C = { accent: "#FF5A1F", accentInk: "#160803", tick: "#8C95AB", base: "#39425E", axis: "#1C2338", off: "#3A4462", glow: "rgba(255, 90, 31, 0.16)" };

interface Props {
  lanes: Lanes;
  moments: Moment[];
  dur: number;
  reveal: Partial<Record<SignalId, number>>;
  shown: number;
  onMoment: (m: Moment) => void;
}

function momentBox(m: Moment, dur: number, W: number) {
  const x0 = (m.t / dur) * W;
  const x1 = ((m.t + m.len) / dur) * W;
  const w = Math.max(x1 - x0, 10);
  return { x: x0 + (x1 - x0) / 2 - w / 2 - 3, w: w + 6 };
}

/** Шкала шести сигналов по всему стриму с подсвеченными моментами. */
export function Timeline({ lanes, moments, dur, reveal, shown, onMoment }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const cv = ref.current!;
    const ro = new ResizeObserver(() => setWidth(cv.clientWidth));
    ro.observe(cv);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cv = ref.current;
    if (!cv || !width) return;
    const dpr = window.devicePixelRatio || 1;
    const W = width;
    const H = cv.clientHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    const g = cv.getContext("2d")!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);

    const visible = moments.slice(0, shown);
    const hot = new Set<number>();
    for (const m of visible) {
      const a = Math.floor((m.t / dur) * BINS);
      const b = Math.floor(((m.t + m.len) / dur) * BINS);
      for (let i = a - 1; i <= b + 1; i++) hot.add(i);
    }

    visible.forEach((m, k) => {
      const b = momentBox(m, dur, W);
      g.fillStyle = C.glow;
      g.fillRect(b.x, TOP - 4, b.w, ROW * SIGNALS.length + 4);
      const cx = b.x + b.w / 2;
      g.beginPath();
      g.arc(cx, 11, 10, 0, Math.PI * 2);
      g.fillStyle = C.accent;
      g.fill();
      g.fillStyle = C.accentInk;
      g.font = "700 11px Unbounded, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(String(k + 1), cx, 11.5);
    });

    const bw = W / BINS;
    SIGNALS.forEach((s, r) => {
      const base = TOP + (r + 1) * ROW - 6;
      g.fillStyle = C.axis;
      g.fillRect(0, base, W, 1);
      const arr = lanes[s.id];
      if (!arr) {
        g.fillStyle = C.off;
        g.font = "11px 'JetBrains Mono', monospace";
        g.textAlign = "left";
        g.textBaseline = "alphabetic";
        g.fillText("скоро", 6, base - 10);
        return;
      }
      const lim = Math.floor((reveal[s.id] ?? 0) * BINS);
      for (let i = 0; i < lim; i++) {
        const v = arr[i];
        if (!v) continue;
        const h = Math.max(2, v * (ROW - 12));
        g.fillStyle = hot.has(i) && v > 0.3 ? C.accent : v > 0.55 ? C.tick : C.base;
        g.fillRect(i * bw + bw * 0.15, base - h, Math.max(1, bw * 0.7), h);
      }
    });
  }, [lanes, moments, dur, reveal, shown, width]);

  const momentAt = (clientX: number) => {
    const cv = ref.current!;
    const r = cv.getBoundingClientRect();
    const x = clientX - r.left;
    return moments.slice(0, shown).findIndex((m) => {
      const b = momentBox(m, dur, r.width);
      return x >= b.x - 4 && x <= b.x + b.w + 4;
    });
  };

  const step = [600, 1800, 3600, 7200].find((s) => dur / s <= 7) ?? 7200;
  const ticks: number[] = [];
  for (let s = 0; s <= dur; s += step) ticks.push(s);

  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 sm:grid-cols-[96px_minmax(0,1fr)]">
      <div className="flex flex-col" style={{ paddingTop: TOP }}>
        {SIGNALS.map((s) => (
          <div key={s.id} className={`flex h-[38px] flex-none items-center text-[11px] sm:text-[13px] ${lanes[s.id] ? "text-soft" : "text-dim"}`}>
            {s.name}
          </div>
        ))}
      </div>
      <div className="relative min-w-0">
        <canvas
          ref={ref}
          aria-label="Сигналы по всему стриму"
          className="block h-[252px] w-full"
          onMouseMove={(e) => (e.currentTarget.style.cursor = momentAt(e.clientX) >= 0 ? "pointer" : "default")}
          onClick={(e) => {
            const k = momentAt(e.clientX);
            if (k >= 0) onMoment(moments[k]);
          }}
        />
        <div className="relative h-[18px] font-mono text-[11px] text-muted">
          {ticks.map((s) => (
            <span key={s} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${Math.min(97, Math.max(3, (s / dur) * 100))}%` }}>
              {fmtTime(s).replace(/:00$/, "")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
