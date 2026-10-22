/* Две ленты крест-накрест, как плёнка поперёк страницы: реплики чата и шесть сигналов. */

const CHAT = [
  ["nika", "АХАХАХ ОРУ"],
  ["pro100", "КЛИП КЛИП КЛИП"],
  ["донат 500 ₽", "это в шорты!"],
  ["sanya_ok", "ВЫ ЭТО ВИДЕЛИ?"],
  ["kotik", "GG"],
  ["mrk", "легенда"],
  ["lena_k", "он подпрыгнул 😂"],
  ["dimas", "ЭЙС"],
];
const SIGNALS = ["Голос", "Эмоции", "Слова", "Чат", "Донаты", "Клипы"];

function Row({ children, reverse }: { children: React.ReactNode; reverse?: boolean }) {
  return (
    <div className="flex w-max animate-marquee gap-0 motion-reduce:animate-none" style={reverse ? { animationDirection: "reverse" } : undefined}>
      {/* содержимое дважды — лента бесшовная */}
      <div className="flex shrink-0 items-center">{children}</div>
      <div className="flex shrink-0 items-center" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

export function ChatTicker() {
  return (
    <div className="relative z-10 -my-10 overflow-hidden py-14" aria-hidden="true">
      <div className="-rotate-2 bg-yellow py-3 text-bg shadow-[0_20px_40px_-20px_rgb(0_0_0/0.8)]">
        <Row reverse>
          {[...SIGNALS, ...SIGNALS].map((s, i) => (
            <span key={i} className="flex items-center gap-6 pr-6 font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
              {s}
              <span className="size-2.5 rounded-full bg-bg" />
            </span>
          ))}
        </Row>
      </div>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 rotate-[1.5deg] bg-accent py-3 text-accent-ink shadow-[0_20px_40px_-20px_rgb(0_0_0/0.8)]">
        <Row>
          {CHAT.map(([nick, msg]) => (
            <span key={nick} className="flex items-baseline gap-2 pr-10 text-lg sm:text-xl">
              <b className="font-mono text-sm font-bold opacity-70">{nick}:</b>
              <span className="font-bold">{msg}</span>
            </span>
          ))}
        </Row>
      </div>
    </div>
  );
}
