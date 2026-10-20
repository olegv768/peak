import { SIGNALS } from "../data/samples";
import type { Lanes, Sample, SignalId } from "../types";
import { hash, rng } from "./format";

/** Столбиков на шкале сигналов. */
export const BINS = 240;

const SPARSE: Partial<Record<SignalId, number>> = { words: 0.12, donate: 0.035, clips: 0.03 };

/** Дорожки сигналов для примера стрима: фон, одиночные ложные всплески и совпадения в моментах. */
export function sampleLanes(sample: Sample): Lanes {
  const r = rng(hash(sample.id));
  const lanes: Lanes = {};
  SIGNALS.forEach((s, k) => {
    const arr = new Array<number>(BINS).fill(0);
    const sparse = SPARSE[s.id];
    for (let i = 0; i < BINS; i++) {
      arr[i] = sparse ? (r() < sparse ? 0.15 + r() * 0.25 : 0) : 0.1 + r() * 0.16 + 0.05 * Math.sin(i / 15 + k);
    }
    lanes[s.id] = arr;
  });

  const hot = sample.moments.map((m) => Math.floor((m.t / sample.duration) * BINS));
  for (let k = 0; k < 5; k++) {
    // одиночный всплеск: один сигнал — ещё не момент
    const lane = SIGNALS[Math.floor(r() * SIGNALS.length)].id;
    const i = Math.floor(r() * BINS);
    if (!hot.some((h) => Math.abs(h - i) < 4)) lanes[lane]![i] = 0.6 + r() * 0.2;
  }

  for (const m of sample.moments) {
    const i = Math.min(BINS - 1, Math.floor((m.t / sample.duration) * BINS));
    for (const id of m.signals) {
      const arr = lanes[id]!;
      const j = Math.min(BINS - 1, i + (id === "chat" || id === "clips" ? 1 : 0));
      arr[j] = Math.max(arr[j], 0.86 + r() * 0.14);
      if (j + 1 < BINS && id !== "donate") arr[j + 1] = Math.max(arr[j + 1], 0.42 + r() * 0.2);
    }
  }
  return lanes;
}

/** Сжимает ряд активности чата до ширины шкалы и нормирует 0…1. */
export function chatLane(bins: number[]): number[] {
  const n = bins.length;
  const out = new Array<number>(BINS).fill(0);
  for (let i = 0; i < BINS; i++) {
    const a = Math.floor((i / BINS) * n);
    const b = Math.max(a + 1, Math.floor(((i + 1) / BINS) * n));
    for (let j = a; j < b; j++) out[i] = Math.max(out[i], bins[j] ?? 0);
  }
  const max = Math.max(1, ...out);
  return out.map((v) => v / max);
}
