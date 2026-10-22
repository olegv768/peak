interface Props {
  notify: (msg: string) => void;
}

const PLANS = [
  {
    name: "Бесплатно",
    price: "0 ₽",
    period: "навсегда",
    text: "Попробовать на своём стриме",
    features: ["1 стрим в месяц", "До 5 шортов со стрима", "Водяной знак Пика"],
    cta: "Начать бесплатно",
    action: "start" as const,
  },
  {
    name: "Стример",
    price: "590 ₽",
    period: "в месяц",
    text: "Для тех, кто стримит регулярно",
    features: ["Безлимит стримов", "Без водяного знака", "Все шесть сигналов", "Публикация в TikTok, Reels, Shorts"],
    cta: "Выбрать",
    action: "pay" as const,
    featured: true,
  },
  {
    name: "Команда",
    price: "1 490 ₽",
    period: "в месяц",
    text: "Для монтажёров и нарезчиков",
    features: ["Всё из тарифа «Стример»", "До 10 каналов в одном кабинете", "Выгрузка таймкодов"],
    cta: "Выбрать",
    action: "pay" as const,
  },
];

export function Pricing({ notify }: Props) {
  return (
    <section id="pricing" className="scroll-mt-16 py-28">
      <div className="container-page">
        <div className="mx-auto max-w-[560px] text-center">
          <p className="text-sm font-semibold text-accent">Тарифы</p>
          <h2 className="mt-3 font-display text-[clamp(30px,4vw,48px)] font-bold leading-[1.05] tracking-[-0.03em]">Начните бесплатно</h2>
          <p className="mt-4 text-lg text-soft">Первый стрим — без оплаты. Подписку можно отменить в любой момент.</p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-[28px] border p-8 ${
                p.featured ? "border-accent bg-[linear-gradient(180deg,rgb(255_90_31/0.12),var(--color-surface)_45%)]" : "border-white/10 bg-surface"
              }`}
            >
              {p.featured && (
                <span className="absolute right-6 top-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-ink">Популярный</span>
              )}
              <h3 className="font-display text-lg font-bold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted">{p.text}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-[44px] font-extrabold leading-none tracking-tight">{p.price}</span>
                <span className="text-sm text-muted">{p.period}</span>
              </div>
              <ul className="mt-7 grid gap-3 text-[15px]">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="text-accent" aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                {p.action === "start" ? (
                  <a
                    href="#top"
                    onClick={() => window.setTimeout(() => document.getElementById("link")?.focus(), 400)}
                    className="block rounded-xl border border-white/15 px-5 py-3.5 text-center text-[15px] font-semibold transition hover:border-accent hover:text-accent"
                  >
                    {p.cta}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => notify("Оплата скоро будет доступна.")}
                    className={`w-full rounded-xl px-5 py-3.5 text-[15px] font-semibold transition ${
                      p.featured ? "bg-accent text-accent-ink hover:bg-accent-2" : "border border-white/15 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {p.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
