import { useState, type FormEvent } from "react";
import { SAMPLES } from "../data/samples";
import { fmtDuration } from "../lib/format";
import { ShortCard } from "./ShortCard";
import { SignalScene } from "./SignalScene";
import { Tilt } from "./Tilt";

const HOSTS = /(^|\.)(twitch\.tv|vkplay\.live|vkplay\.ru|live\.vkvideo\.ru|vkvideo\.ru|vk\.com|youtube\.com|youtu\.be|kick\.com|rutube\.ru)$/i;

/* Метки сигналов «выступают» из экрана телефона на разную глубину. */
const FLOATING = [
  { text: "Голос: крик", pos: "-left-[30%] top-[14%]", z: 90, delay: "0s" },
  { text: "Эмоции: шок", pos: "-right-[26%] top-[32%]", z: 60, delay: ".6s" },
  { text: "Чат: 312 зрителей за 10 с", pos: "-left-[46%] bottom-[30%]", z: 120, delay: "1.2s" },
  { text: "41 клип от зрителей", pos: "-right-[30%] bottom-[12%]", z: 80, delay: "1.8s" },
];

interface Props {
  onSample: (index: number) => void;
  onLink: (url: URL) => void;
}

export function Hero({ onSample, onLink }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const hero = SAMPLES[0];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const raw = value.trim();
    let url: URL | null = null;
    try {
      url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    } catch {
      url = null;
    }
    if (!raw || !url || !HOSTS.test(url.hostname)) {
      setError("Вставьте ссылку на запись стрима: Twitch, VK Play Live, VK Видео, YouTube, Kick или Rutube.");
      return;
    }
    setError("");
    onLink(url);
  };

  return (
    <section className="relative isolate flex min-h-[min(100svh,900px)] items-center overflow-hidden">
      <SignalScene />
      {/* затемнение под текстом и снизу, чтобы 3D-сцена не спорила с заголовком */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--color-bg)_0%,rgb(10_13_22/0.9)_32%,rgb(10_13_22/0.35)_62%,rgb(10_13_22/0.1)_100%)] max-lg:bg-[linear-gradient(180deg,rgb(10_13_22/0.55)_0%,rgb(10_13_22/0.85)_45%,var(--color-bg)_100%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />

      <div className="container-page relative grid w-full items-center gap-16 py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div>
          <a
            href="#features"
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface/60 py-1.5 pl-1.5 pr-4 text-sm text-soft backdrop-blur-md transition hover:border-accent/50"
          >
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-ink">Новое</span>
            Моменты по реакции чата, донатам и клипам
          </a>
          <h1 className="font-display text-[clamp(40px,6vw,76px)] font-extrabold leading-[0.98] tracking-[-0.035em]">
            Шорты из стрима. <span className="text-accent">Автоматически.</span>
          </h1>
          <p className="mt-7 max-w-[50ch] text-lg leading-relaxed text-soft">
            Вставьте ссылку на запись — Пик найдёт лучшие моменты по реакции стримера и зрителей и сделает вертикальные видео с
            субтитрами для TikTok, Reels и Shorts.
          </p>

          <form
            onSubmit={submit}
            noValidate
            className="mt-10 flex max-w-[600px] flex-col gap-2 rounded-[18px] border border-white/10 bg-surface/70 p-2 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)] backdrop-blur-xl focus-within:border-accent/60 sm:flex-row"
          >
            <label htmlFor="link" className="sr-only">
              Ссылка на запись стрима
            </label>
            <input
              id="link"
              type="url"
              inputMode="url"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ссылка на запись: twitch.tv/videos/…"
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base text-ink placeholder:text-[#5d667e] focus-visible:outline-none sm:py-0"
            />
            <button
              type="submit"
              className="whitespace-nowrap rounded-xl bg-accent px-6 py-4 text-[15px] font-semibold text-accent-ink transition hover:bg-accent-2 active:translate-y-px"
            >
              Найти моменты
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-error">{error}</p>}
          <p className="mt-3 text-sm text-muted">1 стрим в месяц бесплатно · без монтажёра · без установки</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="text-muted">Или пример:</span>
            {SAMPLES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSample(i)}
                className="group inline-flex items-baseline gap-2 border-b border-white/15 pb-0.5 font-medium transition-colors hover:border-accent hover:text-accent"
              >
                {s.category}
                <small className="font-mono text-xs text-muted group-hover:text-accent/70">{fmtDuration(s.duration)}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="relative hidden justify-center sm:flex" aria-hidden="true">
          <Tilt max={16} className="animate-float">
            <div className="relative [transform-style:preserve-3d]">
              <div className="aspect-[9/19] w-[min(280px,62vw)] rounded-[44px] bg-[linear-gradient(160deg,#323b5c,#10142a)] p-2.5 shadow-[0_60px_100px_-40px_rgb(0_0_0/0.95),inset_0_0_0_1px_#36405f]">
                <div className="h-full overflow-hidden rounded-[35px]">
                  <ShortCard moment={hero.moments[0]} ctx={{ streamer: hero.streamer }} fill autoPlay />
                </div>
              </div>
              {FLOATING.map((f) => (
                <div
                  key={f.text}
                  className={`absolute ${f.pos} pointer-events-none`}
                  style={{ transform: `translateZ(${f.z}px)` }}
                >
                  <div
                    style={{ animationDelay: f.delay }}
                    className="animate-pop whitespace-nowrap rounded-xl border border-white/10 bg-surface/80 py-2.5 pl-8 pr-4 text-[13px] font-semibold shadow-[0_20px_40px_-20px_rgb(0_0_0/0.9)] backdrop-blur-md"
                  >
                    <span className="absolute left-3.5 top-1/2 -mt-1 size-2 rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)]" />
                    {f.text}
                  </div>
                </div>
              ))}
            </div>
          </Tilt>
        </div>
      </div>
    </section>
  );
}
