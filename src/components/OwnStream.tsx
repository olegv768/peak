import { useEffect, useState, type ChangeEvent } from "react";
import { parseChat } from "../lib/analyzer";
import { ru } from "../lib/format";
import type { ChatMessage } from "../types";

export interface OwnInput {
  msgs: ChatMessage[];
  name: string;
  videoUrl: string | null;
  videoDur: number;
}

interface Props {
  onRun: (input: OwnInput) => void;
  onSampleChat: () => void;
}

function Drop(props: { id: string; title: string; optional?: boolean; note: string; ok: boolean; accept: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label
      htmlFor={props.id}
      className={`grid cursor-pointer gap-1 rounded-2xl border border-dashed p-[18px] transition-colors hover:border-accent hover:bg-accent/5 ${
        props.ok ? "border-accent bg-accent/5" : "border-line-2"
      }`}
    >
      <input id={props.id} type="file" accept={props.accept} className="hidden" onChange={props.onChange} />
      <b className="text-[15px]">
        {props.title}
        {props.optional && <em className="ml-1.5 text-[13px] font-normal not-italic text-muted">необязательно</em>}
      </b>
      <span className={`break-words text-[13px] ${props.ok ? "text-good" : "text-muted"}`}>{props.note}</span>
    </label>
  );
}

/** Настоящий поиск моментов по загруженному чату (и, по желанию, записи). */
export function OwnStream({ onRun, onSampleChat }: Props) {
  const [chat, setChat] = useState<{ msgs: ChatMessage[]; name: string } | null>(null);
  const [video, setVideo] = useState<{ url: string; name: string; dur: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => () => { if (video) URL.revokeObjectURL(video.url); }, [video]);

  const onChat = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const msgs = parseChat(await f.text());
      if (!msgs.length) throw new Error("в файле нет сообщений с временем");
      setChat({ msgs, name: f.name });
      setError("");
    } catch (err) {
      setChat(null);
      setError(`Не удалось прочитать «${f.name}»: ${(err as Error).message}. Подойдёт чат из TwitchDownloader в JSON или TXT.`);
    }
  };

  const onVideo = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.src = url;
    setVideo({ url, name: f.name, dur: 0 });
    v.onloadedmetadata = () => setVideo((cur) => (cur && cur.url === url ? { ...cur, dur: v.duration || 0 } : cur));
  };

  return (
    <section id="own" className="scroll-mt-16 border-t border-line bg-bg-2 py-24">
      <div className="container-page grid items-start gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Работает по-настоящему</p>
          <h2 className="font-display text-[clamp(28px,4vw,44px)] font-bold leading-[1.1] tracking-tight">Проверьте на своём стриме</h2>
          <p className="mt-[18px] max-w-[56ch] text-lg text-soft">
            Загрузите чат записи, и Пик найдёт моменты прямо в браузере: файлы никуда не отправляются. Добавьте запись, и каждый момент
            можно будет сразу посмотреть вертикально.
          </p>
          <p className="mt-4 text-sm text-muted">
            Сейчас поиск идёт по сигналу чата. Голос, эмоции, слова, донаты и клипы подключаем следующими. Чат Twitch скачивается
            программой TwitchDownloader в формате JSON или TXT.
          </p>
        </div>
        <div className="grid gap-3 rounded-[20px] border border-line bg-surface p-5">
          <Drop
            id="chatFile"
            title="Чат стрима"
            accept=".json,.txt,.log"
            ok={Boolean(chat)}
            note={chat ? `${chat.name} · ${ru(chat.msgs.length)} сообщений` : "JSON или TXT из TwitchDownloader"}
            onChange={onChat}
          />
          <Drop
            id="videoFile"
            title="Запись стрима"
            optional
            accept="video/*"
            ok={Boolean(video)}
            note={video ? video.name : "MP4, чтобы смотреть моменты"}
            onChange={onVideo}
          />
          <button
            type="button"
            disabled={!chat}
            onClick={() => chat && onRun({ msgs: chat.msgs, name: chat.name, videoUrl: video?.url ?? null, videoDur: video?.dur ?? 0 })}
            className="bg-brand w-full rounded-xl px-[22px] py-[15px] text-[15px] font-semibold text-accent-ink shadow-[0_10px_30px_-10px_rgb(255_90_31/0.7)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            Найти моменты
          </button>
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex flex-wrap justify-between gap-2.5 text-sm">
            <button type="button" onClick={onSampleChat} className="font-medium text-accent-2 underline underline-offset-[3px]">
              Нет файла? Проверить на примере чата
            </button>
            <a href="sample-chat.txt" download className="font-medium text-accent-2 underline underline-offset-[3px]">
              Скачать пример чата
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
