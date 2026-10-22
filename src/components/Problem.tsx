const STATS = [
  ["3–8 ч", "идёт обычный стрим"],
  ["~5 мин", "в нём по-настоящему ярких моментов"],
  ["0 ₽", "у маленьких стримеров на монтажёра"],
];

/** Яркий блок проблемы: оранжевый фон, тёмный текст, крупные цифры. */
export function Problem() {
  return (
    <section className="relative overflow-hidden bg-accent pb-24 pt-32 text-accent-ink">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 top-20 select-none font-display text-[clamp(120px,22vw,320px)] font-extrabold leading-none text-accent-ink/[0.07]"
      >
        REC
      </span>
      <div className="container-page relative">
        <p className="mb-6 flex items-center gap-3 font-mono text-sm font-medium">
          <span className="size-2.5 animate-pulse rounded-full bg-accent-ink" />
          00:47:12 · проблема
        </p>
        <h2 className="max-w-[16ch] font-display text-[clamp(34px,5.4vw,72px)] font-extrabold leading-[0.98] tracking-[-0.035em]">
          Стрим идёт шесть часов. Огня в нём — на пять минут.
        </h2>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-accent-ink/15 sm:grid-cols-3">
          {STATS.map(([big, text]) => (
            <div key={big} className="bg-accent p-7">
              <div className="font-display text-[clamp(44px,5vw,64px)] font-extrabold leading-none tracking-tight">{big}</div>
              <p className="mt-3 max-w-[22ch] text-lg font-medium">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <p className="text-[clamp(20px,2vw,26px)] font-semibold leading-snug">
            Соцсети сейчас — главный способ привлечь аудиторию. Новые зрители находят стримера не на Twitch, а в TikTok, Reels и Shorts.
          </p>
          <p className="text-lg leading-relaxed">
            Чтобы найти лучшие пять минут, кто-то должен пересмотреть всю запись. Большие стримеры платят за это нарезчикам и монтажёрам.
            У маленьких денег нет — их лучшие моменты пропадают, а вместе с ними и новые зрители.
          </p>
        </div>
      </div>
    </section>
  );
}
