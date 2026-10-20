import { useEffect, useRef, useState } from "react";
import { KINDS } from "../data/samples";
import type { Moment, ShortCtx } from "../types";
import { hash } from "../lib/format";

const NICKS = ["zritel_17", "nika", "pro100", "sanya_ok", "mrk", "lena_k", "dimas", "kotik"];
/** Длина показа шорта без видео, мс. */
const LOOP_MS = 8000;

interface Props {
  moment: Moment;
  ctx: ShortCtx;
  /** крупные субтитры — для окна момента */
  large?: boolean;
  /** растянуть на всю высоту родителя (экран телефона) */
  fill?: boolean;
  /** играть всё время, а не по наведению */
  autoPlay?: boolean;
  onOpen?: () => void;
  label?: string;
}

/** Вертикальный шорт: субтитры, реплики чата, полоса прогресса; с записью — само видео момента. */
export function ShortCard({ moment, ctx, large, fill, autoPlay, onOpen, label }: Props) {
  const kind = KINDS[moment.kind] ?? KINDS.burst;
  const [hover, setHover] = useState(false);
  const [p, setP] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playing = Boolean(autoPlay || hover);

  useEffect(() => {
    const v = videoRef.current;
    if (!playing) {
      setP(0);
      v?.pause();
      return;
    }
    const start = performance.now();
    if (v) {
      v.currentTime = moment.t;
      v.play().catch(() => {});
    }
    const id = window.setInterval(() => {
      if (v) {
        if (v.currentTime >= moment.t + moment.len || v.currentTime < moment.t - 1) v.currentTime = moment.t;
        setP(Math.min(1, Math.max(0, (v.currentTime - moment.t) / moment.len)));
      } else {
        setP(((performance.now() - start) % LOOP_MS) / LOOP_MS);
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [playing, moment, ctx.videoUrl]);

  const subs = moment.subs.length ? moment.subs : ["…"];
  const si = playing ? Math.min(subs.length - 1, Math.floor(p * subs.length)) : 0;
  const ci = playing ? Math.min(moment.chat.length, Math.floor(p * (moment.chat.length + 1.5))) : 0;
  const chat = moment.chat.slice(Math.max(0, ci - 3), ci);
  const words = subs[si].split(" ");

  return (
    <div
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : -1}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (onOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`relative isolate overflow-hidden select-none ${fill ? "h-full" : "aspect-[9/16] rounded-[18px] shadow-[0_20px_40px_-20px_rgb(0_0_0/0.8)]"} ${onOpen ? "cursor-pointer" : ""}`}
      style={{ background: `linear-gradient(160deg, ${kind.a}, ${kind.b})` }}
    >
      {ctx.videoUrl ? (
        <video
          ref={videoRef}
          src={ctx.videoUrl}
          muted={!large}
          playsInline
          preload="metadata"
          onLoadedMetadata={(e) => {
            if (!playing) e.currentTarget.currentTime = moment.t + Math.min(5, moment.len / 2);
          }}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <i className="absolute left-[-10%] top-[8%] h-[40%] w-[70%] rounded-full bg-white opacity-55 mix-blend-soft-light blur-[30px] animate-drift" />
          <i className="absolute right-[-15%] top-[40%] h-[35%] w-[60%] rounded-full bg-black opacity-55 mix-blend-soft-light blur-[30px] animate-drift [animation-delay:-3s]" />
          <i className="absolute bottom-[-5%] left-[20%] h-[30%] w-[50%] rounded-full bg-white opacity-55 mix-blend-soft-light blur-[30px] animate-drift [animation-delay:-6s]" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.35),transparent_30%,transparent_55%,rgb(0_0_0/0.55))]" />

      <div className="absolute inset-x-2.5 top-2.5 h-[3px] overflow-hidden rounded-full bg-white/30">
        <span className="block h-full bg-white" style={{ width: `${(p * 100).toFixed(1)}%` }} />
      </div>

      <div className="absolute inset-x-3 top-[22px] flex items-center justify-between text-[11px] font-semibold">
        <span className="rounded-full bg-black/35 px-2 py-1">@{ctx.streamer}</span>
        <span className="rounded-full bg-white/90 px-2 py-1 text-[#10131c]">{kind.label}</span>
      </div>

      <div
        key={si}
        className={`subs-shadow absolute inset-x-[8%] top-[44%] text-center font-display font-extrabold uppercase leading-[1.1] ${large ? "text-[clamp(22px,3vw,32px)]" : "text-[clamp(18px,2.2vw,26px)]"}`}
      >
        {words.map((w, j) => (
          <span key={j} className={`inline-block animate-word ${j === words.length - 1 ? "text-[#ffe14d]" : ""}`}>
            {w}
            {j < words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>

      <div className="absolute bottom-3.5 left-2.5 right-[30%] flex flex-col gap-1.5">
        {chat.map((c, j) => (
          <p
            key={`${ci}-${j}`}
            className={`w-fit max-w-full animate-rise rounded-lg bg-black/45 px-2 py-1 leading-snug backdrop-blur-sm ${large ? "text-[13px]" : "text-[11px]"}`}
          >
            <b className="mr-1 font-semibold text-accent-2">{NICKS[(hash(c) + j) % NICKS.length]}</b>
            {c}
          </p>
        ))}
      </div>

      <div
        className={`absolute bottom-3.5 right-3 grid size-[34px] place-items-center rounded-full bg-white/90 transition-opacity ${playing ? "opacity-0" : ""}`}
        aria-hidden="true"
      >
        <span className="ml-[3px] border-y-[7px] border-l-[11px] border-y-transparent border-l-[#10131c]" />
      </div>
    </div>
  );
}
