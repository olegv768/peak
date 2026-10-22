const ROWS: [string, string, string][] = [
  ["Для чего сделан", "фильмы, сериалы, подкасты", "стримы"],
  ["Голос и картинка", "да", "да"],
  ["Реакция чата", "нет", "да"],
  ["Донаты", "нет", "да"],
  ["Клипы зрителей", "нет", "да"],
];

/** Сравнение с универсальными нарезалками. */
export function Versus() {
  return (
    <section className="border-y border-line bg-bg-2 py-28">
      <div className="container-page grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
        <div>
          <p className="mb-6 flex items-center gap-3 text-sm text-soft">
            <span className="h-px w-10 bg-accent" />
            Почему не Opus Clip и CapCut
          </p>
          <h2 className="font-display text-[clamp(30px,4.2vw,52px)] font-bold leading-[1.02] tracking-[-0.03em]">
            Они режут любое видео. Пик понимает стрим.
          </h2>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-soft">
            В стриме самое важное — реакция зрителей. Универсальные программы её не видят: для них это просто длинное видео.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-line">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] bg-surface text-sm">
            <div className="p-5 text-muted" />
            <div className="p-5 font-semibold text-soft">Opus Clip, CapCut</div>
            <div className="bg-accent p-5 font-display font-extrabold text-accent-ink">Пик</div>
          </div>
          {ROWS.map(([what, them, us]) => (
            <div key={what} className="grid grid-cols-[1.2fr_1fr_1fr] border-t border-line text-[15px]">
              <div className="p-5 text-soft">{what}</div>
              <div className={`p-5 ${them === "нет" ? "text-dim" : "text-soft"}`}>{them}</div>
              <div className="bg-accent/10 p-5 font-semibold text-ink">{us}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
