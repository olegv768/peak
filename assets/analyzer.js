/* Пик — настоящий поиск моментов по чату стрима (работает в браузере).
   Формат чата: TwitchDownloader JSON или TXT («[0:12:34] ник: текст»). */
window.PEAK = window.PEAK || {};

(function () {
  const BIN = 10;     // секунд в одном отрезке
  const PRE = 25;     // чат отстаёт от события, поэтому начинаем раньше всплеска
  const POST = 12;
  const MAX = 10;

  const KIND_RE = [
    ["laugh", /(ха){2,}|(ах){2,}|kekw|lul|\blol\b|\bxd\b|ору|орну|😂|🤣|\){3,}/i, "Чат лёг от смеха"],
    ["shock", /ого+|wtf|\bomg\b|жесть|чего+|что\?+|😱|monka|офиге|законно/i, "Чат в шоке"],
    ["win",   /(^|\s)gg|pog|\bez\b|изи|красав|имба|🔥|клатч|вот это/i, "Красивый момент"],
    ["fail",  /^f$|(^|\s)f(\s|$)|\brip\b|кринж|💀|позор|слил/i, "Фейл"],
    ["money", /донат|donat|₽|\$|💸/i, "Донат-момент"]
  ];
  const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };
  const kindOf = (b) => { for (const k of KIND_RE) if (k[1].test(b)) return k[0]; return null; };

  function parseTime(s) {
    const p = s.split(":").map(Number);
    if (p.some(isNaN)) return NaN;
    return p.reduce((a, v) => a * 60 + v, 0);
  }

  PEAK.parseChat = function (text) {
    const t = text.trim();
    let j = null;
    // TXT из TwitchDownloader тоже начинается с «[», поэтому JSON пробуем, а не угадываем
    if (t.startsWith("{") || t.startsWith("[")) { try { j = JSON.parse(t); } catch (e) { j = null; } }
    if (j) {
      const arr = Array.isArray(j) ? j : (j.comments || j.messages || []);
      return arr.map((c) => ({
        t: Number(c.content_offset_seconds ?? c.offset ?? c.time ?? c.t),
        u: String((c.commenter && (c.commenter.name || c.commenter.display_name || c.commenter._id)) || c.user || c.name || c.author || "?"),
        b: String((c.message && (c.message.body ?? c.message)) ?? c.text ?? c.body ?? "")
      })).filter((m) => isFinite(m.t)).sort((a, b) => a.t - b.t);
    }
    const out = [];
    const re = /^\s*\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+([^:\s][^:]{0,40}):\s?(.*)$/;
    for (const line of t.split(/\r?\n/)) {
      const m = re.exec(line);
      if (m) out.push({ t: parseTime(m[1]), u: m[2].trim(), b: m[3] });
    }
    return out.sort((a, b) => a.t - b.t);
  };

  /* Возвращает моменты в формате примеров и ряд активности чата для шкалы. */
  PEAK.analyzeChat = function (msgs, dur) {
    const n = Math.max(1, Math.ceil(dur / BIN));
    const users = Array.from({ length: n }, () => new Set());
    for (const m of msgs) users[Math.min(n - 1, Math.max(0, Math.floor(m.t / BIN)))].add(m.u);
    const a = users.map((s) => s.size);
    const sm = a.map((v, i) => ((a[i - 1] ?? v) + 2 * v + (a[i + 1] ?? v)) / 4);
    const W = Math.round(300 / BIN);
    const base = a.map((_, i) => {
      const w = a.slice(Math.max(0, i - W), Math.min(n, i + W + 1)).sort((x, y) => x - y);
      return w[Math.floor(w.length / 2)];
    });
    const cand = [];
    for (let i = 0; i < n; i++) {
      const ratio = (sm[i] + 1) / (base[i] + 1);
      if (ratio >= 2.2 && a[i] >= Math.max(4, base[i] * 1.8) && a[i] >= (a[i - 1] ?? 0) && a[i] >= (a[i + 1] ?? 0)) cand.push({ i, ratio });
    }
    cand.sort((x, y) => y.ratio - x.ratio);
    const picked = [];
    for (const c of cand) {
      if (picked.some((p) => Math.abs(p.i - c.i) < 6)) continue;
      picked.push(c);
      if (picked.length >= MAX) break;
    }
    const moments = picked.map((c) => {
      let s = c.i;
      while (s > 0 && a[s - 1] > base[s - 1] * 1.6 && c.i - s < 4) s--;
      const t0 = s * BIN;
      const start = Math.max(0, t0 - PRE);
      const end = Math.min(dur, t0 + POST + (c.i - s) * BIN);
      const win = msgs.filter((m) => m.t >= t0 && m.t < (c.i + 2) * BIN);
      const kc = {}, freq = new Map(), viewers = new Set();
      for (const m of win) {
        viewers.add(m.u);
        const k = kindOf(m.b); if (k) kc[k] = (kc[k] || 0) + 1;
        const key = m.b.trim().slice(0, 40);
        if (key) freq.set(key, (freq.get(key) || 0) + 1);
      }
      let kind = null, best = 0;
      for (const k in kc) if (kc[k] > best) { best = kc[k]; kind = k; }
      if (best < win.length * 0.15) kind = null;
      const top = [...freq.entries()].sort((x, y) => y[1] - x[1]).map((e) => e[0]);
      const titleRow = KIND_RE.find((k) => k[0] === kind);
      const signals = ["chat"];
      if (kc.money) signals.push("donate");
      return {
        t: start, len: Math.round(end - start), kind: kind || "burst",
        title: titleRow ? titleRow[2] : "Всплеск в чате",
        why: `${viewers.size} ${plural(viewers.size, "зритель написал", "зрителя написали", "зрителей написали")} в чат за ${(c.i - s + 2) * BIN} секунд — в ${c.ratio.toFixed(1).replace(".", ",")} раза больше обычного.`,
        signals,
        subs: top.filter((q) => q.length <= 18 && !q.startsWith("[")).slice(0, 4).map((q) => q.toUpperCase()),
        chat: top.slice(0, 6),
        real: true
      };
    }).sort((x, y) => x.t - y.t);
    return { moments, chatBins: a };
  };

  /* Синтетический чат 3-часового стрима — чтобы проверить анализ без своего файла. */
  PEAK.makeSampleChat = function () {
    let seed = 20261020;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
    const V = {
      base: ["привет", "всем ку", "что за игра?", "+", "го дальше", "какой ранг?", "сколько ещё стрим?", "лол", "давай-давай", "норм", "звук тихий", "ну такое", "ок", "😄", "о, я успел", "мид или топ?"],
      laugh: ["АХАХАХАХ", "KEKW", "ахахах ору", "ХАХАХАХА", "LUL", "😂😂😂", "ору", "ахаха что это было"],
      shock: ["ОГО", "что??", "ЖЕСТЬ", "wtf", "😱", "ого как", "чегооо", "это вообще законно?"],
      win: ["GG", "POG", "ИМБА", "красава!!", "🔥🔥🔥", "изи", "вот это клатч"],
      fail: ["F", "F", "F", "RIP", "кринж", "💀", "слил", "позор)))"],
      money: ["[донат] 500 ₽: читай вслух!", "спасибо за донат", "донатер красава", "💸💸"]
    };
    const events = [[612, "laugh", 1], [1530, "shock", .7], [2290, "money", .6], [3105, "win", 1.3], [4720, "fail", .9],
      [5480, "laugh", 1.6], [6260, "shock", 1], [7900, "win", 1.1], [8650, "fail", 1.2], [9620, "laugh", 1.2]];
    const dur = 10800, msgs = [];
    const user = (p) => "зритель_" + Math.floor(Math.pow(rnd(), p) * 900 + 1);
    for (let s = 0; s < dur; s++) {
      const r = 0.42 + 0.22 * Math.sin(s / 1500) + 0.12 * Math.sin(s / 333 + 1);
      const k = Math.floor(r + rnd());
      for (let i = 0; i < k; i++) msgs.push({ t: s + rnd(), u: user(2.2), b: pick(V.base) });
    }
    for (const [at, kind, power] of events) {
      for (let d = 3; d < 38; d++) {
        const k = Math.floor(11 * power * Math.exp(-(d - 3) / 7) + rnd());
        for (let i = 0; i < k; i++) msgs.push({ t: at + d + rnd(), u: user(1), b: rnd() < .78 ? pick(V[kind]) : pick(V.base) });
      }
    }
    msgs.sort((x, y) => x.t - y.t);
    return { msgs, dur };
  };
})();
