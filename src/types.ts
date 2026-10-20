export type SignalId = "voice" | "face" | "words" | "chat" | "donate" | "clips";

export interface Signal {
  id: SignalId;
  name: string;
  hint: string;
  group: "Стример" | "Зрители";
}

export type KindId = "shock" | "laugh" | "win" | "fail" | "money" | "story" | "burst";

export interface Kind {
  label: string;
  /** два цвета фона карточки шорта */
  a: string;
  b: string;
}

export interface Moment {
  /** начало, секунды от начала стрима */
  t: number;
  /** длина клипа, секунды */
  len: number;
  kind: KindId;
  title: string;
  why: string;
  signals: SignalId[];
  /** субтитры шорта, по фразе за раз */
  subs: string[];
  chat: string[];
}

export interface Sample {
  id: string;
  title: string;
  streamer: string;
  platform: string;
  category: string;
  duration: number;
  peakViewers: number;
  moments: Moment[];
}

/** Ряд значений 0…1 на каждой дорожке шкалы; нет дорожки — сигнал ещё не подключён. */
export type Lanes = Partial<Record<SignalId, number[]>>;

export interface Stage {
  label: string;
  ms: number;
  lane?: SignalId;
  cut?: boolean;
}

export interface ShortCtx {
  streamer: string;
  videoUrl?: string | null;
}

export interface Job {
  id: number;
  eyebrow: string;
  title: string;
  meta: string;
  notice?: string;
  lanes: Lanes;
  moments: Moment[];
  dur: number;
  stages: Stage[];
  ctx: ShortCtx;
}

export interface ChatMessage {
  t: number;
  u: string;
  b: string;
}
