/* ============================================
   Full Circle Resolutions — shared scripts
   ============================================ */

// ----- Tweaks state (persisted cross-page via localStorage) -----
const TWEAK_STATE_KEY = "fcs.tweaks.v1";
const DEFAULT_TWEAKS = {
  palette: "warm",          // warm | cool | forest
  type: "serif",            // serif | sans | script
  theme: "light",           // light | dark
  sectionStyle: "default",  // default | cards | ribbons | boxed
  heroLayout: "split"       // split | centered | overlay
};

function loadTweaks() {
  try {
    const raw = localStorage.getItem(TWEAK_STATE_KEY);
    return { ...DEFAULT_TWEAKS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { ...DEFAULT_TWEAKS };
  }
}
function saveTweaks(t) {
  try { localStorage.setItem(TWEAK_STATE_KEY, JSON.stringify(t)); } catch {}
}
function applyTweaks(t) {
  const root = document.documentElement;
  root.setAttribute("data-palette", t.palette);
  root.setAttribute("data-type", t.type);
  root.setAttribute("data-theme", t.theme);
  root.setAttribute("data-section-style", t.sectionStyle);
  root.setAttribute("data-hero-layout", t.heroLayout);
}

// Apply on load (cross-page)
const __tweaks = loadTweaks();
applyTweaks(__tweaks);
window.__fcs_tweaks = __tweaks;
window.__fcs_setTweaks = function(partial) {
  const merged = { ...window.__fcs_tweaks, ...partial };
  window.__fcs_tweaks = merged;
  saveTweaks(merged);
  applyTweaks(merged);
};

// ----- Sticky nav scroll state -----
function initNav() {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const onScroll = () => {
    if (window.scrollY > 8) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }
}

// ----- Scroll-triggered fade-ins -----
function initFadeIns() {
  const els = document.querySelectorAll(".fade-in");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("visible"));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
  );
  els.forEach((el) => obs.observe(el));
}

// ----- ADR sub-tab switcher -----
function initTabs() {
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const tabs = root.querySelectorAll("[data-tab]");
    const panels = root.querySelectorAll("[data-panel]");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-tab");
        tabs.forEach((t) => t.classList.toggle("active", t === tab));
        panels.forEach((p) => p.classList.toggle("active", p.getAttribute("data-panel") === target));
        // Re-trigger fade-ins inside the now-visible panel
        const active = root.querySelector(`[data-panel="${target}"]`);
        if (active) {
          active.querySelectorAll(".fade-in").forEach((el) => {
            el.classList.remove("visible");
            requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("visible")));
          });
        }
      });
    });
  });

  // Anchor links that target a tab panel (e.g. #retreats, #circles) should
  // activate that tab in addition to scrolling.
  document.querySelectorAll('.adr-anchor-link[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href").slice(1);
      const tabBtn = document.querySelector(`[data-tab="${id}"]`);
      if (!tabBtn) return; // not a tab id — let the browser scroll normally
      e.preventDefault();
      tabBtn.click();
      const panel = document.getElementById(id);
      if (panel) {
        const tabStrip = document.querySelector(".tab-strip");
        const target = tabStrip || panel;
        const navOffset = 120; // sticky nav + anchor bar
        const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
}

// ----- Activate tab from URL hash on page load -----
function initHashTab() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;
  const tabBtn = document.querySelector(`[data-tab="${hash}"]`);
  if (!tabBtn) return;
  tabBtn.click();
  const tabsSection = document.getElementById("practice");
  const target = tabsSection || document.getElementById(hash);
  if (target) {
    const navOffset = 120;
    setTimeout(() => {
      const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top, behavior: "smooth" });
    }, 50);
  }
}

// ----- Init on DOM ready -----
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initFadeIns();
    initTabs();
    initHashTab();
  });
} else {
  initNav();
  initFadeIns();
  initTabs();
  initHashTab();
}
