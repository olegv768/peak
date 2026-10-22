interface Props {
  onSample: () => void;
}

/** Финал как в питче: крупная фраза и два действия. */
export function FinalCta({ onSample }: Props) {
  return (
    <section className="relative overflow-hidden py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_80%_at_50%_100%,rgb(255_90_31/0.28),transparent_70%)]"
      />
      <div className="container-page relative">
        <h2 className="font-display text-[clamp(40px,8vw,120px)] font-extrabold leading-[0.92] tracking-[-0.045em]">
          <span className="block text-[#3a4462]">Стример делает шоу.</span>
          <span className="block">
            <span className="text-accent">Пик</span> делает из него шорты.
          </span>
        </h2>
        <div className="mt-12 flex flex-wrap gap-3">
          <a
            href="#top"
            onClick={() => window.setTimeout(() => document.getElementById("link")?.focus(), 400)}
            className="rounded-xl bg-accent px-7 py-4 text-[15px] font-semibold text-accent-ink transition hover:bg-accent-2"
          >
            Вставить ссылку на стрим
          </a>
          <button
            type="button"
            onClick={onSample}
            className="rounded-xl border border-white/15 px-7 py-4 text-[15px] font-semibold transition hover:border-accent hover:text-accent"
          >
            Посмотреть пример
          </button>
        </div>
      </div>
    </section>
  );
}
