import { useState } from "react";

const CASES = [
  {
    id: "streamers",
    tab: "Стримерам",
    title: "Растите в соцсетях без монтажёра",
    text: "Новые зрители находят стримеров в TikTok, Reels и Shorts. Пик делает шорты из каждого эфира, пока вы готовитесь к следующему.",
    points: ["Шорты из каждого стрима", "Не нужно пересматривать запись", "Субтитры уже на видео"],
  },
  {
    id: "editors",
    tab: "Монтажёрам",
    title: "Начинайте с готовых моментов",
    text: "Не тратьте часы на поиск. Пик отдаёт лучшие моменты с таймкодами и объясняет, почему каждый выбран, — вы сразу доводите их до публикации.",
    points: ["Моменты с таймкодами", "Видно, какие сигналы сработали", "Несколько каналов в одном кабинете"],
  },
  {
    id: "clippers",
    tab: "Нарезчикам",
    title: "Больше роликов за день",
    text: "Ведёте каналы с нарезками стримов? Пик находит самые яркие моменты за минуты, а вы публикуете больше и чаще.",
    points: ["Лучшие моменты первыми", "Видно реакцию чата и донаты", "Вертикаль 9:16 сразу"],
  },
];

export function UseCases() {
  const [active, setActive] = useState(0);
  const c = CASES[active];

  return (
    <section id="use-cases" className="scroll-mt-16 border-y border-line bg-bg-2 py-28">
      <div className="container-page">
        <p className="text-sm font-semibold text-accent">Для кого</p>
        <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(30px,4vw,48px)] font-bold leading-[1.05] tracking-[-0.03em]">
          Для всех, кто делает шорты из стримов
        </h2>

        <div role="tablist" aria-label="Для кого" className="mt-10 inline-flex flex-wrap gap-1 rounded-2xl border border-line bg-surface p-1">
          {CASES.map((x, i) => (
            <button
              key={x.id}
              role="tab"
              type="button"
              id={`tab-${x.id}`}
              aria-selected={i === active}
              aria-controls={`panel-${x.id}`}
              onClick={() => setActive(i)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                i === active ? "bg-accent text-accent-ink" : "text-soft hover:text-ink"
              }`}
            >
              {x.tab}
            </button>
          ))}
        </div>

        <div
          key={c.id}
          role="tabpanel"
          id={`panel-${c.id}`}
          aria-labelledby={`tab-${c.id}`}
          className="mt-8 grid animate-rise gap-10 rounded-[28px] border border-white/10 bg-surface p-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:p-12"
        >
          <div>
            <h3 className="font-display text-[clamp(24px,2.6vw,34px)] font-bold leading-tight">{c.title}</h3>
            <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-soft">{c.text}</p>
          </div>
          <ul className="grid content-center gap-3">
            {c.points.map((p) => (
              <li key={p} className="flex items-center gap-3 rounded-2xl border border-line bg-bg-2 px-5 py-4">
                <span className="grid size-6 flex-none place-items-center rounded-full bg-accent/15 text-sm font-bold text-accent" aria-hidden="true">
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
