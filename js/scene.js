/* ═══════════════════════════════════════════════════════════════
   Cooperative driving scenes — top-down animated canvas.
   Three alternating scenarios. The ego car and connected CAV
   partners scan the world with simulated LiDAR (rays actually
   cast against vehicles and road edges — occlusion is real), and
   V2X/CPM messages always flow TOWARD the ego. Detected road
   users get bounding boxes; the ego's planned trajectory is
   drawn from its own future path.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  const canvas = document.getElementById("coopCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const labelEl = document.getElementById("sceneLabel");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* palette — the scene is always dark, like a real perception viz */
  const C = {
    bg: "#0a0e17",
    road: "#121a2b",
    laneLine: "rgba(148, 163, 184, 0.35)",
    edgeLine: "rgba(148, 163, 184, 0.55)",
    crosswalk: "rgba(229, 231, 235, 0.35)",
    ego: "#22d3ee",
    cav: "#818cf8",
    other: "#475569",
    ped: "#fbbf24",
    rsu: "#818cf8",
    ptEgo: "34, 211, 238",
    ptCav: "192, 132, 252",
    box: "rgba(129, 140, 248, 0.9)",
    traj: "#22d3ee",
    v2x: "rgba(34, 211, 238, 0.55)",
    label: "#94a3b8",
  };

  let W = 0, H = 0, dpr = 1;
  let points = [];
  let hitTimes = {};
  let lidarAngle = 0;
  let sceneIdx = 0;
  let sceneTime = 0;
  let lastNow = null;
  let running = false;
  let rafId = null;

  const LOOP = 14;
  const FADE = 0.9;
  const RAYS_PER_FRAME = 12;
  const POINT_LIFE = 1.5;
  const MAX_POINTS = 900;

  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIO = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function keyframes(phase, frames) {
    for (let i = 0; i < frames.length; i++) {
      const [p0, p1, v0, v1] = frames[i];
      if (phase >= p0 && phase <= p1) {
        return lerp(v0, v1, easeIO((phase - p0) / (p1 - p0)));
      }
    }
    return frames[frames.length - 1][3];
  }

  /* ── scene 1: highway — the ego really overtakes ──────────── */

  const highway = {
    name: "scene 01 · highway overtake · v2x",
    geom() {
      const roadH = H * 0.6;
      const yT = (H - roadH) / 2;
      return { roadH, yT, laneW: roadH / 3 };
    },
    drawRoad(t) {
      const { roadH, yT, laneW } = this.geom();
      ctx.fillStyle = C.road;
      ctx.fillRect(0, yT, W, roadH);
      ctx.strokeStyle = C.edgeLine;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, yT); ctx.lineTo(W, yT);
      ctx.moveTo(0, yT + roadH); ctx.lineTo(W, yT + roadH);
      ctx.stroke();
      ctx.strokeStyle = C.laneLine;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([18, 22]);
      ctx.lineDashOffset = -((t * 90) % 40);
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, yT + laneW * i);
        ctx.lineTo(W, yT + laneW * i);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    },
    staticSegs() {
      const { roadH, yT } = this.geom();
      return [
        [0, yT, W, yT],
        [0, yT + roadH, W, yT + roadH],
      ];
    },
    vehicles(phase) {
      const { yT, laneW } = this.geom();
      const laneY = (i) => yT + laneW * (i + 0.5);
      // ego pulls out, accelerates PAST the slow car, merges back ahead of it
      const egoLane = keyframes(phase, [
        [0.00, 0.20, 1, 1],
        [0.20, 0.30, 1, 0],
        [0.30, 0.60, 0, 0],
        [0.60, 0.72, 0, 1],
        [0.72, 1.00, 1, 1],
      ]);
      const egoX = keyframes(phase, [
        [0.00, 0.25, W * 0.28, W * 0.30],
        [0.25, 0.60, W * 0.30, W * 0.60],
        [0.60, 1.00, W * 0.60, W * 0.63],
      ]);
      return [
        { id: "ego", role: "ego", x: egoX, y: laneY(egoLane), l: 34, w: 16, vert: false, label: "EGO" },
        { id: "cav", role: "cav", x: W * 0.82 + Math.sin(phase * Math.PI * 2) * W * 0.015, y: laneY(1), l: 34, w: 16, vert: false, label: "CAV · V2X" },
        { id: "slow", role: "car", x: W * 0.50 - phase * W * 0.12, y: laneY(1), l: 34, w: 16, vert: false, label: "car" },
        { id: "truck", role: "truck", x: -W * 0.15 + ((phase * 1.35) % 1) * W * 1.3, y: laneY(2), l: 50, w: 18, vert: false, label: "truck" },
      ];
    },
    links: [["cav", "ego"]],
  };

  /* ── scene 2: urban intersection with an RSU ──────────────── */

  const intersection = {
    name: "scene 02 · urban intersection · v2x + rsu",
    geom() {
      const laneW = Math.min(H * 0.16, 52);
      const cx = W * 0.58, cy = H * 0.5, rw = laneW;
      return { laneW, cx, cy, rw, vT: cx - rw, vB: cx + rw, hT: cy - rw, hB: cy + rw };
    },
    drawRoad() {
      const { cx, cy, rw } = this.geom();
      ctx.fillStyle = C.road;
      ctx.fillRect(0, cy - rw, W, rw * 2);
      ctx.fillRect(cx - rw, 0, rw * 2, H);
      ctx.strokeStyle = C.edgeLine;
      ctx.lineWidth = 2;
      for (const [x1, y1, x2, y2] of this.staticSegs()) {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.strokeStyle = C.laneLine;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([12, 14]);
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(cx - rw, cy);
      ctx.moveTo(cx + rw, cy); ctx.lineTo(W, cy);
      ctx.moveTo(cx, 0); ctx.lineTo(cx, cy - rw);
      ctx.moveTo(cx, cy + rw); ctx.lineTo(cx, H);
      ctx.stroke();
      ctx.setLineDash([]);
      // ego stop line
      ctx.strokeStyle = "rgba(229, 231, 235, 0.5)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - rw - 8, cy);
      ctx.lineTo(cx - rw - 8, cy + rw);
      ctx.stroke();
    },
    staticSegs() {
      const { vT, vB, hT, hB } = this.geom();
      return [
        [0, hT, vT, hT], [vB, hT, W, hT],
        [0, hB, vT, hB], [vB, hB, W, hB],
        [vT, 0, vT, hT], [vT, hB, vT, H],
        [vB, 0, vB, hT], [vB, hB, vB, H],
      ];
    },
    rsu() {
      const { vT, hT } = this.geom();
      return { x: vT - 18, y: hT - 22 };
    },
    vehicles(phase) {
      const { cy, rw, vT, vB } = this.geom();
      // stop positions derive from the intersection geometry, so they
      // are correct on every screen size (no more phone collisions)
      const egoStop = vT - 30;
      const cavStop = vB + 30;
      const egoX = keyframes(phase, [
        [0.00, 0.22, W * 0.04, egoStop],
        [0.22, 0.50, egoStop, egoStop],
        [0.50, 0.78, egoStop, W * 0.88],
        [0.78, 1.00, W * 0.88, W * 1.10],
      ]);
      const cavX = keyframes(phase, [
        [0.00, 0.20, W * 1.06, cavStop],
        [0.20, 0.55, cavStop, cavStop],
        [0.55, 0.85, cavStop, W * 0.25],
        [0.85, 1.00, W * 0.25, -W * 0.10],
      ]);
      const crossY = phase >= 0.10 && phase <= 0.52
        ? lerp(-H * 0.15, H * 1.15, (phase - 0.10) / 0.42)
        : -H * 0.15;
      const { cx } = this.geom();
      return [
        { id: "ego", role: "ego", x: egoX, y: cy + rw * 0.5, l: 34, w: 16, vert: false, label: "EGO" },
        { id: "cav", role: "cav", x: cavX, y: cy - rw * 0.5, l: 34, w: 16, vert: false, label: "CAV · V2X" },
        { id: "cross", role: "car", x: cx - rw * 0.5, y: crossY, l: 34, w: 16, vert: true, label: "car" },
      ];
    },
    links: [["cav", "ego"], ["rsu", "ego"]],
  };

  /* ── scene 3: occluded pedestrian, reported by a CAV ──────── */

  const pedestrian = {
    name: "scene 03 · occluded pedestrian · cpm from cav",
    geom() {
      const rw = Math.min(H * 0.16, 52);
      const cy = H * 0.5;
      return { rw, cy, hT: cy - rw, hB: cy + rw, cwX: W * 0.60 };
    },
    drawRoad() {
      const { rw, cy, hT, hB, cwX } = this.geom();
      ctx.fillStyle = C.road;
      ctx.fillRect(0, cy - rw, W, rw * 2);
      ctx.strokeStyle = C.edgeLine;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, hT); ctx.lineTo(W, hT);
      ctx.moveTo(0, hB); ctx.lineTo(W, hB);
      ctx.stroke();
      ctx.strokeStyle = C.laneLine;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([12, 14]);
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(W, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      // zebra crossing
      ctx.fillStyle = C.crosswalk;
      for (let y = hT + 5; y < hB - 6; y += 12) {
        ctx.fillRect(cwX - 10, y, 20, 7);
      }
    },
    staticSegs() {
      const { hT, hB } = this.geom();
      return [
        [0, hT, W, hT],
        [0, hB, W, hB],
      ];
    },
    vehicles(phase) {
      const { rw, cy, hT, hB, cwX } = this.geom();
      // ego stops before the crossing — warned by the CAV, since the
      // parked van blocks its own view of the pedestrian
      const egoStop = cwX - 33;
      const egoX = keyframes(phase, [
        [0.00, 0.28, W * 0.03, egoStop],
        [0.28, 0.62, egoStop, egoStop],
        [0.62, 1.00, egoStop, W * 1.12],
      ]);
      const cavX = keyframes(phase, [
        [0.00, 0.35, W * 1.08, cwX + W * 0.16],
        [0.35, 0.72, cwX + W * 0.16, cwX + W * 0.16],
        [0.72, 1.00, cwX + W * 0.16, W * 0.30],
      ]);
      const pedY = keyframes(phase, [
        [0.00, 0.18, hB + 28, hB + 28],
        [0.18, 0.66, hB + 28, hT - 24],
        [0.66, 1.00, hT - 24, hT - 24],
      ]);
      return [
        { id: "ego", role: "ego", x: egoX, y: cy + rw * 0.5, l: 34, w: 16, vert: false, label: "EGO" },
        { id: "cav", role: "cav", x: cavX, y: cy - rw * 0.5, l: 34, w: 16, vert: false, label: "CAV · V2X" },
        { id: "van", role: "truck", x: cwX - 34, y: hB + 13, l: 44, w: 18, vert: false, label: "parked van" },
        { id: "ped", role: "ped", x: cwX, y: pedY, l: 9, w: 9, vert: true, label: "pedestrian" },
      ];
    },
    links: [["cav", "ego"]],
  };

  const scenes = [highway, intersection, pedestrian];

  /* ── geometry helpers ─────────────────────────────────────── */

  function vehicleAABB(v) {
    const hx = (v.vert ? v.w : v.l) / 2;
    const hy = (v.vert ? v.l : v.w) / 2;
    return { minX: v.x - hx, maxX: v.x + hx, minY: v.y - hy, maxY: v.y + hy };
  }

  function rayAABB(ox, oy, dx, dy, box) {
    let tmin = 0, tmax = Infinity;
    for (const [o, d, min, max] of [
      [ox, dx, box.minX, box.maxX],
      [oy, dy, box.minY, box.maxY],
    ]) {
      if (Math.abs(d) < 1e-9) {
        if (o < min || o > max) return null;
      } else {
        let t1 = (min - o) / d, t2 = (max - o) / d;
        if (t1 > t2) [t1, t2] = [t2, t1];
        tmin = Math.max(tmin, t1);
        tmax = Math.min(tmax, t2);
        if (tmin > tmax) return null;
      }
    }
    return tmin > 0.01 ? tmin : null;
  }

  function raySeg(ox, oy, dx, dy, x1, y1, x2, y2) {
    const sx = x2 - x1, sy = y2 - y1;
    const denom = dx * sy - dy * sx;
    if (Math.abs(denom) < 1e-9) return null;
    const t = ((x1 - ox) * sy - (y1 - oy) * sx) / denom;
    const u = ((x1 - ox) * dy - (y1 - oy) * dx) / denom;
    return t > 0.01 && u >= 0 && u <= 1 ? t : null;
  }

  /* ── lidar (occlusion falls out of the ray casting) ───────── */

  function castLidar(scene, vehicles, now) {
    const range = Math.max(W, H) * 0.5;
    const segs = scene.staticSegs();
    const sensors = vehicles.filter((v) => v.role === "ego" || v.role === "cav");
    for (const s of sensors) {
      if (s.x < -20 || s.x > W + 20 || s.y < -20 || s.y > H + 20) continue;
      for (let k = 0; k < RAYS_PER_FRAME; k++) {
        const a = lidarAngle + (k / RAYS_PER_FRAME) * Math.PI * 2;
        const dx = Math.cos(a), dy = Math.sin(a);
        let best = range, hitVeh = null;
        for (const v of vehicles) {
          if (v === s) continue;
          const t = rayAABB(s.x, s.y, dx, dy, vehicleAABB(v));
          if (t !== null && t < best) { best = t; hitVeh = v; }
        }
        for (const [x1, y1, x2, y2] of segs) {
          const t = raySeg(s.x, s.y, dx, dy, x1, y1, x2, y2);
          if (t !== null && t < best) { best = t; hitVeh = null; }
        }
        if (best < range) {
          points.push({
            x: s.x + dx * best + (Math.random() - 0.5) * 2,
            y: s.y + dy * best + (Math.random() - 0.5) * 2,
            life: 1,
            src: s.role,
          });
          if (hitVeh) hitTimes[hitVeh.id] = now;
        }
      }
    }
    if (points.length > MAX_POINTS) points.splice(0, points.length - MAX_POINTS);
  }

  /* ── drawing ──────────────────────────────────────────────── */

  function drawVehicle(v) {
    if (v.role === "ped") {
      ctx.fillStyle = C.ped;
      ctx.beginPath();
      ctx.arc(v.x, v.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = C.ped;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(v.x, v.y, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      return;
    }
    const box = vehicleAABB(v);
    const color = v.role === "ego" ? C.ego : v.role === "cav" ? C.cav : C.other;
    ctx.fillStyle = color;
    ctx.globalAlpha = v.role === "ego" || v.role === "cav" ? 1 : 0.9;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(box.minX, box.minY, box.maxX - box.minX, box.maxY - box.minY, 4);
    else ctx.rect(box.minX, box.minY, box.maxX - box.minX, box.maxY - box.minY);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(10, 14, 23, 0.5)";
    if (v.vert) ctx.fillRect(box.minX + 3, v.y - 6, v.w - 6, 5);
    else ctx.fillRect(v.x + v.l / 2 - 11, box.minY + 3, 6, v.w - 6);
  }

  function drawDetection(v, now) {
    if (v.role === "ego") return;
    const t = hitTimes[v.id];
    const isCav = v.role === "cav";
    if (!isCav && (t === undefined || now - t > 0.6)) return;
    const box = vehicleAABB(v);
    const pad = 6;
    ctx.strokeStyle = isCav ? C.cav : v.role === "ped" ? C.ped : C.box;
    ctx.lineWidth = 1.2;
    ctx.setLineDash(isCav ? [] : [5, 4]);
    ctx.strokeRect(box.minX - pad, box.minY - pad, box.maxX - box.minX + pad * 2, box.maxY - box.minY + pad * 2);
    ctx.setLineDash([]);
    ctx.fillStyle = C.label;
    ctx.font = "9px ui-monospace, Consolas, monospace";
    ctx.fillText(v.label, box.minX - pad, box.minY - pad - 4);
  }

  function drawEgoLabel(v) {
    const box = vehicleAABB(v);
    ctx.fillStyle = C.ego;
    ctx.font = "bold 9px ui-monospace, Consolas, monospace";
    ctx.fillText(v.label, box.minX, box.minY - 8);
  }

  function drawRSU(pos) {
    ctx.strokeStyle = C.rsu;
    ctx.fillStyle = C.rsu;
    ctx.lineWidth = 1.5;
    // mast + head
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y + 14);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.fillRect(pos.x - 4, pos.y - 8, 8, 8);
    // signal arcs
    ctx.globalAlpha = 0.6;
    for (const r of [7, 12]) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 4, r, -Math.PI * 0.15, Math.PI * 0.65);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.font = "9px ui-monospace, Consolas, monospace";
    ctx.fillStyle = C.label;
    ctx.fillText("RSU", pos.x - 26, pos.y - 2);
  }

  function drawTrajectory(scene, phase, t) {
    const pts = [];
    for (let d = 0.004; d <= 0.13; d += 0.006) {
      const fut = scene.vehicles(Math.min(phase + d, 0.999)).find((v) => v.id === "ego");
      pts.push([fut.x, fut.y]);
    }
    ctx.strokeStyle = C.traj;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.75;
    ctx.setLineDash([7, 7]);
    ctx.lineDashOffset = -((t * 40) % 14);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  /* V2X/CPM links — the pulse always travels TOWARD the receiver */
  function drawComms(scene, vehicles, t) {
    const nodeById = (id) => {
      if (id === "rsu" && scene.rsu) return scene.rsu();
      return vehicles.find((v) => v.id === id);
    };
    (scene.links || []).forEach(([fromId, toId], i) => {
      const from = nodeById(fromId), to = nodeById(toId);
      if (!from || !to) return;
      if (from.x < -20 || from.x > W + 20) return;
      ctx.strokeStyle = C.v2x;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.setLineDash([]);
      const p = (t * 0.7 + i * 0.4) % 1;   // from sender → ego
      ctx.fillStyle = C.ego;
      ctx.beginPath();
      ctx.arc(lerp(from.x, to.x, p), lerp(from.y, to.y, p), 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ── main loop ────────────────────────────────────────────── */

  function drawFrame(now, dt) {
    const scene = scenes[sceneIdx];
    const phase = (sceneTime % LOOP) / LOOP;

    let alpha = 1;
    const tIn = sceneTime, tOut = LOOP - sceneTime;
    if (tIn < FADE) alpha = tIn / FADE;
    else if (tOut < FADE) alpha = Math.max(tOut / FADE, 0);

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = alpha;

    scene.drawRoad(now);
    if (scene.rsu) drawRSU(scene.rsu());
    const vehicles = scene.vehicles(phase);

    lidarAngle += dt * 2.6;
    castLidar(scene, vehicles, now);

    for (const p of points) {
      p.life -= dt / POINT_LIFE;
      if (p.life <= 0) continue;
      ctx.fillStyle = `rgba(${p.src === "cav" ? C.ptCav : C.ptEgo}, ${(p.life * 0.85).toFixed(3)})`;
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
    points = points.filter((p) => p.life > 0);

    drawTrajectory(scene, phase, now);
    drawComms(scene, vehicles, now);
    for (const v of vehicles) drawVehicle(v);
    for (const v of vehicles) drawDetection(v, now);
    drawEgoLabel(vehicles.find((v) => v.id === "ego"));

    ctx.globalAlpha = 1;
  }

  function tick(nowMs) {
    if (!running) return;
    const now = nowMs / 1000;
    const dt = lastNow === null ? 0.016 : Math.min(now - lastNow, 0.05);
    lastNow = now;
    sceneTime += dt;
    if (sceneTime >= LOOP) {
      sceneTime = 0;
      sceneIdx = (sceneIdx + 1) % scenes.length;
      points = [];
      hitTimes = {};
      if (labelEl) labelEl.textContent = scenes[sceneIdx].name;
    }
    drawFrame(now, dt);
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    lastNow = null;
    rafId = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    points = [];
  }

  resize();
  window.addEventListener("resize", resize);
  if (labelEl) labelEl.textContent = scenes[0].name;

  if (reduceMotion) {
    sceneTime = LOOP * 0.35;
    for (let i = 0; i < 80; i++) {
      lidarAngle += 0.05;
      castLidar(scenes[0], scenes[0].vehicles(0.35), 0);
    }
    points.forEach((p) => (p.life = 0.7));
    drawFrame(0, 0);
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting && !document.hidden ? start() : stop())),
      { threshold: 0.05 }
    );
    io.observe(canvas);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (canvas.getBoundingClientRect().top < window.innerHeight) start();
    });
  }
})();
