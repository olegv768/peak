import { useCallback, useRef, useState } from "react";
import { Faq } from "./components/Faq";
import { Features } from "./components/Features";
import { Hero } from "./components/Hero";
import { How } from "./components/How";
import { OwnStream, type OwnInput } from "./components/OwnStream";
import { RunSection } from "./components/RunSection";
import { Platforms } from "./components/Platforms";
import { Pricing } from "./components/Pricing";
import { ShortModal } from "./components/ShortModal";
import { SiteFooter } from "./components/SiteFooter";
import { UseCases } from "./components/UseCases";
import { SAMPLES } from "./data/samples";
import { analyzeChat, makeSampleChat } from "./lib/analyzer";
import { fmtTime, hash, ru } from "./lib/format";
import { chatLane, sampleLanes } from "./lib/lanes";
import type { Job, Moment, Sample, ShortCtx, Stage } from "./types";

const STAGES_FULL: Stage[] = [
  { label: "Скачиваем запись и чат", ms: 1000 },
  { label: "Слушаем голос стримера", lane: "voice", ms: 850 },
  { label: "Смотрим на эмоции на камере", lane: "face", ms: 850 },
  { label: "Расшифровываем речь", lane: "words", ms: 750 },
  { label: "Читаем чат", lane: "chat", ms: 850 },
  { label: "Находим донаты", lane: "donate", ms: 550 },
  { label: "Собираем клипы зрителей", lane: "clips", ms: 550 },
  { label: "Режем шорты 9:16 и добавляем субтитры", cut: true, ms: 1400 },
];

const STAGES_OWN: Stage[] = [
  { label: "Читаем файл чата", ms: 500 },
  { label: "Считаем зрителей в чате", lane: "chat", ms: 1100 },
  { label: "Ищем всплески и режем моменты", cut: true, ms: 1000 },
];

export default function App() {
  const [job, setJob] = useState<Job | null>(null);
  const [open, setOpen] = useState<{ moment: Moment; ctx: ShortCtx } | null>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(0);
  const jobId = useRef(0);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3200);
  }, []);
  const closeModal = useCallback(() => setOpen(null), []);

  const runSample = (sample: Sample, notice?: string) => {
    setJob({
      id: ++jobId.current,
      eyebrow: notice ? "Пример результата" : "Пример стрима",
      title: sample.title,
      meta: `@${sample.streamer} · ${sample.platform} · ${sample.category} · ${fmtTime(sample.duration)} · до ${ru(sample.peakViewers)} зрителей`,
      notice,
      lanes: sampleLanes(sample),
      moments: [...sample.moments].sort((a, b) => a.t - b.t),
      dur: sample.duration,
      stages: STAGES_FULL,
      ctx: { streamer: sample.streamer },
    });
  };

  const runOwn = ({ msgs, name, videoUrl, videoDur }: OwnInput) => {
    const dur = Math.max(msgs[msgs.length - 1].t + 30, videoDur);
    const res = analyzeChat(msgs, dur);
    const viewers = new Set(msgs.map((m) => m.u)).size;
    setJob({
      id: ++jobId.current,
      eyebrow: "Ваш стрим · анализ чата",
      title: name,
      meta: `${fmtTime(dur)} · ${ru(msgs.length)} сообщений · ${ru(viewers)} зрителей писали в чат`,
      notice: videoUrl ? undefined : "Без записи шорты показаны с репликами чата. Загрузите запись, чтобы смотреть сами моменты.",
      lanes: { chat: chatLane(res.chatBins) },
      moments: res.moments,
      dur,
      stages: STAGES_OWN,
      ctx: { streamer: "ваш_канал", videoUrl },
    });
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/75 backdrop-blur-lg">
        <div className="container-page flex h-16 items-center gap-8">
          <a href="#top" className="font-display text-2xl font-extrabold tracking-tight no-underline" aria-label="Пик — на главную">
            Пик<span className="text-accent">.</span>
          </a>
          <nav className="hidden gap-7 text-sm text-soft md:flex">
            <a href="#features" className="hover:text-ink">Возможности</a>
            <a href="#how" className="hover:text-ink">Как работает</a>
            <a href="#pricing" className="hover:text-ink">Тарифы</a>
            <a href="#faq" className="hover:text-ink">Вопросы</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => notify("Вход скоро будет доступен.")} className="hidden rounded-xl px-4 py-2 text-sm font-medium text-soft hover:text-ink sm:block">
              Войти
            </button>
            <a
              href="#top"
              onClick={() => window.setTimeout(() => document.getElementById("link")?.focus(), 400)}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition hover:bg-accent-2"
            >
              Попробовать бесплатно
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        <Hero
          onSample={(i) => runSample(SAMPLES[i])}
          onLink={(url) => {
            const sample = SAMPLES[hash(url.href) % SAMPLES.length];
            runSample(
              sample,
              `Загрузка стрима по ссылке скоро заработает. Пока показываем, как будет выглядеть результат, на примере стрима «${sample.title}».`,
            );
          }}
        />
        {job && <RunSection key={job.id} job={job} onOpen={(m) => setOpen({ moment: m, ctx: job.ctx })} />}
        <Platforms />
        <Features />
        <How />
        <UseCases />
        <OwnStream
          onRun={runOwn}
          onSampleChat={() => {
            const s = makeSampleChat();
            runOwn({ msgs: s.msgs, name: "Пример чата: 3-часовой стрим", videoUrl: null, videoDur: 0 });
          }}
        />
        <Pricing notify={notify} />
        <Faq />
      </main>

      <SiteFooter />

      {open && <ShortModal moment={open.moment} ctx={open.ctx} onClose={closeModal} notify={notify} />}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[calc(24px+env(safe-area-inset-bottom,0px))] left-1/2 z-60 max-w-[calc(100%-40px)] -translate-x-1/2 animate-rise rounded-xl bg-ink px-[18px] py-3 text-sm font-medium text-bg shadow-[0_20px_40px_-10px_rgb(0_0_0/0.6)]"
        >
          {toast}
        </div>
      )}
    </>
  );
}
