/* Настоящий поиск моментов по чату стрима (работает в браузере).
   Формат чата: TwitchDownloader JSON или TXT («[0:12:34] ник: текст»). */
import type { ChatMessage, KindId, Moment, SignalId } from "../types";
import { plural, rng } from "./format";

const BIN = 10; // секунд в одном отрезке
const PRE = 25; // чат отстаёт от события, поэтому начинаем раньше всплеска
const POST = 12;
const MAX = 10;

const KIND_RE: [KindId, RegExp, string][] = [
  ["laugh", /(ха){2,}|(ах){2,}|kekw|lul|\blol\b|\bxd\b|ору|орну|😂|🤣|\){3,}/i, "Чат лёг от смеха"],
  ["shock", /ого+|wtf|\bomg\b|жесть|чего+|что\?+|😱|monka|офиге|законно/i, "Чат в шоке"],
  ["win", /(^|\s)gg|pog|\bez\b|изи|красав|имба|🔥|клатч|вот это/i, "Красивый момент"],
  ["fail", /^f$|(^|\s)f(\s|$)|\brip\b|кринж|💀|позор|слил/i, "Фейл"],
  ["money", /донат|donat|₽|\$|💸/i, "Донат-момент"],
];

function kindOf(body: string): KindId | null {
  for (const [id, re] of KIND_RE) if (re.test(body)) return id;
  return null;
}

function parseTime(s: string): number {
  const parts = s.split(":").map(Number);
  if (parts.some(Number.isNaN)) return NaN;
  return parts.reduce((a, v) => a * 60 + v, 0);
}

interface RawComment {
  content_offset_seconds?: number;
  offset?: number;
  time?: number;
  t?: number;
  commenter?: { name?: string; display_name?: string; _id?: string };
  user?: string;
  name?: string;
  author?: string;
  message?: { body?: string } | string;
  text?: string;
  body?: string;
}

export function parseChat(text: string): ChatMessage[] {
  const t = text.trim();
  let json: unknown = null;
  // TXT из TwitchDownloader тоже начинается с «[», поэтому JSON пробуем, а не угадываем
  if (t.startsWith("{") || t.startsWith("[")) {
    try { json = JSON.parse(t); } catch { json = null; }
  }
  if (json) {
    const arr: RawComment[] = Array.isArray(json)
      ? json
      : ((json as { comments?: RawComment[]; messages?: RawComment[] }).comments ??
        (json as { messages?: RawComment[] }).messages ?? []);
    return arr
      .map((c) => ({
        t: Number(c.content_offset_seconds ?? c.offset ?? c.time ?? c.t),
        u: String(c.commenter?.name ?? c.commenter?.display_name ?? c.commenter?._id ?? c.user ?? c.name ?? c.author ?? "?"),
        b: String(c.message && typeof c.message === "object" ? c.message.body ?? "" : c.message ?? c.text ?? c.body ?? ""),
      }))
      .filter((m) => Number.isFinite(m.t))
      .sort((a, b) => a.t - b.t);
  }
  const out: ChatMessage[] = [];
  const re = /^\s*\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+([^:\s][^:]{0,40}):\s?(.*)$/;
  for (const line of t.split(/\r?\n/)) {
    const m = re.exec(line);
    if (m) out.push({ t: parseTime(m[1]), u: m[2].trim(), b: m[3] });
  }
  return out.sort((a, b) => a.t - b.t);
}

export interface ChatAnalysis {
  moments: Moment[];
  /** разные зрители в чате за каждые 10 секунд */
  chatBins: number[];
}

export function analyzeChat(msgs: ChatMessage[], dur: number): ChatAnalysis {
  const n = Math.max(1, Math.ceil(dur / BIN));
  const users = Array.from({ length: n }, () => new Set<string>());
  for (const m of msgs) users[Math.min(n - 1, Math.max(0, Math.floor(m.t / BIN)))].add(m.u);
  const a = users.map((s) => s.size);
  const sm = a.map((v, i) => ((a[i - 1] ?? v) + 2 * v + (a[i + 1] ?? v)) / 4);
  const W = Math.round(300 / BIN); // обычный уровень — медиана за ±5 минут
  const base = a.map((_, i) => {
    const w = a.slice(Math.max(0, i - W), Math.min(n, i + W + 1)).sort((x, y) => x - y);
    return w[Math.floor(w.length / 2)];
  });

  const cand: { i: number; ratio: number }[] = [];
  for (let i = 0; i < n; i++) {
    const ratio = (sm[i] + 1) / (base[i] + 1);
    if (ratio >= 2.2 && a[i] >= Math.max(4, base[i] * 1.8) && a[i] >= (a[i - 1] ?? 0) && a[i] >= (a[i + 1] ?? 0)) {
      cand.push({ i, ratio });
    }
  }
  cand.sort((x, y) => y.ratio - x.ratio);
  const picked: typeof cand = [];
  for (const c of cand) {
    if (picked.some((p) => Math.abs(p.i - c.i) < 6)) continue;
    picked.push(c);
    if (picked.length >= MAX) break;
  }

  const moments = picked
    .map((c): Moment => {
      let s = c.i;
      while (s > 0 && a[s - 1] > base[s - 1] * 1.6 && c.i - s < 4) s--;
      const t0 = s * BIN;
      const start = Math.max(0, t0 - PRE);
      const end = Math.min(dur, t0 + POST + (c.i - s) * BIN);
      const win = msgs.filter((m) => m.t >= t0 && m.t < (c.i + 2) * BIN);
      const kc: Partial<Record<KindId, number>> = {};
      const freq = new Map<string, number>();
      const viewers = new Set<string>();
      for (const m of win) {
        viewers.add(m.u);
        const k = kindOf(m.b);
        if (k) kc[k] = (kc[k] ?? 0) + 1;
        const key = m.b.trim().slice(0, 40);
        if (key) freq.set(key, (freq.get(key) ?? 0) + 1);
      }
      let kind: KindId | null = null;
      let best = 0;
      for (const [k, v] of Object.entries(kc) as [KindId, number][]) {
        if (v > best) { best = v; kind = k; }
      }
      if (best < win.length * 0.15) kind = null;
      const top = [...freq.entries()].sort((x, y) => y[1] - x[1]).map((e) => e[0]);
      const row = KIND_RE.find((k) => k[0] === kind);
      const signals: SignalId[] = ["chat"];
      if (kc.money) signals.push("donate");
      const v = viewers.size;
      return {
        t: start,
        len: Math.round(end - start),
        kind: kind ?? "burst",
        title: row ? row[2] : "Всплеск в чате",
        why: `${v} ${plural(v, "зритель написал", "зрителя написали", "зрителей написали")} в чат за ${(c.i - s + 2) * BIN} секунд — в ${c.ratio.toFixed(1).replace(".", ",")} раза больше обычного.`,
        signals,
        subs: top.filter((q) => q.length <= 18 && !q.startsWith("[")).slice(0, 4).map((q) => q.toUpperCase()),
        chat: top.slice(0, 6),
      };
    })
    .sort((x, y) => x.t - y.t);

  return { moments, chatBins: a };
}

/** Синтетический чат 3-часового стрима — чтобы проверить анализ без своего файла. */
export function makeSampleChat(): { msgs: ChatMessage[]; dur: number } {
  const rnd = rng(20261020);
  const pick = (arr: string[]) => arr[Math.floor(rnd() * arr.length)];
  const V: Record<string, string[]> = {
    base: ["привет", "всем ку", "что за игра?", "+", "го дальше", "какой ранг?", "сколько ещё стрим?", "лол", "давай-давай", "норм", "звук тихий", "ну такое", "ок", "😄", "о, я успел", "мид или топ?"],
    laugh: ["АХАХАХАХ", "KEKW", "ахахах ору", "ХАХАХАХА", "LUL", "😂😂😂", "ору", "ахаха что это было"],
    shock: ["ОГО", "что??", "ЖЕСТЬ", "wtf", "😱", "ого как", "чегооо", "это вообще законно?"],
    win: ["GG", "POG", "ИМБА", "красава!!", "🔥🔥🔥", "изи", "вот это клатч"],
    fail: ["F", "F", "F", "RIP", "кринж", "💀", "слил", "позор)))"],
    money: ["[донат] 500 ₽: читай вслух!", "спасибо за донат", "донатер красава", "💸💸"],
  };
  const events: [number, string, number][] = [[612, "laugh", 1], [1530, "shock", 0.7], [2290, "money", 0.6], [3105, "win", 1.3], [4720, "fail", 0.9],
    [5480, "laugh", 1.6], [6260, "shock", 1], [7900, "win", 1.1], [8650, "fail", 1.2], [9620, "laugh", 1.2]];
  const dur = 10800;
  const msgs: ChatMessage[] = [];
  const user = (p: number) => "зритель_" + Math.floor(Math.pow(rnd(), p) * 900 + 1);
  for (let s = 0; s < dur; s++) {
    const r = 0.42 + 0.22 * Math.sin(s / 1500) + 0.12 * Math.sin(s / 333 + 1);
    const k = Math.floor(r + rnd());
    for (let i = 0; i < k; i++) msgs.push({ t: s + rnd(), u: user(2.2), b: pick(V.base) });
  }
  for (const [at, kind, power] of events) {
    for (let d = 3; d < 38; d++) {
      const k = Math.floor(11 * power * Math.exp(-(d - 3) / 7) + rnd());
      for (let i = 0; i < k; i++) msgs.push({ t: at + d + rnd(), u: user(1), b: rnd() < 0.78 ? pick(V[kind]) : pick(V.base) });
    }
  }
  msgs.sort((x, y) => x.t - y.t);
  return { msgs, dur };
}
