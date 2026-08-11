/* ═══════════════════════════════════════════════════════════════
   Site interactions: typing effect, scroll reveals, counters,
   nav behavior, theme toggle, 3D card tilt, content rendering.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ── Theme toggle (persisted) ─────────────────────────────── */
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  $("#themeToggle").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ── Render content from SITE_DATA ────────────────────────── */

  // Tech stack
  const stackEl = $("#stackGroups");
  SITE_DATA.stack.forEach((g) => {
    const row = document.createElement("div");
    row.className = "stack__group reveal";
    row.innerHTML =
      `<span class="stack__group-name">${g.group}</span>` +
      `<div class="stack__chips">` +
      g.items.map((i) => `<span class="chip">${i}</span>`).join("") +
      `</div>`;
    stackEl.appendChild(row);
  });

  // Projects
  const projIconSvg =
    '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
  const ghIconSvg =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.35.77 1.05.77 2.12v3.15c0 .3.21.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>';
  const extIconSvg =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/></svg>';

  const projGrid = $("#projectsGrid");
  SITE_DATA.projects.forEach((p) => {
    const el = document.createElement("article");
    el.className = "project card-tilt reveal" + (p.featured ? " project--featured" : "");
    const repoLink = p.repo
      ? `<a href="${p.repo}" target="_blank" rel="noopener" aria-label="Source code">${ghIconSvg}</a>`
      : `<span class="disabled" title="Private / coming soon">${ghIconSvg}</span>`;
    const demoLink = p.demo
      ? `<a href="${p.demo}" target="_blank" rel="noopener" aria-label="Live demo">${extIconSvg}</a>`
      : "";
    const titleHtml = p.repo
      ? `<a href="${p.repo}" target="_blank" rel="noopener">${p.title}</a>`
      : p.title;
    el.innerHTML =
      `<div class="project__top"><span class="project__icon">${projIconSvg}</span>` +
      `<span class="project__links">${repoLink}${demoLink}</span></div>` +
      (p.badge ? `<span class="project__badge">${p.badge}</span>` : "") +
      `<h3>${titleHtml}</h3><p>${p.description}</p>` +
      (p.media
        ? `<div class="project__media${p.mediaScene ? " project__media--duo" : ""}">` +
          (p.mediaScene
            ? `<figure class="media-panel"><canvas id="coopCanvas" aria-label="Animated cooperative driving scene: vehicles scanned by ego and V2X partner LiDAR, with detections and planned trajectory"></canvas>` +
              `<figcaption class="media-cap mono" id="sceneLabel">scene 01 · highway overtake · v2x</figcaption></figure>`
            : "") +
          `<figure class="media-panel"><img src="${p.media}" alt="${p.mediaAlt || ""}" loading="lazy">` +
          (p.mediaScene
            ? `<figcaption class="media-cap mono">ego perception → fusion → causal &amp; feasibility check</figcaption>`
            : "") +
          `</figure></div>`
        : "") +
      `<ul class="project__tags">${p.tags.map((t) => `<li>${t}</li>`).join("")}</ul>`;
    projGrid.appendChild(el);
  });

  // Timeline
  const tlEl = $("#timelineList");
  SITE_DATA.timeline.forEach((item) => {
    const el = document.createElement("div");
    el.className = "tl-item reveal";
    el.innerHTML =
      `<span class="tl-item__date">${item.date}</span>` +
      `<h3>${item.title}</h3>` +
      `<div class="tl-item__where">${item.where}</div>` +
      `<p>${item.text}</p>`;
    tlEl.appendChild(el);
  });

  // Publications
  const pubsEl = $("#pubsList");
  SITE_DATA.publications.forEach((pub) => {
    const el = document.createElement("article");
    el.className = "pub reveal";
    const link = pub.url
      ? `<a href="${pub.url}" target="_blank" rel="noopener">[paper]</a>`
      : `<span class="disabled">[coming soon]</span>`;
    el.innerHTML =
      `<span class="pub__year">${pub.year}</span>` +
      `<div><h3>${pub.title}</h3>` +
      `<p class="pub__authors">${pub.authors}</p>` +
      `<p class="pub__venue">${pub.venue}</p>` +
      `<div class="pub__links">${link}</div>` +
      `</div>`;
    pubsEl.appendChild(el);
  });

  /* ── Typing effect ────────────────────────────────────────── */
  const typedEl = $("#typed");
  const roles = SITE_DATA.roles;
  if (reduceMotion) {
    typedEl.textContent = roles[0];
  } else {
    let roleIdx = 0, charIdx = 0, deleting = false;
    (function type() {
      const word = roles[roleIdx];
      typedEl.textContent = word.slice(0, charIdx);
      let delay;
      if (!deleting) {
        charIdx++;
        delay = 70 + Math.random() * 60;
        if (charIdx > word.length) { deleting = true; delay = 1800; }
      } else {
        charIdx--;
        delay = 35;
        if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; delay = 350; }
      }
      setTimeout(type, delay);
    })();
  }

  /* ── Scroll reveals (with sibling stagger) ────────────────── */
  const revealEls = $$(".reveal");
  revealEls.forEach((el) => {
    // stagger siblings that share a parent grid/list
    const siblings = Array.from(el.parentElement.children).filter((c) =>
      c.classList.contains("reveal")
    );
    if (siblings.length > 1) {
      el.style.setProperty("--stagger", `${siblings.indexOf(el) * 0.09}s`);
    }
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
          // drop the stagger delay once revealed so hover effects stay snappy
          setTimeout(() => e.target.style.removeProperty("--stagger"), 1200);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ── Animated counters ────────────────────────────────────── */
  const counters = $$(".stat__value");
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        const el = e.target;
        if (el.dataset.infinity === "true" || reduceMotion) {
          if (el.dataset.infinity !== "true")
            el.textContent = el.dataset.count + (el.dataset.suffix || "");
          return;
        }
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || "";
        const dur = 1400;
        const t0 = performance.now();
        (function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => cio.observe(el));

  /* ── Nav: shadow, hide-on-scroll-down, scrollspy ──────────── */
  const nav = $("#nav");
  let lastY = window.scrollY;
  const sections = $$("main section[id]");
  const navLinks = $$(".nav__link");

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      nav.classList.toggle("nav--scrolled", y > 20);
      nav.classList.toggle("nav--hidden", y > lastY && y > 300);
      lastY = y;

      // scrollspy
      let current = "";
      for (const s of sections) {
        if (y >= s.offsetTop - 140) current = s.id;
      }
      navLinks.forEach((l) =>
        l.classList.toggle("active", l.getAttribute("href") === `#${current}`)
      );
    },
    { passive: true }
  );

  /* ── Mobile burger menu ───────────────────────────────────── */
  const burger = $("#navBurger");
  const links = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  navLinks.forEach((l) =>
    l.addEventListener("click", () => {
      links.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ── 3D tilt on cards ─────────────────────────────────────── */
  if (!reduceMotion && matchMedia("(hover: hover)").matches) {
    $$(".card-tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        card.style.transform = `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-8px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ── Footer year ──────────────────────────────────────────── */
  $("#year").textContent = new Date().getFullYear();
})();
