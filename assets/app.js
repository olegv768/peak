/* Пик — интерфейс. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const SIG = PEAK.SIGNALS;
  const KINDS = PEAK.KINDS;
  const B = 240;          // столбиков на шкале
  const ROW = 38;         // высота дорожки
  const TOP = 24;         // место под номера моментов

  const fmt = (s) => {
    s = Math.max(0, Math.round(s));
    const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    return h + ":" + String(m).padStart(2, "0") + ":" + String(x).padStart(2, "0");
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };
  function rng(seed) { let x = seed >>> 0 || 1; return () => (x = (x * 1664525 + 1013904223) >>> 0) / 4294967296; }
  function hash(str) { let h = 2166136261; for (const ch of str) h = Math.imul(h ^ ch.codePointAt(0), 16777619); return h >>> 0; }

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 3200);
  }

  /* ---------- signal lanes for an example stream ---------- */
  function sampleLanes(sample) {
    const r = rng(hash(sample.id));
    const lanes = {};
    const sparse = { words: 0.12, donate: 0.035, clips: 0.03 };
    SIG.forEach((s, k) => {
      const arr = new Array(B).fill(0);
      for (let i = 0; i < B; i++) {
        if (sparse[s.id]) arr[i] = r() < sparse[s.id] ? 0.15 + r() * 0.25 : 0;
        else arr[i] = 0.1 + r() * 0.16 + 0.05 * Math.sin(i / 15 + k);
      }
      lanes[s.id] = arr;
    });
    const hot = new Set(sample.moments.map((m) => Math.floor(m.t / sample.duration * B)));
    for (let k = 0; k < 5; k++) { // одиночные всплески: один сигнал — ещё не момент
      const lane = SIG[Math.floor(r() * SIG.length)].id, i = Math.floor(r() * B);
      if (![...hot].some((h) => Math.abs(h - i) < 4)) lanes[lane][i] = 0.6 + r() * 0.2;
    }
    sample.moments.forEach((m) => {
      const i = Math.min(B - 1, Math.floor(m.t / sample.duration * B));
      m.signals.forEach((id) => {
        const j = Math.min(B - 1, i + (id === "chat" || id === "clips" ? 1 : 0));
        lanes[id][j] = Math.max(lanes[id][j], 0.86 + r() * 0.14);
        if (j + 1 < B && id !== "donate") lanes[id][j + 1] = Math.max(lanes[id][j + 1], 0.42 + r() * 0.2);
      });
    });
    return lanes;
  }

  /* ---------- timeline ---------- */
  const TL = { lanes: null, moments: [], dur: 1, reveal: {}, shown: 0, hot: new Set(), ctx: null };
  function hotBins() {
    TL.hot = new Set();
    TL.moments.slice(0, TL.shown).forEach((m) => {
      const a = Math.floor(m.t / TL.dur * B), b = Math.floor((m.t + m.len) / TL.dur * B);
      for (let i = a - 1; i <= b + 1; i++) TL.hot.add(i);
    });
  }
  function momentBox(m, W) {
    const x0 = m.t / TL.dur * W, x1 = (m.t + m.len) / TL.dur * W;
    const w = Math.max(x1 - x0, 10);
    return { x: x0 + (x1 - x0) / 2 - w / 2 - 3, w: w + 6 };
  }
  function drawTL() {
    const cv = $("timeline"), dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H = cv.clientHeight;
    if (!W) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const g = cv.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const bw = W / B;
    TL.moments.slice(0, TL.shown).forEach((m, k) => {
      const b = momentBox(m, W);
      g.fillStyle = "rgba(255, 90, 31, 0.16)";
      g.fillRect(b.x, TOP - 4, b.w, ROW * SIG.length + 4);
      const cx = b.x + b.w / 2;
      g.beginPath(); g.arc(cx, 11, 10, 0, Math.PI * 2); g.fillStyle = "#FF5A1F"; g.fill();
      g.fillStyle = "#160803"; g.font = "700 11px Unbounded, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(String(k + 1), cx, 11.5);
    });
    SIG.forEach((s, r) => {
      const base = TOP + (r + 1) * ROW - 6;
      g.fillStyle = "#1C2338"; g.fillRect(0, base, W, 1);
      const arr = TL.lanes && TL.lanes[s.id];
      if (!arr) {
        g.fillStyle = "#3A4462"; g.font = "11px 'JetBrains Mono', monospace"; g.textAlign = "left"; g.textBaseline = "alphabetic";
        g.fillText("скоро", 6, base - 10);
        return;
      }
      const lim = Math.floor((TL.reveal[s.id] || 0) * B);
      for (let i = 0; i < lim; i++) {
        const v = arr[i]; if (!v) continue;
        const h = Math.max(2, v * (ROW - 12));
        g.fillStyle = TL.hot.has(i) && v > 0.3 ? "#FF5A1F" : v > 0.55 ? "#8C95AB" : "#39425E";
        g.fillRect(i * bw + bw * 0.15, base - h, Math.max(1, bw * 0.7), h);
      }
    });
  }
  function drawAxis() {
    const ax = $("tlAxis"); ax.innerHTML = "";
    const step = [600, 1800, 3600, 7200].find((s) => TL.dur / s <= 7) || 7200;
    for (let s = 0; s <= TL.dur; s += step) {
      const sp = document.createElement("span");
      sp.style.left = Math.min(97, Math.max(3, s / TL.dur * 100)) + "%";
      sp.textContent = fmt(s).replace(/:00$/, "");
      ax.appendChild(sp);
    }
  }
  function momentAt(ev) {
    const cv = $("timeline"), r = cv.getBoundingClientRect(), x = ev.clientX - r.left;
    let found = -1;
    TL.moments.slice(0, TL.shown).forEach((m, k) => { const b = momentBox(m, r.width); if (x >= b.x - 4 && x <= b.x + b.w + 4) found = k; });
    return found;
  }
  $("timeline").addEventListener("mousemove", (ev) => { $("timeline").style.cursor = momentAt(ev) >= 0 ? "pointer" : "default"; });
  $("timeline").addEventListener("click", (ev) => { const k = momentAt(ev); if (k >= 0) openModal(TL.moments[k], TL.ctx); });

  /* ---------- vertical short (mock or real video) ---------- */
  const NICKS = ["zritel_17", "nika", "pro100", "sanya_ok", "mrk", "lena_k", "dimas", "kotik"];
  function makeShort(m, ctx, opts) {
    opts = opts || {};
    const k = KINDS[m.kind] || KINDS.burst;
    const el = document.createElement("div");
    el.className = "short" + (opts.large ? " short-lg" : "");
    el.style.setProperty("--a", k.a); el.style.setProperty("--b", k.b);
    el.innerHTML =
      '<div class="short-bg"><i></i><i></i><i></i></div><div class="short-bar"><span></span></div>' +
      `<div class="short-top"><span class="tag">@${esc(ctx.streamer)}</span><span class="kind">${esc(k.label)}</span></div>` +
      '<div class="short-subs"></div><div class="short-chat"></div><div class="short-play"></div>';
    const bar = el.querySelector(".short-bar span"), subsEl = el.querySelector(".short-subs"), chatEl = el.querySelector(".short-chat");
    let video = null;
    if (ctx.videoUrl) {
      video = document.createElement("video");
      video.src = ctx.videoUrl; video.muted = !opts.large; video.playsInline = true; video.preload = "metadata";
      el.querySelector(".short-bg").replaceWith(video);
      video.addEventListener("loadedmetadata", () => { if (!timer) video.currentTime = m.t + Math.min(5, m.len / 2); }, { once: true });
    }
    const subs = m.subs && m.subs.length ? m.subs : ["…"];
    const chat = m.chat || [];
    const D = 8000;
    let timer = null, start = 0, curSub = -1, curChat = -1;
    const showSub = (i) => {
      subsEl.innerHTML = subs[i].split(" ").map((w, j, a) => `<span class="${j === a.length - 1 ? "hl" : ""}">${esc(w)}</span>`).join(" ");
    };
    const showChat = (n) => {
      chatEl.innerHTML = chat.slice(Math.max(0, n - 3), n)
        .map((c, j) => `<p><b>${NICKS[(n - 3 + j + NICKS.length * 3 + hash(c)) % NICKS.length]}</b>${esc(c)}</p>`).join("");
    };
    function frame() {
      let p;
      if (video) {
        if (video.currentTime >= m.t + m.len || video.currentTime < m.t - 1) video.currentTime = m.t;
        p = Math.min(1, Math.max(0, (video.currentTime - m.t) / m.len));
      } else {
        p = ((performance.now() - start) % D) / D;
      }
      bar.style.width = (p * 100).toFixed(1) + "%";
      const si = Math.min(subs.length - 1, Math.floor(p * subs.length));
      if (si !== curSub) { curSub = si; showSub(si); }
      const ci = Math.min(chat.length, Math.floor(p * (chat.length + 1.5)));
      if (ci !== curChat) { curChat = ci; showChat(ci); }
    }
    function play() {
      if (timer) return;
      el.classList.add("playing");
      start = performance.now(); curSub = -1; curChat = -1;
      if (video) { video.currentTime = m.t; video.play().catch(() => {}); }
      frame(); timer = setInterval(frame, 80);
    }
    function stop() {
      clearInterval(timer); timer = null;
      el.classList.remove("playing");
      bar.style.width = "0";
      if (video) video.pause();
      showSub(0); chatEl.innerHTML = "";
    }
    showSub(0);
    return { el, play, stop };
  }

  /* ---------- modal ---------- */
  let modalShort = null;
  function openModal(m, ctx) {
    const k = KINDS[m.kind] || KINDS.burst;
    $("mKind").textContent = k.label;
    $("mTitle").textContent = m.title;
    $("mTime").textContent = `${fmt(m.t)} – ${fmt(m.t + m.len)} · ${m.len} с · вертикально 9:16`;
    $("mWhy").textContent = m.why;
    $("mSignals").innerHTML = SIG.map((s) => `<span class="${m.signals.includes(s.id) ? "on" : ""}">${esc(s.name)}</span>`).join("");
    $("mChat").innerHTML = (m.chat || []).map((c) => `<span>${esc(c)}</span>`).join("");
    if (modalShort) modalShort.stop();
    const box = $("mShort"); box.innerHTML = "";
    modalShort = makeShort(m, ctx, { large: true });
    box.appendChild(modalShort.el);
    $("modal").hidden = false;
    document.body.style.overflow = "hidden";
    modalShort.play();
    $("modal").querySelector(".modal-x").focus();
  }
  function closeModal() {
    if (modalShort) { modalShort.stop(); modalShort = null; }
    $("mShort").innerHTML = "";
    $("modal").hidden = true;
    document.body.style.overflow = "";
  }
  $("modal").addEventListener("click", (ev) => {
    if (ev.target.closest("[data-close]")) closeModal();
    const stub = ev.target.closest("[data-stub]");
    if (stub) toast(`${stub.dataset.stub} скоро будет доступно.`);
  });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && !$("modal").hidden) closeModal(); });

  /* ---------- run: processing animation, then results ---------- */
  const STAGES_FULL = [
    { label: "Скачиваем запись и чат", ms: 1000 },
    { label: "Слушаем голос стримера", lane: "voice", ms: 850 },
    { label: "Смотрим на эмоции на камере", lane: "face", ms: 850 },
    { label: "Расшифровываем речь", lane: "words", ms: 750 },
    { label: "Читаем чат", lane: "chat", ms: 850 },
    { label: "Находим донаты", lane: "donate", ms: 550 },
    { label: "Собираем клипы зрителей", lane: "clips", ms: 550 },
    { label: "Режем шорты 9:16 и добавляем субтитры", cut: true, ms: 1400 }
  ];
  const STAGES_OWN = [
    { label: "Читаем файл чата", ms: 500 },
    { label: "Считаем зрителей в чате", lane: "chat", ms: 1100 },
    { label: "Ищем всплески и режем моменты", cut: true, ms: 1000 }
  ];
  let runToken = 0;
  let cards = [];

  function run(job) {
    const token = ++runToken;
    cards.forEach((c) => c.stop()); cards = [];
    TL.lanes = job.lanes; TL.moments = job.moments; TL.dur = job.dur; TL.reveal = {}; TL.shown = 0; TL.ctx = job.ctx; hotBins();
    $("run").hidden = false;
    $("results").hidden = true;
    $("runEyebrow").textContent = job.eyebrow;
    $("runTitle").textContent = job.title;
    $("runMeta").textContent = job.meta;
    $("runNotice").hidden = !job.notice;
    $("runNotice").textContent = job.notice || "";
    $("laneLabels").innerHTML = '<div style="height:' + TOP + 'px"></div>' +
      SIG.map((s) => `<div class="${job.lanes[s.id] ? "" : "dim"}">${esc(s.name)}</div>`).join("");
    $("steps").innerHTML = job.stages.map((s) => `<li>${esc(s.label)}</li>`).join("");
    $("skipBtn").hidden = false;
    drawAxis(); drawTL();
    $("run").scrollIntoView({ behavior: "smooth", block: "start" });

    const lis = [...$("steps").children];
    const total = job.stages.reduce((a, s) => a + s.ms, 0);
    const t0 = performance.now();
    let skip = false;
    $("skipBtn").onclick = () => { skip = true; };
    function tick() {
      if (token !== runToken) return;
      const el = skip ? total : performance.now() - t0;
      let acc = 0;
      job.stages.forEach((s, i) => {
        const p = Math.min(1, Math.max(0, (el - acc) / s.ms));
        lis[i].className = p >= 1 ? "done" : p > 0 ? "active" : "";
        if (s.lane) TL.reveal[s.lane] = p;
        if (s.cut) { const n = Math.ceil(p * job.moments.length); if (n !== TL.shown) { TL.shown = n; hotBins(); } }
        acc += s.ms;
      });
      drawTL();
      if (el < total) requestAnimationFrame(tick);
      else finish(job);
    }
    requestAnimationFrame(tick);
  }

  function finish(job) {
    SIG.forEach((s) => (TL.reveal[s.id] = 1));
    TL.shown = job.moments.length; hotBins(); drawTL();
    $("skipBtn").hidden = true;
    const n = job.moments.length;
    $("resultsTitle").textContent = n ? `Готово: ${n} ${plural(n, "шорт", "шорта", "шортов")}` : "Моментов не нашлось";
    const box = $("shorts"); box.innerHTML = "";
    if (!n) {
      box.innerHTML = '<p class="muted">В этом чате нет заметных всплесков. Нужен стрим хотя бы с несколькими десятками активных зрителей.</p>';
    }
    job.moments.forEach((m, k) => {
      const item = document.createElement("div");
      item.className = "short-item"; item.style.animationDelay = (k * 70) + "ms";
      const s = makeShort(m, job.ctx);
      s.el.tabIndex = 0; s.el.setAttribute("role", "button"); s.el.setAttribute("aria-label", `Открыть момент ${k + 1}: ${m.title}`);
      s.el.addEventListener("mouseenter", s.play);
      s.el.addEventListener("mouseleave", s.stop);
      s.el.addEventListener("click", () => { s.stop(); openModal(m, job.ctx); });
      s.el.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openModal(m, job.ctx); } });
      const cap = document.createElement("div");
      cap.className = "short-cap";
      cap.innerHTML = `<b>${k + 1}. ${esc(m.title)}</b><span class="mono">${fmt(m.t)} · ${m.len} с</span>` +
        `<div class="dots">${SIG.map((sg) => `<i class="${m.signals.includes(sg.id) ? "on" : ""}">${esc(sg.name)}</i>`).join("")}</div>`;
      item.append(s.el, cap);
      box.appendChild(item);
      cards.push(s);
    });
    $("results").hidden = false;
  }

  function runSample(sample, notice) {
    const moments = [...sample.moments].sort((a, b) => a.t - b.t);
    run({
      eyebrow: notice ? "Пример результата" : "Пример стрима",
      title: sample.title,
      meta: `@${sample.streamer} · ${sample.platform} · ${sample.category} · ${fmt(sample.duration)} · до ${sample.peakViewers.toLocaleString("ru-RU")} зрителей`,
      notice,
      lanes: sampleLanes(sample),
      moments, dur: sample.duration,
      stages: STAGES_FULL,
      ctx: { streamer: sample.streamer }
    });
  }

  /* ---------- hero ---------- */
  const heroSample = PEAK.SAMPLES[0];
  const hero = makeShort(heroSample.moments[0], { streamer: heroSample.streamer });
  $("heroShort").appendChild(hero.el);
  hero.el.style.cursor = "default";
  hero.play();

  $("sampleChips").innerHTML = PEAK.SAMPLES.map((s, i) =>
    `<button class="chip" type="button" data-i="${i}">${esc(s.category)}<small>${Math.floor(s.duration / 3600)} ч ${Math.round(s.duration % 3600 / 60)} мин</small></button>`).join("");
  $("sampleChips").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-i]"); if (b) runSample(PEAK.SAMPLES[Number(b.dataset.i)]);
  });

  const HOSTS = /(^|\.)(twitch\.tv|vkplay\.live|vkplay\.ru|live\.vkvideo\.ru|vkvideo\.ru|vk\.com|youtube\.com|youtu\.be|kick\.com|rutube\.ru)$/i;
  $("linkForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const raw = $("linkInput").value.trim();
    const err = $("linkError");
    let url = null;
    try { url = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw); } catch (e) { url = null; }
    if (!raw || !url || !HOSTS.test(url.hostname)) {
      err.textContent = "Вставьте ссылку на запись стрима: Twitch, VK Play Live, VK Видео, YouTube, Kick или Rutube.";
      err.hidden = false; $("linkInput").focus();
      return;
    }
    err.hidden = true;
    const sample = PEAK.SAMPLES[hash(url.href) % PEAK.SAMPLES.length];
    runSample(sample, `Загрузка стрима по ссылке скоро заработает. Пока показываем, как будет выглядеть результат, на примере стрима «${sample.title}».`);
  });

  /* ---------- own stream (real chat analysis) ---------- */
  const own = { msgs: null, name: "", videoUrl: null, videoDur: 0 };
  function ownError(msg) { $("ownError").textContent = msg; $("ownError").hidden = !msg; }
  $("chatFile").addEventListener("change", async (ev) => {
    const f = ev.target.files[0]; if (!f) return;
    try {
      const msgs = PEAK.parseChat(await f.text());
      if (!msgs.length) throw new Error("в файле нет сообщений с временем");
      own.msgs = msgs; own.name = f.name;
      $("chatName").textContent = `${f.name} · ${msgs.length.toLocaleString("ru-RU")} сообщений`;
      $("chatName").parentElement.classList.add("ok");
      $("ownBtn").disabled = false; ownError("");
    } catch (e) {
      own.msgs = null; $("ownBtn").disabled = true;
      ownError(`Не удалось прочитать «${f.name}»: ${e.message}. Подойдёт чат из TwitchDownloader в JSON или TXT.`);
    }
  });
  $("videoFile").addEventListener("change", (ev) => {
    const f = ev.target.files[0]; if (!f) return;
    if (own.videoUrl) URL.revokeObjectURL(own.videoUrl);
    own.videoUrl = URL.createObjectURL(f);
    const v = document.createElement("video");
    v.preload = "metadata"; v.src = own.videoUrl;
    v.onloadedmetadata = () => { own.videoDur = v.duration || 0; };
    $("videoName").textContent = f.name;
    $("videoName").parentElement.classList.add("ok");
  });
  function runOwn(msgs, title, videoUrl, videoDur) {
    const dur = Math.max(msgs[msgs.length - 1].t + 30, videoDur || 0);
    const res = PEAK.analyzeChat(msgs, dur);
    const src = res.chatBins, n = src.length, chatLane = new Array(B).fill(0);
    for (let i = 0; i < B; i++) {
      const a = Math.floor(i / B * n), b = Math.max(a + 1, Math.floor((i + 1) / B * n));
      for (let j = a; j < b; j++) chatLane[i] = Math.max(chatLane[i], src[j] || 0);
    }
    const max = Math.max(1, ...chatLane);
    const lanes = { chat: chatLane.map((v) => v / max) };
    const uniq = new Set(msgs.map((m) => m.u)).size;
    run({
      eyebrow: "Ваш стрим · настоящий анализ чата",
      title,
      meta: `${fmt(dur)} · ${msgs.length.toLocaleString("ru-RU")} сообщений · ${uniq.toLocaleString("ru-RU")} зрителей писали в чат`,
      notice: videoUrl ? "" : "Без записи шорты показаны с репликами чата. Загрузите запись, чтобы смотреть сами моменты.",
      lanes, moments: res.moments, dur,
      stages: STAGES_OWN,
      ctx: { streamer: "ваш_канал", videoUrl }
    });
  }
  $("ownBtn").addEventListener("click", () => { if (own.msgs) runOwn(own.msgs, own.name, own.videoUrl, own.videoDur); });
  $("sampleChatBtn").addEventListener("click", () => {
    const s = PEAK.makeSampleChat();
    runOwn(s.msgs, "Пример чата: 3-часовой стрим", null, 0);
  });

  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (!$("run").hidden) drawTL(); }, 80); });
  if (document.fonts) document.fonts.ready.then(() => { if (!$("run").hidden) drawTL(); });
})();
