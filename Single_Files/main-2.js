/* =============================================
   VOX — AI Voice Agent Platform
   main.js — Interactivity & Canvas Background
   ============================================= */

"use strict";

// ─── Background Canvas: animated mesh gradient ────────────────────────────────

(function initCanvas() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let w, h, nodes;
  let animFrame;

  const NUM_NODES = 6;
  const COLORS = [
    { r: 200, g: 255, b: 87  },   // accent green
    { r: 30,  g: 100, b: 60  },   // deep green
    { r: 15,  g: 15,  b: 60  },   // dark indigo
    { r: 80,  g: 200, b: 140 },   // teal
    { r: 10,  g: 10,  b: 25  },   // near black
    { r: 50,  g: 150, b: 80  },   // mid green
  ];

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
    createNodes();
  }

  function createNodes() {
    nodes = Array.from({ length: NUM_NODES }, (_, i) => ({
      x:    Math.random() * w,
      y:    Math.random() * h,
      vx:   (Math.random() - 0.5) * 0.5,
      vy:   (Math.random() - 0.5) * 0.5,
      r:    Math.max(w, h) * (0.35 + Math.random() * 0.35),
      color: COLORS[i % COLORS.length],
      alpha: 0.12 + Math.random() * 0.12,
    }));
  }

  function drawFrame() {
    ctx.clearRect(0, 0, w, h);

    for (const node of nodes) {
      // drift
      node.x += node.vx;
      node.y += node.vy;

      // bounce at edges
      if (node.x < -node.r)   node.x = w + node.r;
      if (node.x > w + node.r) node.x = -node.r;
      if (node.y < -node.r)   node.y = h + node.r;
      if (node.y > h + node.r) node.y = -node.r;

      const { r: nr, g, b } = node.color;
      const gradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, node.r
      );
      gradient.addColorStop(0, `rgba(${nr},${g},${b},${node.alpha})`);
      gradient.addColorStop(1, `rgba(${nr},${g},${b},0)`);

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    animFrame = requestAnimationFrame(drawFrame);
  }

  window.addEventListener("resize", resize);
  resize();
  drawFrame();
})();


// ─── Navigation scroll class ──────────────────────────────────────────────────

(function initNav() {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  const observer = new IntersectionObserver(
    ([entry]) => nav.classList.toggle("scrolled", !entry.isIntersecting),
    { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
  );

  const sentinel = document.createElement("div");
  sentinel.style.cssText = "position:absolute;top:0;left:0;height:1px;width:100%;pointer-events:none;";
  document.body.prepend(sentinel);
  observer.observe(sentinel);
})();


// ─── Waveform: animate bars when a textarea is focused ───────────────────────

(function initWaveform() {
  const waveform = document.getElementById("waveform");
  const textareas = document.querySelectorAll(".field-textarea");
  if (!waveform || !textareas.length) return;

  function setWaveformActive(active) {
    waveform.style.opacity   = active ? "0.65" : "0.25";
    waveform.style.transition = "opacity 0.5s ease";
  }

  textareas.forEach(ta => {
    ta.addEventListener("focus", () => setWaveformActive(true));
    ta.addEventListener("blur",  () => {
      // deactivate only if no other textarea is focused
      const anyFocused = [...textareas].some(t => t === document.activeElement);
      if (!anyFocused) setWaveformActive(false);
    });
    ta.addEventListener("input", () => {
      // randomize bar heights slightly on input to simulate voice
      const bars = waveform.querySelectorAll("span");
      bars.forEach(bar => {
        const h = 4 + Math.round(Math.random() * 20);
        bar.style.height = `${h}px`;
      });
    });
  });
})();


// ─── Auto-resize textareas ────────────────────────────────────────────────────

(function initAutoResize() {
  const textareas = document.querySelectorAll(".field-textarea");
  textareas.forEach(ta => {
    ta.addEventListener("input", () => {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    });
  });
})();


// ─── Form submission ──────────────────────────────────────────────────────────

(function initForm() {
  const form = document.getElementById("agentForm");
  const btn  = document.getElementById("submitBtn");
  const card = document.querySelector(".hero-card");
  if (!form || !btn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const task        = document.getElementById("task").value.trim();
    const company     = document.getElementById("company").value.trim();
    const personality = document.getElementById("personality").value.trim();

    if (!task) {
      shakeField(document.getElementById("task").closest(".form-field"));
      return;
    }

    // Loading state
    btn.classList.add("loading");
    btn.disabled = true;
    btn.querySelector(".btn-text").textContent = "Wird erstellt";

    // Simulate async processing
    await delay(1800);

    // Success state
    btn.classList.remove("loading");
    btn.querySelector(".btn-text").textContent = "Agent bereit ✓";
    btn.style.background = "#2ed573";
    card.classList.add("success");

    // Log payload (in a real app: send to API)
    console.log("Agent Config:", { task, company, personality });

    // Reset after 3s
    await delay(3000);
    btn.querySelector(".btn-text").textContent = "Agent erstellen";
    btn.style.background = "";
    btn.disabled = false;
    card.classList.remove("success");
  });

  function shakeField(el) {
    if (!el) return;
    el.style.animation = "none";
    el.offsetHeight; // reflow
    el.style.animation = "shake 0.4s ease";

    // Inject shake keyframes if not present
    if (!document.getElementById("shake-kf")) {
      const style = document.createElement("style");
      style.id = "shake-kf";
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
})();


// ─── Cursor glow effect ───────────────────────────────────────────────────────

(function initCursorGlow() {
  const glow = document.createElement("div");
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,255,87,0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 5;
    transform: translate(-50%, -50%);
    transition: opacity 0.4s;
    opacity: 0;
  `;
  document.body.appendChild(glow);

  let visible = false;

  document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top  = e.clientY + "px";

    if (!visible) {
      glow.style.opacity = "1";
      visible = true;
    }
  });

  document.addEventListener("mouseleave", () => {
    glow.style.opacity = "0";
    visible = false;
  });
})();


// ─── Character counter (optional subtle feedback) ─────────────────────────────

(function initCharCount() {
  const task = document.getElementById("task");
  if (!task) return;

  const counter = document.createElement("span");
  counter.style.cssText = `
    position: absolute;
    bottom: 10px;
    right: 12px;
    font-size: 10px;
    color: rgba(244,244,240,0.2);
    font-family: var(--font-body, monospace);
    pointer-events: none;
    transition: color 0.2s;
  `;

  const wrapper = task.parentElement;
  wrapper.style.position = "relative";
  wrapper.appendChild(counter);

  task.addEventListener("input", () => {
    const len = task.value.length;
    counter.textContent = `${len}`;
    counter.style.color = len > 200 ? "rgba(255,100,100,0.5)" : "rgba(244,244,240,0.2)";
  });
})();
