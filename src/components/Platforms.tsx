const PLATFORMS = ["Twitch", "VK Play Live", "YouTube", "Kick", "Rutube"];
const OUTPUT = ["TikTok", "Reels", "Shorts"];

/** Полоса под первым экраном: откуда берём стримы и куда делаем шорты. */
export function Platforms() {
  return (
    <section className="border-y border-line bg-bg-2">
      <div className="container-page flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="text-sm text-muted">Стримы с</span>
          {PLATFORMS.map((p) => (
            <span key={p} className="font-display text-lg font-bold text-soft/80">
              {p}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="text-sm text-muted">Шорты для</span>
          {OUTPUT.map((p) => (
            <span key={p} className="font-display text-lg font-bold text-soft/80">
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
