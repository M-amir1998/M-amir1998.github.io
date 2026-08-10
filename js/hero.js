/* ═══════════════════════════════════════════════════════════════
   Hero canvas — a cooperative-perception scene:
   vehicles (nodes) driving in lanes, V2X links pulsing between
   them, an ego vehicle with a LiDAR sweep, background point cloud.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, dpr = 1;
  let vehicles = [];
  let points = [];
  let sweepAngle = 0;
  let mouseX = 0.5, mouseY = 0.5;
  let running = true;
  let rafId = null;

  const LINK_RANGE = 190;

  function themeColors() {
    const light = document.documentElement.getAttribute("data-theme") === "light";
    return light
      ? {
          point: "rgba(71, 85, 105, 0.35)",
          vehicle: "rgba(8, 145, 178, 0.9)",
          vehicleGlow: "rgba(8, 145, 178, 0.25)",
          link: "34, 211, 238",
          pulse: "rgba(99, 102, 241, 0.9)",
          sweep: "rgba(34, 211, 238, 0.10)",
          ring: "rgba(34, 211, 238, 0.35)",
        }
      : {
          point: "rgba(148, 163, 184, 0.28)",
          vehicle: "rgba(34, 211, 238, 0.95)",
          vehicleGlow: "rgba(34, 211, 238, 0.30)",
          link: "34, 211, 238",
          pulse: "rgba(165, 180, 252, 1)",
          sweep: "rgba(34, 211, 238, 0.07)",
          ring: "rgba(34, 211, 238, 0.30)",
        };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const laneCount = H > 600 ? 5 : 3;
    const vehicleCount = Math.min(30, Math.max(12, Math.floor(W / 55)));
    vehicles = [];
    for (let i = 0; i < vehicleCount; i++) {
      const lane = i % laneCount;
      vehicles.push({
        x: Math.random() * W,
        baseY: (H * (lane + 1)) / (laneCount + 1) + (Math.random() - 0.5) * 40,
        speed: (0.25 + Math.random() * 0.6) * (lane % 2 === 0 ? 1 : -1),
        r: 2.2 + Math.random() * 1.8,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.004 + Math.random() * 0.008,
      });
    }
    const pointCount = Math.min(160, Math.floor((W * H) / 9000));
    points = [];
    for (let i = 0; i < pointCount; i++) {
      points.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.5 + Math.random() * 1.2,
        drift: 0.05 + Math.random() * 0.15,
        tw: Math.random() * Math.PI * 2,
      });
    }
  }

  // The "ego vehicle" sits slightly right of the hero text
  function egoPos() {
    return { x: W * 0.72, y: H * 0.52 };
  }

  function frame(t) {
    if (!running) return;
    const c = themeColors();
    ctx.clearRect(0, 0, W, H);

    const px = (mouseX - 0.5) * 18;
    const py = (mouseY - 0.5) * 12;

    // ── background point cloud (subtle parallax, twinkle) ──
    for (const p of points) {
      p.y -= p.drift * 0.25;
      if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
      const alpha = 0.5 + 0.5 * Math.sin(t * 0.001 + p.tw);
      ctx.globalAlpha = 0.35 + alpha * 0.4;
      ctx.fillStyle = c.point;
      ctx.beginPath();
      ctx.arc(p.x + px * 0.4, p.y + py * 0.4, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const ego = egoPos();
    const exOff = ego.x + px, eyOff = ego.y + py;

    // ── LiDAR sweep from the ego vehicle ──
    sweepAngle += 0.012;
    const sweepR = Math.min(W, H) * 0.42;
    const grad = ctx.createConicGradient
      ? ctx.createConicGradient(sweepAngle, exOff, eyOff)
      : null;
    if (grad) {
      grad.addColorStop(0, c.sweep.replace(/[\d.]+\)$/, "0.35)"));
      grad.addColorStop(0.12, c.sweep);
      grad.addColorStop(0.25, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(exOff, eyOff);
      ctx.arc(exOff, eyOff, sweepR, 0, Math.PI * 2);
      ctx.fill();
    }

    // expanding detection rings
    for (let i = 0; i < 3; i++) {
      const phase = ((t * 0.00025) + i / 3) % 1;
      const r = phase * sweepR;
      ctx.globalAlpha = (1 - phase) * 0.35;
      ctx.strokeStyle = c.ring;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(exOff, eyOff, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ── move vehicles ──
    for (const v of vehicles) {
      v.x += v.speed;
      v.wobblePhase += v.wobbleSpeed;
      v.y = v.baseY + Math.sin(v.wobblePhase) * 8;
      if (v.speed > 0 && v.x > W + 30) v.x = -30;
      if (v.speed < 0 && v.x < -30) v.x = W + 30;
    }

    // ── V2X links between nearby vehicles (and to ego) ──
    const nodes = vehicles
      .map((v) => ({ x: v.x + px * 0.8, y: v.y + py * 0.8, r: v.r }))
      .concat([{ x: exOff, y: eyOff, r: 4 }]);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_RANGE) {
          const a = (1 - d / LINK_RANGE) * 0.5;
          ctx.strokeStyle = `rgba(${c.link}, ${a.toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();

          // data pulse travelling along the link
          const pt = ((t * 0.0004) + (i * 7 + j * 13) * 0.1) % 1;
          const pxp = nodes[i].x + (nodes[j].x - nodes[i].x) * pt;
          const pyp = nodes[i].y + (nodes[j].y - nodes[i].y) * pt;
          ctx.globalAlpha = a * 1.6;
          ctx.fillStyle = c.pulse;
          ctx.beginPath();
          ctx.arc(pxp, pyp, 1.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    }

    // ── draw vehicles ──
    for (const n of nodes) {
      ctx.fillStyle = c.vehicleGlow;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.vehicle;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (rafId) cancelAnimationFrame(rafId);
    running = true;
    rafId = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    // draw a single static frame — no animation
    running = true;
    frame(0);
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  } else {
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      } else {
        start();
      }
    });
    start();
  }
})();
