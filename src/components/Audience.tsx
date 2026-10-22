import { Tilt } from "./Tilt";

const PEOPLE = [
  {
    who: "Стример",
    tag: "● LIVE",
    pain: "Нет монтажёра и времени пересматривать эфиры.",
    gain: "Шорты из каждого стрима сами — канал растёт без лишней работы.",
    tone: "from-accent/25",
  },
  {
    who: "Монтажёр",
    tag: "▮▮ 06:12:40",
    pain: "Часами пересматривает записи, чтобы найти пару минут.",
    gain: "Сразу получает готовые моменты и доводит их до публикации.",
    tone: "from-yellow/20",
  },
  {
    who: "Нарезчик",
    tag: "9:16",
    pain: "Ведёт каналы с нарезками, и каждый ролик — ручной поиск.",
    gain: "Лучшие моменты за минуты: роликов в день больше, заработок выше.",
    tone: "from-[#7aa2ff]/20",
  },
];

export function Audience() {
  return (
    <section className="py-28">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(34px,5vw,64px)] font-extrabold leading-[0.98] tracking-[-0.035em]">
            Для кого <span className="text-accent">Пик</span>
          </h2>
          <p className="max-w-[40ch] text-lg text-soft">Для всех, кому нужны шорты из стримов — быстро и без пересмотра записи.</p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PEOPLE.map((p) => (
            <Tilt key={p.who} max={8} glare radius="28px">
              <article className={`relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b ${p.tone} to-surface p-7`}>
                <span className="w-fit rounded-md bg-black/40 px-2 py-1 font-mono text-xs text-soft">{p.tag}</span>
                <h3 className="mt-auto font-display text-[clamp(28px,2.7vw,38px)] font-extrabold uppercase leading-none tracking-tight">{p.who}</h3>
                <p className="mt-6 text-[15px] leading-snug text-muted">
                  <b className="mb-1 block font-mono text-xs font-medium uppercase tracking-wider text-dim">Сейчас</b>
                  {p.pain}
                </p>
                <p className="mt-4 text-lg font-medium leading-snug">
                  <b className="mb-1 block font-mono text-xs font-medium uppercase tracking-wider text-accent">С Пиком</b>
                  {p.gain}
                </p>
              </article>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  );
}
