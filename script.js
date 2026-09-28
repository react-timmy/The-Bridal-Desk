/* ── Navigation ─────────────────────────────────────────────── */
const body      = document.body;
const header    = document.querySelector("[data-header]");
const nav       = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

navToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-label", "Open navigation");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

/* Close nav when tapping outside on mobile */
document.addEventListener("pointerdown", e => {
  if (!nav?.classList.contains("open")) return;
  if (!nav.contains(e.target) && !navToggle?.contains(e.target)) {
    nav.classList.remove("open");
    body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-label", "Open navigation");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

window.addEventListener("scroll", () => {
  header?.classList.toggle("scrolled", window.scrollY > 12);
}, { passive: true });

/* ── Form tabs ──────────────────────────────────────────────── */
const tabButtons = document.querySelectorAll("[data-tab]");
const forms      = document.querySelectorAll("[data-form]");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const selected = btn.dataset.tab;
    tabButtons.forEach(b => {
      const active = b === btn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
    });
    forms.forEach(f => f.classList.toggle("active", f.dataset.form === selected));
  });
});

forms.forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();
    const note = form.querySelector("[data-note]");
    if (note) {
      note.textContent = form.dataset.form === "bride"
        ? "Thank you. Your consultation request is ready to be reviewed by The Bridal Desk."
        : "Thank you. Your partnership inquiry is ready to be reviewed by The Bridal Desk.";
    }
    form.reset();
  });
});

/* ── Scroll-triggered reveal ────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("animate-in");
  });
}, { threshold: 0.12, rootMargin: "0px 0px -80px 0px" });

document.querySelectorAll("[data-animate]").forEach(el => revealObserver.observe(el));

/* ── Mobile sticky CTA bar ──────────────────────────────────── */
(() => {
  const bar    = document.getElementById("mobile-cta-bar");
  const hero   = document.querySelector(".hero");
  const inquiry = document.getElementById("inquiry");
  if (!bar || !hero || !inquiry) return;

  function updateBar() {
    // Only active below 640px
    if (window.innerWidth > 640) { bar.classList.remove("visible", "at-form"); return; }

    const heroBottom    = hero.getBoundingClientRect().bottom;
    const formTop       = inquiry.getBoundingClientRect().top;
    const pastHero      = heroBottom < 0;
    const atForm        = formTop < window.innerHeight * 0.8;

    bar.classList.toggle("visible",  pastHero && !atForm);
    bar.classList.toggle("at-form",  atForm);
  }

  window.addEventListener("scroll",  updateBar, { passive: true });
  window.addEventListener("resize",  updateBar, { passive: true });
  updateBar();
})();


(() => {
  const TOTAL  = 300;
  const DIR    = "jpg frames/";
  const pad    = n => String(n).padStart(3, "0");

  const canvas = document.getElementById("frame-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const frames = new Array(TOTAL);
  let ready    = false;
  let current  = 0;      // floating frame index (lerped)
  let target   = 0;      // integer frame index from scroll

  /* Size canvas to exact device pixels for sharpness */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    draw(Math.round(current));
  }

  function draw(idx) {
    const img = frames[idx];
    if (!img?.complete || !img.naturalWidth) return;

    const { width: cw, height: ch } = canvas;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const sw = img.naturalWidth  * scale;
    const sh = img.naturalHeight * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
  }

  /* Smooth lerp loop */
  function loop() {
    requestAnimationFrame(loop);
    if (!ready) return;
    const diff = target - current;
    if (Math.abs(diff) < 0.4) {
      if (current !== target) { current = target; draw(Math.round(current)); }
      return;
    }
    current += diff * 0.14;
    draw(Math.round(current));
  }

  /* Map total scroll progress → frame index */
  function onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    target = Math.min(TOTAL - 1, Math.floor(progress * TOTAL));
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize);

  /* Pre-load all frames; start loop after frame 1 arrives */
  for (let i = 1; i <= TOTAL; i++) {
    const img = new Image();
    img.src = `${DIR}ezgif-frame-${pad(i)}.jpg`;
    img.onload = () => {
      if (i === 1) { resize(); ready = true; loop(); }
    };
    img.onerror = () => { /* frame failed to load silently */ };
    frames[i - 1] = img;
  }
})();
