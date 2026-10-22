import { SAMPLES } from "../data/samples";
import { ShortCard } from "./ShortCard";

const LANES = ["Голос", "Эмоции", "Слова", "Чат", "Донаты", "Клипы"];
// высоты столбиков 0…1; в колонках 9–10 и 21–22 совпали сигналы
const BARS = LANES.map((_, r) =>
  Array.from({ length: 30 }, (_, c) => {
    const hot = (c >= 9 && c <= 10) || (c >= 21 && c <= 22);
    if (hot && (r + c) % 6 !== 0) return { v: 0.75 + ((r * 7 + c) % 3) * 0.1, hot: true };
    const sparse = r === 2 || r >= 4;
    const v = sparse ? ((r * 13 + c * 7) % 9 === 0 ? 0.35 : 0.06) : 0.15 + (((r * 31 + c * 17) % 10) / 10) * 0.3;
    return { v, hot: false };
  }),
);

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-surface p-7 ${className}`}>{children}</div>;
}

export function Features() {
  const sample = SAMPLES[1];
  return (
    <section id="features" className="scroll-mt-16 py-28">
      <div className="container-page">
        <div className="max-w-[640px]">
          <p className="text-sm font-semibold text-accent">Возможности</p>
          <h2 className="mt-3 font-display text-[clamp(30px,4vw,48px)] font-bold leading-[1.05] tracking-[-0.03em]">
            Всё, чтобы стрим превратился в шорты
          </h2>
          <p className="mt-5 text-lg text-soft">Пик сделан именно для стримов: он видит не только картинку и звук, но и реакцию зрителей.</p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {/* 1. сигналы */}
          <Card className="lg:col-span-2">
            <h3 className="font-display text-xl font-bold">Шесть сигналов вместо одного</h3>
            <p className="mt-2 max-w-[52ch] text-muted">
              Голос, эмоции и слова стримера плюс чат, донаты и клипы зрителей. Момент — там, где совпало несколько сразу.
            </p>
            <div className="mt-7 grid grid-cols-[64px_minmax(0,1fr)] gap-x-3 gap-y-1.5" aria-hidden="true">
              {LANES.map((name, r) => (
                <div key={name} className="contents">
                  <span className="text-xs leading-6 text-muted">{name}</span>
                  <div className="flex h-6 items-end gap-[3px]">
                    {BARS[r].map((b, c) => (
                      <span
                        key={c}
                        className={`flex-1 rounded-[2px] ${b.hot ? "bg-accent" : "bg-line-2"}`}
                        style={{ height: `${Math.max(8, b.v * 100)}%` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 2. вертикальный шорт */}
          <Card className="flex flex-col lg:row-span-2">
            <h3 className="font-display text-xl font-bold">Готовый шорт 9:16</h3>
            <p className="mt-2 text-muted">Вертикальное видео с крупными субтитрами и репликами чата. Остаётся только выложить.</p>
            <div className="mx-auto mt-7 w-full max-w-[240px]">
              <ShortCard moment={sample.moments[2]} ctx={{ streamer: sample.streamer }} autoPlay />
            </div>
          </Card>

          {/* 3. почему момент */}
          <Card>
            <h3 className="font-display text-xl font-bold">Понятно, почему выбран момент</h3>
            <p className="mt-2 text-muted">Для каждого шорта видно, какие сигналы сработали.</p>
            <div className="mt-6 rounded-2xl border border-line bg-bg-2 p-4 text-sm">
              <p className="font-semibold">Скример, которого никто не ждал</p>
              <p className="mt-1 font-mono text-xs text-muted">0:47:12 – 0:47:46 · 34 с</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Голос", "Эмоции", "Слова", "Чат", "Клипы"].map((s) => (
                  <span key={s} className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs">
                    {s}
                  </span>
                ))}
                <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-dim">Донаты</span>
              </div>
            </div>
          </Card>

          {/* 4. приватность / скорость */}
          <Card>
            <h3 className="font-display text-xl font-bold">Минуты вместо часов</h3>
            <p className="mt-2 text-muted">Не нужно пересматривать запись. Анализ чата идёт прямо в браузере — файлы никуда не отправляются.</p>
            <div className="mt-6 flex items-end gap-6">
              <div>
                <div className="font-display text-4xl font-extrabold text-dim line-through decoration-2">часы</div>
                <div className="mt-1 text-xs text-muted">пересмотр вручную</div>
              </div>
              <div>
                <div className="font-display text-4xl font-extrabold text-accent">минуты</div>
                <div className="mt-1 text-xs text-muted">с Пиком</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
