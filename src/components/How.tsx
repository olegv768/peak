import type { CSSProperties } from "react";

const ORBIT = [
  { name: "Голос", hint: "крик, смех, смена тона", who: "стример" },
  { name: "Чат", hint: "«АХАХА», «ОГО», «GG»", who: "зрители" },
  { name: "Эмоции", hint: "шок и смех на камере", who: "стример" },
  { name: "Донаты", hint: "сумма и сообщение", who: "зрители" },
  { name: "Слова", hint: "«не может быть»", who: "стример" },
  { name: "Клипы", hint: "что вырезали зрители", who: "зрители" },
];
const STEPS = [
  ["Ссылка", "Вставляете ссылку на запись стрима."],
  ["Сигналы", "Пик разбирает видео, звук, чат и донаты."],
  ["Шорты", "Получаете вертикальные ролики с субтитрами."],
];

export function How() {
  return (
    <section id="how" className="relative scroll-mt-16 overflow-hidden py-28">
      <div className="container-page grid items-center gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <p className="mb-3 text-sm font-semibold text-accent">Как это работает</p>
          <h2 className="font-display text-[clamp(30px,4.2vw,52px)] font-bold leading-[1.02] tracking-[-0.03em]">
            Момент — там, где совпали все сигналы
          </h2>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-soft">
            Один сигнал врёт: стример крикнул просто так, чат заспамил бот. Три сигнала идут от стримера, три — от зрителей. Где они
            сходятся, Пик режет шорт.
          </p>
          <ol className="mt-12 grid gap-0">
            {STEPS.map(([name, text], i) => (
              <li key={name} className="grid grid-cols-[48px_minmax(0,1fr)] items-baseline border-t border-line py-5 last:border-b">
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <div>
                  <b className="font-display text-lg">{name}</b>
                  <p className="mt-1 text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* 3D-орбита: шесть сигналов вращаются вокруг ядра */}
        <div className="relative mx-auto aspect-square w-full max-w-[600px] [--r:min(38vw,250px)] [--ring:calc(2*var(--r))] [perspective:1200px]" aria-label="Шесть сигналов вокруг Пика">
          <div className="absolute inset-0 [transform-style:preserve-3d] [transform:rotateX(-22deg)]">
            <div className="absolute left-1/2 top-1/2 size-[var(--ring)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line [transform:rotateX(90deg)]" />
            <div className="absolute left-1/2 top-1/2 size-[var(--ring)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-accent/30 [transform:rotateX(90deg)_scale(0.62)]" />
            <div className="absolute left-1/2 top-1/2 grid size-[124px] -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full bg-[radial-gradient(circle_at_32%_28%,#ffb070,var(--color-accent)_45%,#a8300a)] text-center text-accent-ink shadow-[0_0_120px_-10px_rgb(255_90_31/0.7),inset_-12px_-16px_30px_rgb(0_0_0/0.35)] sm:size-[140px]">
              <span className="font-display text-[28px] font-extrabold leading-none">Пик</span>
              <small className="mt-1.5 text-xs font-semibold">режет шорт 9:16</small>
            </div>
            {ORBIT.map((s, i) => (
              <div
                key={s.name}
                className="orbit-item absolute left-1/2 top-1/2"
                style={{ "--a": `${i * 60}deg` } as CSSProperties}
              >
                <div className="w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-surface/85 px-4 py-3 shadow-[0_24px_50px_-24px_rgb(0_0_0/0.9)] backdrop-blur-md">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${s.who === "стример" ? "text-accent-2" : "text-[#7aa2ff]"}`}>
                    {s.who}
                  </span>
                  <b className="block font-display text-base">{s.name}</b>
                  <span className="block text-xs leading-snug text-muted">{s.hint}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
