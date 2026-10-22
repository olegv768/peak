const QA = [
  [
    "Чем Пик отличается от Opus Clip и CapCut?",
    "Они режут любое видео: фильмы, сериалы, подкасты — и смотрят только на картинку и звук. Пик сделан именно для стримов: он видит ещё и реакцию зрителей — чат, донаты и клипы.",
  ],
  [
    "С какими платформами работает?",
    "Записи стримов с Twitch, VK Play Live, VK Видео, YouTube, Kick и Rutube. Готовые шорты — для TikTok, Reels и YouTube Shorts.",
  ],
  [
    "Нужно ли что-то скачивать или устанавливать?",
    "Нет. Достаточно вставить ссылку на запись стрима. Если хотите, можно загрузить файл чата и запись — анализ пройдёт прямо в браузере.",
  ],
  ["Куда уходят мои файлы?", "Никуда. Загруженные чат и запись обрабатываются в вашем браузере и не отправляются на сервер."],
  [
    "Как Пик находит моменты?",
    "Речь распознаётся нейросетью, эмоции на лице — компьютерным зрением, чат, донаты и клипы берутся с платформ. Момент — там, где несколько сигналов сработали одновременно.",
  ],
  ["А авторские права?", "Вы загружаете свой стрим — это ваш контент. Пик режет только то, что вы ему дали."],
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 border-t border-line py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <p className="text-sm font-semibold text-accent">Вопросы</p>
          <h2 className="mt-3 font-display text-[clamp(30px,4vw,48px)] font-bold leading-[1.05] tracking-[-0.03em]">Частые вопросы</h2>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {QA.map(([q, a]) => (
            <details key={q} className="group py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {q}
                <span
                  aria-hidden="true"
                  className="grid size-8 flex-none place-items-center rounded-full border border-line text-xl leading-none text-muted transition group-open:rotate-45 group-open:border-accent group-open:text-accent"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[62ch] pb-5 leading-relaxed text-soft">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
