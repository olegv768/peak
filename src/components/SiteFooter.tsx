const COLUMNS = [
  {
    title: "Продукт",
    links: [
      ["Возможности", "#features"],
      ["Как работает", "#how"],
      ["Тарифы", "#pricing"],
    ],
  },
  {
    title: "Попробовать",
    links: [
      ["Вставить ссылку", "#top"],
      ["Свой чат", "#own"],
      ["Вопросы", "#faq"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bg-2 pb-[calc(32px+env(safe-area-inset-bottom,0px))] pt-16 text-sm">
      <div className="container-page grid gap-10 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]">
        <div>
          <span className="font-display text-2xl font-extrabold">
            Пик<span className="text-accent">.</span>
          </span>
          <p className="mt-3 max-w-[34ch] text-muted">Лучшие моменты стримов — в шорты для TikTok, Reels и Shorts. Автоматически.</p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <h3 className="font-semibold">{c.title}</h3>
            <ul className="mt-4 grid gap-2.5 text-muted">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="transition hover:text-ink">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-page mt-14 flex flex-wrap justify-between gap-3 border-t border-line pt-6 text-muted">
        <span>© 2026 Пик</span>
        <span>Idea Battle · Волосов Олег</span>
      </div>
    </footer>
  );
}
