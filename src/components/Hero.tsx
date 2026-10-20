import { useState, type FormEvent } from "react";
import { SAMPLES } from "../data/samples";
import { fmtDuration } from "../lib/format";
import { ShortCard } from "./ShortCard";

const HOSTS = /(^|\.)(twitch\.tv|vkplay\.live|vkplay\.ru|live\.vkvideo\.ru|vkvideo\.ru|vk\.com|youtube\.com|youtu\.be|kick\.com|rutube\.ru)$/i;

const FLOATING = [
  { text: "Голос: крик", pos: "left-0 top-[12%]", delay: "0s" },
  { text: "Эмоции: шок", pos: "right-0 top-[30%]", delay: ".6s" },
  { text: "Чат: 312 зрителей за 10 с", pos: "-left-[4%] bottom-[26%]", delay: "1.2s" },
  { text: "41 клип от зрителей", pos: "bottom-[9%] right-[2%]", delay: "1.8s" },
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
    <section className="relative overflow-hidden pb-24 pt-18">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[10%] -top-[20%] size-[900px] bg-[radial-gradient(closest-side,rgb(255_90_31/0.22),transparent_70%)]"
      />
      <div className="container-page relative grid items-center gap-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">
        <div>
          <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Шорты из стрима без монтажёра</p>
          <h1 className="font-display text-[clamp(36px,5.6vw,66px)] font-extrabold leading-[1.04] tracking-tight">
            Лучшие моменты стрима — <em className="text-gradient not-italic">в шорты.</em> Сами.
          </h1>
          <p className="mt-[18px] max-w-[56ch] text-lg text-soft">
            Пик слушает стримера, видит его эмоции, читает чат и донаты. Там, где совпали все сигналы, он находит момент и режет его в
            вертикальное видео с субтитрами.
          </p>

          <form
            onSubmit={submit}
            noValidate
            className="mt-8 flex max-w-[620px] flex-col gap-2.5 rounded-2xl border border-line bg-surface p-2 focus-within:border-accent/60 focus-within:shadow-[0_0_0_4px_rgb(255_90_31/0.12)] sm:flex-row"
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
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base text-ink placeholder:text-[#5d667e] focus-visible:outline-none sm:py-0"
            />
            <button
              type="submit"
              className="bg-brand whitespace-nowrap rounded-xl px-[22px] py-[15px] text-[15px] font-semibold text-accent-ink shadow-[0_10px_30px_-10px_rgb(255_90_31/0.7)] transition hover:brightness-105 active:translate-y-px"
            >
              Найти моменты
            </button>
          </form>
          {error && <p className="mt-2.5 text-sm text-error">{error}</p>}

          <div className="mt-[22px]">
            <span className="text-sm text-muted">Нет ссылки? Попробуйте на примере:</span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {SAMPLES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSample(i)}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-medium hover:border-accent"
                >
                  {s.category}
                  <small className="text-xs text-muted">{fmtDuration(s.duration)}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex justify-center" aria-hidden="true">
          <div className="aspect-[9/19] w-[min(240px,62vw)] rounded-[42px] bg-[linear-gradient(160deg,#2a3250,#11162a)] p-2.5 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8),inset_0_0_0_1px_#2c3554] lg:w-[min(300px,70vw)]">
            <div className="h-full overflow-hidden rounded-[33px]">
              <ShortCard moment={hero.moments[0]} ctx={{ streamer: hero.streamer }} fill autoPlay />
            </div>
          </div>
          <ul className="pointer-events-none absolute inset-0 hidden sm:block">
            {FLOATING.map((f) => (
              <li
                key={f.text}
                style={{ animationDelay: f.delay }}
                className={`absolute ${f.pos} animate-pop whitespace-nowrap rounded-full border border-line bg-surface/85 py-[9px] pl-[30px] pr-3.5 text-[13px] font-semibold backdrop-blur-md`}
              >
                <span className="absolute left-[13px] top-1/2 -mt-1 size-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
