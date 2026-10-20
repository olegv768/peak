import { useEffect, useRef } from "react";
import { KINDS, SIGNALS } from "../data/samples";
import { fmtTime } from "../lib/format";
import type { Moment, ShortCtx } from "../types";
import { ShortCard } from "./ShortCard";

interface Props {
  moment: Moment;
  ctx: ShortCtx;
  onClose: () => void;
  notify: (msg: string) => void;
}

/** Окно момента: шорт крупно, почему выбран, какие сигналы сработали. */
export function ShortModal({ moment, ctx, onClose, notify }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const kind = KINDS[moment.kind] ?? KINDS.burst;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const h4 = "mb-2 mt-[22px] text-xs font-semibold uppercase tracking-[0.14em] text-muted";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-5">
      <div className="absolute inset-0 bg-[#04060c]/80 backdrop-blur-md" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="moment-title"
        className="relative grid max-h-[calc(100vh-40px)] w-full max-w-[880px] animate-rise grid-cols-1 gap-7 overflow-auto rounded-[22px] border border-line bg-surface p-6 md:grid-cols-[300px_minmax(0,1fr)]"
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
          className="absolute right-3 top-2.5 px-2 py-1 text-[28px] leading-none text-muted hover:text-ink"
        >
          ×
        </button>
        <div className="mx-auto w-full max-w-[260px] md:max-w-none">
          <ShortCard moment={moment} ctx={ctx} large autoPlay />
        </div>
        <div>
          <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">{kind.label}</p>
          <h3 id="moment-title" className="font-display text-2xl font-bold leading-tight">
            {moment.title}
          </h3>
          <p className="mt-2 font-mono text-[13px] text-muted">
            {fmtTime(moment.t)} – {fmtTime(moment.t + moment.len)} · {moment.len} с · вертикально 9:16
          </p>
          <h4 className={h4}>Почему этот момент</h4>
          <p>{moment.why}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SIGNALS.map((s) => (
              <span
                key={s.id}
                className={`rounded-full border px-2.5 py-1 text-xs ${
                  moment.signals.includes(s.id) ? "border-accent/50 bg-accent/12 text-ink" : "border-line text-dim"
                }`}
              >
                {s.name}
              </span>
            ))}
          </div>
          <h4 className={h4}>Что писал чат</h4>
          <div className="flex flex-wrap gap-1.5">
            {moment.chat.map((c, i) => (
              <span key={i} className="rounded-lg border border-line bg-bg-2 px-2.5 py-1 text-[13px]">
                {c}
              </span>
            ))}
          </div>
          <div className="mt-[26px]">
            <button
              type="button"
              onClick={() => notify("Скачивание скоро будет доступно.")}
              className="bg-brand rounded-xl px-5 py-3.5 text-[15px] font-semibold text-accent-ink shadow-[0_10px_30px_-10px_rgb(255_90_31/0.7)] hover:brightness-105"
            >
              Скачать MP4
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
