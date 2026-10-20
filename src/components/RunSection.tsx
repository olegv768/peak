import { useEffect, useRef, useState } from "react";
import { SIGNALS } from "../data/samples";
import { fmtTime, plural } from "../lib/format";
import type { Job, Moment, SignalId } from "../types";
import { ShortCard } from "./ShortCard";
import { Tilt } from "./Tilt";
import { Timeline } from "./Timeline";

interface Props {
  job: Job;
  onOpen: (m: Moment) => void;
}

type StepState = "" | "active" | "done";

/** Обработка по шагам, шкала сигналов и готовые шорты. */
export function RunSection({ job, onOpen }: Props) {
  const ref = useRef<HTMLElement>(null);
  const skip = useRef(false);
  const [steps, setSteps] = useState<StepState[]>([]);
  const [reveal, setReveal] = useState<Partial<Record<SignalId, number>>>({});
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    skip.current = false;
    setDone(false);
    setShown(0);
    setReveal({});
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const total = job.stages.reduce((a, s) => a + s.ms, 0);
    const t0 = performance.now();
    // Таймер, а не requestAnimationFrame: в фоновой вкладке rAF стоит, и обработка не доходила бы до конца.
    let timer = 0;
    const tick = () => {
      const el = skip.current ? total : performance.now() - t0;
      let acc = 0;
      const st: StepState[] = [];
      const rv: Partial<Record<SignalId, number>> = {};
      let cut = 0;
      for (const s of job.stages) {
        const p = Math.min(1, Math.max(0, (el - acc) / s.ms));
        st.push(p >= 1 ? "done" : p > 0 ? "active" : "");
        if (s.lane) rv[s.lane] = p;
        if (s.cut) cut = Math.ceil(p * job.moments.length);
        acc += s.ms;
      }
      setSteps(st);
      setReveal(rv);
      setShown(cut);
      if (el >= total) {
        window.clearInterval(timer);
        setReveal(Object.fromEntries(SIGNALS.map((s) => [s.id, 1])));
        setShown(job.moments.length);
        setDone(true);
      }
    };
    timer = window.setInterval(tick, 33);
    tick();
    return () => window.clearInterval(timer);
  }, [job]);

  const n = job.moments.length;

  return (
    <section ref={ref} className="scroll-mt-16 border-t border-line bg-bg-2 pb-22 pt-10">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-5 flex items-center gap-3 text-sm text-soft"><span className="h-px w-10 bg-accent" />{job.eyebrow}</p>
            <h2 className="font-display text-[clamp(24px,3.2vw,34px)] font-bold leading-tight tracking-tight">{job.title}</h2>
            <p className="mt-2.5 text-[15px] text-muted">{job.meta}</p>
          </div>
          {!done && (
            <button
              type="button"
              onClick={() => (skip.current = true)}
              className="rounded-xl border border-line bg-surface px-5 py-3.5 text-[15px] font-semibold hover:border-line-2"
            >
              Пропустить
            </button>
          )}
        </div>

        {job.notice && (
          <p className="mt-5 rounded-xl border border-accent-2/25 bg-accent-2/8 px-4 py-3.5 text-sm text-warn">{job.notice}</p>
        )}

        <div className="mt-6 grid gap-5 rounded-[20px] border border-line bg-surface p-6">
          <ol className="flex flex-wrap gap-2">
            {job.stages.map((s, i) => (
              <li
                key={s.label}
                className={`relative rounded-full border bg-bg-2 py-2 pl-[30px] pr-3 text-[13px] transition-colors ${
                  steps[i] ? "text-ink" : "text-muted"
                } ${steps[i] === "active" ? "border-accent/50" : "border-line"}`}
              >
                <span
                  className={`absolute left-3 top-1/2 -mt-[5px] size-2.5 rounded-full border-2 ${
                    steps[i] === "done"
                      ? "border-good bg-good"
                      : steps[i] === "active"
                        ? "animate-spin-slow border-accent border-t-transparent"
                        : "border-[#3A4462]"
                  }`}
                />
                {s.label}
              </li>
            ))}
          </ol>
          <Timeline lanes={job.lanes} moments={job.moments} dur={job.dur} reveal={reveal} shown={shown} onMoment={onOpen} />
          <p className="text-sm text-muted">
            Один сигнал врёт: стример крикнул просто так, чат заспамил бот. Подсвечены места, где совпало несколько сигналов.
          </p>
        </div>

        {done && (
          <div className="mt-12">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-2xl font-bold">
                {n ? `Готово: ${n} ${plural(n, "шорт", "шорта", "шортов")}` : "Моментов не нашлось"}
              </h3>
              {n > 0 && <p className="text-sm text-muted">Наведите, чтобы посмотреть. Нажмите, чтобы открыть.</p>}
            </div>
            {n === 0 && (
              <p className="text-muted">В этом чате нет заметных всплесков. Нужен стрим хотя бы с несколькими десятками активных зрителей.</p>
            )}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[22px]">
              {job.moments.map((m, k) => (
                <div key={`${job.id}-${k}`} className="flex animate-rise flex-col gap-3" style={{ animationDelay: `${k * 70}ms` }}>
                  <Tilt max={12} glare>
                    <ShortCard moment={m} ctx={job.ctx} onOpen={() => onOpen(m)} label={`Открыть момент ${k + 1}: ${m.title}`} />
                  </Tilt>
                  <div>
                    <b className="block text-[15px] leading-snug">
                      {k + 1}. {m.title}
                    </b>
                    <span className="font-mono text-xs text-muted">
                      {fmtTime(m.t)} · {m.len} с
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {SIGNALS.map((s) => (
                        <i
                          key={s.id}
                          className={`rounded-md border px-[7px] py-[3px] text-[11px] not-italic ${
                            m.signals.includes(s.id) ? "border-accent/45 bg-accent/10 text-ink" : "border-line bg-bg text-dim"
                          }`}
                        >
                          {s.name}
                        </i>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
