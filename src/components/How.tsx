const STREAMER = [
  ["Голос", "крик, смех, резкая смена тона"],
  ["Эмоции на камере", "удивление, шок, смех"],
  ["Слова", "«не может быть», «смотрите», «я в шоке»"],
];
const VIEWERS = [
  ["Чат", "сколько разных зрителей пишут: «АХАХА», «ОГО»"],
  ["Донаты", "когда пришёл донат и что в сообщении"],
  ["Клипы", "что зрители сами вырезали на Twitch"],
];
const STEPS = [
  ["Ссылка", "Вставляете ссылку на запись стрима."],
  ["Сигналы", "Пик разбирает видео, звук, чат и донаты."],
  ["Шорты", "Получаете вертикальные ролики с субтитрами."],
];

function Column({ title, items }: { title: string; items: string[][] }) {
  return (
    <div>
      <h3 className="mb-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">{title}</h3>
      <ul className="grid gap-2.5">
        {items.map(([name, hint]) => (
          <li key={name} className="grid gap-0.5 rounded-2xl border border-line bg-surface px-4 py-3.5">
            <b className="text-base">{name}</b>
            <span className="text-sm text-muted">{hint}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function How() {
  return (
    <section id="how" className="scroll-mt-16 py-26">
      <div className="container-page">
        <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Как это работает</p>
        <h2 className="max-w-[20ch] font-display text-[clamp(28px,4vw,44px)] font-bold leading-[1.1] tracking-tight">
          Момент — там, где совпали все сигналы
        </h2>
        <div className="mt-12 grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <Column title="Стример" items={STREAMER} />
          <div className="grid size-[190px] place-content-center justify-self-center rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--color-accent-2),var(--color-accent))] text-center text-accent-ink shadow-[0_0_80px_-10px_rgb(255_90_31/0.6)]">
            <span className="font-display text-[34px] font-extrabold leading-none">Пик</span>
            <small className="mt-2 text-[13px] font-semibold">
              находит момент
              <br />и режет шорт 9:16
            </small>
          </div>
          <Column title="Зрители" items={VIEWERS} />
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {STEPS.map(([name, text], i) => (
            <div key={name} className="border-t border-line pt-[18px]">
              <span className="font-mono text-[13px] font-bold text-accent">{i + 1}</span>
              <b className="my-1.5 block font-display text-xl">{name}</b>
              <p className="text-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
