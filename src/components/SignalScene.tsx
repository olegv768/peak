import { useEffect, useRef } from "react";

/* 3D-«ландшафт сигналов» на первом экране: шесть дорожек столбиков (голос, эмоции, слова,
   чат, донаты, клипы), по ним идёт сканер; в моментах, где совпало несколько сигналов,
   загораются оранжевые пики. three.js грузится отдельно, чтобы не тормозить первый показ. */

const ROWS = 6;
const COLS = 96;
const DX = 0.34;
const DZ = 1.5;
const MOMENTS = [46, 62, 74, 87]; // колонки моментов (правее заголовка)
const LANE_SPARSE = [false, false, true, false, true, true];

function buildHeights() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const h: number[] = [];
  const hot: boolean[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const near = MOMENTS.find((m) => c >= m && c <= m + 1);
      let v = LANE_SPARSE[r] ? (rnd() < 0.14 ? 0.5 + rnd() * 0.8 : 0.08) : 0.45 + rnd() * 0.8 + 0.3 * Math.sin(c / 6 + r);
      let isHot = false;
      // в моменте срабатывают почти все сигналы; один из них молчит — так честнее
      if (near !== undefined && (r + near) % 5 !== 0) {
        v = c === near ? 2.6 + rnd() * 1.1 : 1.5 + rnd() * 0.6;
        isHot = true;
      }
      // одиночный всплеск без совпадений — не момент
      if (!isHot && rnd() < 0.01) v = 2.4;
      h.push(v);
      hot.push(isHot);
    }
  }
  return { h, hot };
}

export function SignalScene() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { EffectComposer } = await import("three/examples/jsm/postprocessing/EffectComposer.js");
      const { RenderPass } = await import("three/examples/jsm/postprocessing/RenderPass.js");
      const { UnrealBloomPass } = await import("three/examples/jsm/postprocessing/UnrealBloomPass.js");
      const { OutputPass } = await import("three/examples/jsm/postprocessing/OutputPass.js");
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      } catch {
        return; // нет WebGL — остаётся обычный фон
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.toneMapping = THREE.NoToneMapping; // без тонмаппинга оранжевый не выцветает
      renderer.domElement.style.display = "block";
      host.appendChild(renderer.domElement);

      const BG = 0x0a0d16;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(BG);
      scene.fog = new THREE.Fog(BG, 12, 38);

      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
      const camBase = new THREE.Vector3(3, 4.6, 10.5);
      const target = new THREE.Vector3(-3, 0.9, -1.5);

      scene.add(new THREE.AmbientLight(0x9fb0e0, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(-8, 14, 10);
      scene.add(key);
      const scanLight = new THREE.PointLight(0xff6a2a, 60, 14, 1.5);
      scene.add(scanLight);

      const grid = new THREE.GridHelper(80, 80, 0x1f2740, 0x161c2e);
      grid.position.y = -0.01;
      scene.add(grid);

      const { h, hot } = buildHeights();
      const x0 = (-COLS * DX) / 2;
      const z0 = (-(ROWS - 1) * DZ) / 2;
      const geo = new THREE.BoxGeometry(0.24, 1, 0.5);
      geo.translate(0, 0.5, 0);
      const coolMat = new THREE.MeshStandardMaterial({ color: 0x46557d, emissive: 0x0a1022, metalness: 0.3, roughness: 0.45 });
      const hotMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff5a1f) });
      const coolIdx: number[] = [];
      const hotIdx: number[] = [];
      h.forEach((_, i) => (hot[i] ? hotIdx : coolIdx).push(i));
      const cool = new THREE.InstancedMesh(geo, coolMat, coolIdx.length);
      const warm = new THREE.InstancedMesh(geo, hotMat, hotIdx.length);
      scene.add(cool, warm);

      // светящаяся линия сканера поперёк всех дорожек
      const scanGeo = new THREE.BoxGeometry(0.05, 0.05, ROWS * DZ + 1.2);
      const scan = new THREE.Mesh(scanGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb070) }));
      scan.position.y = 0.03;
      scene.add(scan);

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.75, 0.6, 0.42);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());

      const m = new THREE.Matrix4();
      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const scl = new THREE.Vector3(1, 1, 1);
      const SWEEP = 9; // секунд на проход сканера
      const span = COLS * DX;

      const place = (mesh: InstanceType<typeof THREE.InstancedMesh>, idx: number[], t: number, scanX: number) => {
        idx.forEach((i, k) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const x = x0 + c * DX;
          // за сканером столбики «прочитаны» и встают в полный рост, впереди — ниже
          const read = Math.min(1, Math.max(0, (scanX - x) / 2 + 1));
          const breathe = 0.9 + 0.1 * Math.sin(t * 1.6 + c * 0.35 + r);
          const base = hot[i] ? h[i] * (0.2 + 0.8 * read) : h[i] * (0.6 + 0.4 * read) * breathe;
          pos.set(x, 0, z0 + r * DZ);
          scl.set(1, Math.max(0.04, base), 1);
          m.compose(pos, quat, scl);
          mesh.setMatrixAt(k, m);
        });
        mesh.instanceMatrix.needsUpdate = true;
      };

      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e: PointerEvent) => {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      const resize = () => {
        const w = host.clientWidth;
        const hh = host.clientHeight;
        if (!w || !hh) return;
        renderer.setSize(w, hh, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        composer.setSize(w, hh);
        bloom.resolution.set(w, hh);
        camera.aspect = w / hh;
        // на узком экране отодвигаем камеру, чтобы ландшафт помещался
        camera.position.copy(camBase).multiplyScalar(w < 700 ? 1.35 : 1);
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();

      let visible = true;
      const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
      io.observe(host);

      const clock = new THREE.Clock();
      let raf = 0;
      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden) return;
        const t = clock.getElapsedTime();
        const p = reduce ? 1 : (t % SWEEP) / SWEEP;
        const scanX = x0 - 1 + p * (span + 3);
        scan.position.x = scanX;
        scanLight.position.set(scanX, 1.6, 0);
        place(cool, coolIdx, reduce ? 0 : t, reduce ? 1e9 : scanX);
        place(warm, hotIdx, reduce ? 0 : t, reduce ? 1e9 : scanX);
        mouse.x += (mouse.tx - mouse.x) * 0.04;
        mouse.y += (mouse.ty - mouse.y) * 0.04;
        const k = host.clientWidth < 700 ? 1.35 : 1;
        camera.position.set((camBase.x + mouse.x * 2.2) * k, (camBase.y - mouse.y * 1.2) * k, camBase.z * k);
        camera.lookAt(target);
        composer.render();
      };
      frame();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        ro.disconnect();
        io.disconnect();
        composer.dispose();
        geo.dispose();
        scanGeo.dispose();
        coolMat.dispose();
        hotMat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
      if (disposed) cleanup();
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={ref} className="absolute inset-0" aria-hidden="true" />;
}
