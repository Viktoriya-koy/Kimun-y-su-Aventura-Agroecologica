"use strict";
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false });
const W = canvas.width,
  H = canvas.height;
let canvasScale = 1;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const displayW = Math.round(rect.width * dpr);
  const displayH = Math.round(rect.height * dpr);

  if (canvas.width !== displayW || canvas.height !== displayH) {
    canvas.width = displayW;
    canvas.height = displayH;
  }

  canvasScale = canvas.width / 1000;
}
const EMOJI_FONT =
  '"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji",sans-serif';

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

let isMuted = false,
  isLightTheme = true,
  fontLevel = 0;

function toggleTheme() {
  isLightTheme = !isLightTheme;
  const btn = document.getElementById("btn-theme");
  if (isLightTheme) {
    document.body.classList.add("light-theme");
    btn.innerHTML = "<span>☀️</span> Tema Claro";
  } else {
    document.body.classList.remove("light-theme");
    btn.innerHTML = "<span>🌙</span> Tema Oscuro";
  }
  if (document.getElementById("shop-modal").style.display === "flex")
    renderShop();
}
function toggleSound() {
  initAudio();
  isMuted = !isMuted;
  const btn = document.getElementById("btn-sound");
  btn.innerHTML = isMuted
    ? "<span>🔇</span> Sonido OFF"
    : "<span>🔊</span> Sonido ON";
  if (!isMuted) playSound("pop");
}
function changeFontSize(dir) {
  if (dir === 1 && fontLevel < 2) fontLevel++;
  if (dir === -1 && fontLevel > -1) fontLevel--;
  document.body.classList.remove("large-text", "xlarge-text");
  if (fontLevel === 1) document.body.classList.add("large-text");
  if (fontLevel === 2) document.body.classList.add("xlarge-text");
}
function toggleGrayscale() {
  document.body.classList.toggle("grayscale");
  document.getElementById("btn-grayscale").classList.toggle("active");
}
function toggleHighlight() {
  document.body.classList.toggle("highlight-zones");
  document.getElementById("btn-highlight").classList.toggle("active");
}
function toggleCursor() {
  document.body.classList.toggle("big-cursor");
  document.getElementById("btn-cursor").classList.toggle("active");
}
function resetAccessibility() {
  fontLevel = 0;
  document.body.classList.remove(
    "large-text",
    "xlarge-text",
    "grayscale",
    "highlight-zones",
    "big-cursor",
  );
  document
    .querySelectorAll(".acc-btn")
    .forEach((b) => b.classList.remove("active"));
  if (isLightTheme) toggleTheme();
}
function switchAboutTab(index) {
  document
    .querySelectorAll("#about-modal .tab-btn")
    .forEach((btn, i) => btn.classList.toggle("active", i === index));
  document
    .querySelectorAll("#about-modal .tab-content")
    .forEach((c, i) => c.classList.toggle("active", i === index));
}
function switchStartTab(index) {
  document
    .querySelectorAll(".start-tab")
    .forEach((t, i) => t.classList.toggle("active", i === index));
  document
    .querySelectorAll(".start-content")
    .forEach((c, i) => c.classList.toggle("active", i === index));
}

let audioCtx = null;
function initAudio() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}
function playSound(type) {
  if (!audioCtx || isMuted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  if (type === "pop") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === "feed") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === "water") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === "success") {
    osc.type = "square";
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(783.99, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === "error") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === "buzz") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.1);
    osc.frequency.linearRampToValueAtTime(120, now + 0.2);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === "coin") {
    osc.type = "square";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1320, now + 0.08);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === "chop") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

function getTextColor() {
  return isLightTheme ? "#1e1e2e" : "#ffffff";
}
function getPanelBg() {
  return isLightTheme ? "#ffffff" : "#2b2b3d";
}
function getPanelStroke() {
  return isLightTheme ? "#d1d1e0" : "#7ec850";
}
function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function texto(t, x, y, size, color, align = "left", weight = "800") {
  let safeWeight = weight === "900" || weight === "800" ? "700" : weight;
  ctx.font = `${safeWeight} ${size}px "Outfit", "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(t, Math.round(x), Math.round(y));
}
function emoji(ch, x, y, size) {
  ctx.save();
  ctx.fillStyle = "#000";
  ctx.font = `${size}px "Outfit", "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ch, Math.round(x), Math.round(y));
  ctx.restore();
}
function barra(x, y, w, h, val, color) {
  const v = Math.max(0, Math.min(1, val));
  ctx.fillStyle = "rgba(0,0,0,.15)";
  rrect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = color;
  rrect(x, y, Math.max(h, w * v), h, h / 2);
  ctx.fill();
}

const CROPS = [
  { emoji: "🍓", name: "Frutilla", time: 0.35, yield: 1, type: "fruit" },
  { emoji: "🍌", name: "Banana", time: 1.3, yield: 4, type: "fruit" },
  { emoji: "🍊", name: "Naranja", time: 1.6, yield: 4, type: "fruit" },
  { emoji: "🍎", name: "Manzana", time: 2.0, yield: 5, type: "fruit" },
  { emoji: "🥕", name: "Zanahoria", time: 0.65, yield: 2, type: "veggie" },
  { emoji: "🫑", name: "Pimiento", time: 0.6, yield: 2, type: "veggie" },
  { emoji: "🧅", name: "Cebolla", time: 0.7, yield: 2, type: "veggie" },
  { emoji: "🎃", name: "Calabaza", time: 0.9, yield: 3, type: "veggie" },
  { emoji: "🌽", name: "Maíz", time: 1.0, yield: 3, type: "cereal" },
  { emoji: "🌾", name: "Trigo", time: 0.8, yield: 3, type: "cereal" },
  { emoji: "🌿", name: "Hierbas", time: 0.4, yield: 2, type: "forraje" },
];
const SEED_PRICES = {
  Frutilla: 10,
  Zanahoria: 15,
  Pimiento: 15,
  Cebolla: 14,
  Calabaza: 18,
  Maíz: 22,
  Trigo: 20,
  Hierbas: 12,
  Banana: 30,
  Naranja: 38,
  Manzana: 50,
};

const ACHIEVEMENTS = {
  first_hilo: { icon: "🧵", name: "Primer hilo" },
  first_tejido: { icon: "🧣", name: "Primer tejido" },
  first_mermelada: { icon: "🍯", name: "Primera mermelada" },
  first_conserva: { icon: "🥫", name: "Primera conserva" },
  first_harina: { icon: "🥖", name: "Primera harina" },
  first_manualidad: { icon: "🎨", name: "Primera manualidad" },
  first_sale: { icon: "💰", name: "Primera venta" },
  five_sales: { icon: "🛒", name: "5 ventas" },
  ten_sales: { icon: "🏪", name: "10 ventas" },
  twenty_sales: { icon: "🏢", name: "20 ventas" },
  fifty_sales: { icon: "👑", name: "50 ventas" },
  hundred_coins: { icon: "💎", name: "100 monedas" },
};

const state = {
  frutas: 0,
  verduras: 0,
  cereales: 0,
  harina: 0,
  compost: 3,
  humus: 0,
  lana: 0,
  monedas: 0,
  puntos: 0,
  materialReciclado: 0,
  productosVendidos: 0,
  wormFood: 0,
  wormsReady: false,
  seeds: {
    Frutilla: 3,
    Zanahoria: 3,
    Maíz: 2,
    Banana: 1,
    Naranja: 1,
    Manzana: 0,
    Pimiento: 2,
    Cebolla: 2,
    Calabaza: 1,
    Trigo: 2,
    Hierbas: 2,
  },
  animals: [
    {
      type: "caballo",
      emoji: "🐴",
      nombre: "Caballo",
      food: 60,
      water: 60,
      clean: 60,
      hasPoop: false,
      poopTimer: 0,
      wool: false,
      woolTimer: 0,
      shake: 0,
      bobOffset: 0,
    },
    {
      type: "llama",
      emoji: "🦙",
      nombre: "Llama",
      food: 60,
      water: 60,
      clean: 60,
      hasPoop: false,
      poopTimer: 0,
      wool: true,
      woolTimer: 0,
      shake: 0,
      bobOffset: 1,
    },
    {
      type: "oveja",
      emoji: "🐑",
      nombre: "Oveja",
      food: 60,
      water: 60,
      clean: 60,
      hasPoop: false,
      poopTimer: 0,
      wool: true,
      woolTimer: 0,
      shake: 0,
      bobOffset: 2,
    },
    {
      type: "conejo",
      emoji: "🐰",
      nombre: "Conejo",
      food: 60,
      water: 60,
      clean: 60,
      hasPoop: false,
      poopTimer: 0,
      wool: false,
      woolTimer: 0,
      shake: 0,
      bobOffset: 3,
    },
  ],
  plots: Array.from({ length: 12 }, () => ({
    estado: "vacio",
    agua: 1,
    growth: 0,
    crop: null,
  })),
  binShake: [0, 0, 0, 0, 0],
  trash: null,
  trashTimer: 0,
  particles: [],
  time: 0,
  selectingSeedFor: null,
  flowers: [
    { x: 0, y: 0, emoji: "🌻", estado: "cerrada", timer: 0 },
    { x: 0, y: 0, emoji: "🌸", estado: "cerrada", timer: 0 },
    { x: 0, y: 0, emoji: "🌼", estado: "cerrada", timer: 0 },
    { x: 0, y: 0, emoji: "🌺", estado: "cerrada", timer: 0 },
  ],
  pollinators: [
    { x: 0, y: 0, emoji: "🐝", speed: 80, angle: 0, target: null },
    { x: 0, y: 0, emoji: "🦋", speed: 50, angle: 3, target: null },
    { x: 0, y: 0, emoji: "🪲", speed: 30, angle: 1.5, target: null },
  ],
  worms: Array.from({ length: 7 }, () => ({
    x: 0,
    y: 0,
    angle: Math.random() * Math.PI * 2,
    speed: 15 + Math.random() * 10,
    timer: Math.random() * 5,
  })),
  wormDebris: [
    { emoji: "🍎", x: 0.2, y: 0.3, rot: 0.3, timer: 2 },
    { emoji: "🍌", x: 0.6, y: 0.2, rot: -0.4, timer: 4 },
    { emoji: "🥚", x: 0.8, y: 0.7, rot: 0.15, timer: 1 },
    { emoji: "🍂", x: 0.3, y: 0.8, rot: -0.2, timer: 6 },
    { emoji: "🥬", x: 0.9, y: 0.4, rot: 0.5, timer: 3 },
  ],
  workshopMode: false,
  telar: { hilo: 0, tejido: 0, spin: 0, wheelAngle: 0 },
  conservas: {
    mermelada: 0,
    mermeladaSlots: [false, false, false],
    conserva: 0,
    conservaSlots: [false, false, false],
    harinaSlots: [false, false],
  },
  creativo: { manualidad: 0, used: 0 },
  mercado: { customers: [], spawnTimer: 3, totalSold: 0, upgraded: false },
  lastSale: null,
  achievements: new Set(),
  hints: [],
};

const SLOT_OFFSETS = [-100, 0, 100];
const FRUIT_SLOTS = ["🍓", "🍊", "🍎"];
const VEGGIE_SLOTS = ["🥕", "🫑", "🎃"];
const MATERIAL_SLOTS = ["📦", "🧴", "🫙"];

const BASURA = [
  { icon: "🍎", tipo: "organico" },
  { icon: "🍌", tipo: "organico" },
  { icon: "🍞", tipo: "organico" },
  { icon: "🍂", tipo: "organico" },
  { icon: "🥚", tipo: "organico" },
  { icon: "🍇", tipo: "organico" },
  { icon: "🥦", tipo: "organico" },
  { icon: "📰", tipo: "papel" },
  { icon: "📦", tipo: "papel" },
  { icon: "🗞️", tipo: "papel" },
  { icon: "📚", tipo: "papel" },
  { icon: "📄", tipo: "papel" },
  { icon: "✉️", tipo: "papel" },
  { icon: "🧴", tipo: "plastico" },
  { icon: "🥤", tipo: "plastico" },
  { icon: "🛍️", tipo: "plastico" },
  { icon: "🪥", tipo: "plastico" },
  { icon: "🥡", tipo: "plastico" },
  { icon: "🍾", tipo: "vidrio" },
  { icon: "🫙", tipo: "vidrio" },
  { icon: "🥛", tipo: "vidrio" },
  { icon: "🍶", tipo: "vidrio" },
  { icon: "🔋", tipo: "tecnologico" },
  { icon: "💡", tipo: "tecnologico" },
  { icon: "📱", tipo: "tecnologico" },
  { icon: "🔌", tipo: "tecnologico" },
  { icon: "⌨️", tipo: "tecnologico" },
  { icon: "💾", tipo: "tecnologico" },
  { icon: "🖨️", tipo: "tecnologico" },
  { icon: "🖱️", tipo: "tecnologico" },
  { icon: "💻", tipo: "tecnologico" },
];
const BINS = [
  { tipo: "organico", nombre: "Orgánico", color: "#5aa832", icon: "🍃" },
  { tipo: "plastico", nombre: "Plástico", color: "#d9a521", icon: "🧴" },
  { tipo: "papel", nombre: "Papel", color: "#3d7fc4", icon: "📄" },
  { tipo: "vidrio", nombre: "Vidrio", color: "#2a9d8f", icon: "🫙" },
  {
    tipo: "tecnologico",
    nombre: "Tecnología",
    color: "#607d8b",
    icon: "🔋",
  },
];

function moodColor(v) {
  return v > 60 ? "#4ec96b" : v > 30 ? "#f0c419" : "#e74c3c";
}
function moodFace(v) {
  return v > 60 ? "😊" : v > 30 ? "😐" : "😢";
}

let msgTimeout = null;
function decir(t, color = "#9be08a") {
  const msgEl = document.getElementById("msg");
  if (!msgEl) return;
  msgEl.textContent = t;
  msgEl.style.color = isLightTheme ? "#2e7d32" : color;
  clearTimeout(msgTimeout);
  msgTimeout = setTimeout(() => {
    const el = document.getElementById("msg");
    if (el) el.textContent = "";
  }, 4500);
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3100);
}
function unlockAchievement(id) {
  if (state.achievements.has(id)) return;
  state.achievements.add(id);
  const ach = ACHIEVEMENTS[id];
  if (ach) {
    showToast("🏆 " + ach.icon + " " + ach.name);
    playSound("success");
  }
}
function getRank() {
  const s = state.mercado.totalSold;
  if (s >= 30) return { icon: "👑", name: "Magnate" };
  if (s >= 15) return { icon: "💼", name: "Empresario" };
  if (s >= 5) return { icon: "🌟", name: "Emprendedor" };
  return { icon: "🌱", name: "Aprendiz" };
}

function showHint(x, y, message) {
  playSound("error");
  ctx.save();
  ctx.font = '700 14px "Outfit", Arial, sans-serif';
  const textW = ctx.measureText(message).width;
  ctx.restore();
  const w = Math.min(W - 40, textW + 36);
  const h = 40;
  const cx = Math.max(w / 2 + 8, Math.min(W - w / 2 - 8, x));
  const cy = Math.max(h / 2 + 16, Math.min(H - h / 2 - 16, y - 45));
  state.hints.push({
    x: cx,
    y: cy,
    w,
    h,
    message,
    life: 2.5,
    maxLife: 2.5,
  });
  if (state.hints.length > 2) state.hints.shift();
}

function drawHints() {
  state.hints.forEach((hint) => {
    const age = hint.maxLife - hint.life;
    let alpha = 1;
    if (!prefersReducedMotion) {
      if (age < 0.2) alpha = age / 0.2;
      if (hint.life < 0.5) alpha = Math.min(alpha, hint.life / 0.5);
    }
    const scale = prefersReducedMotion ? 1 : 0.9 + Math.min(1, age / 0.2) * 0.1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(hint.x, hint.y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    rrect(-hint.w / 2 + 1, -hint.h / 2 + 3, hint.w, hint.h, 20);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    rrect(-hint.w / 2, -hint.h / 2, hint.w, hint.h, 20);
    ctx.fill();
    ctx.strokeStyle = "#d1d1e0";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = '700 14px "Outfit", Arial, sans-serif';
    ctx.fillStyle = "#2b2b3d";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(hint.message, 0, 1);
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

const STAT_FIELDS = [
  ["frutas", "s-frutas"],
  ["verduras", "s-verduras"],
  ["cereales", "s-cereales"],
  ["harina", "s-harina"],
  ["compost", "s-compost"],
  ["humus", "s-humus"],
  ["lana", "s-lana"],
  ["materialReciclado", "s-material"],
  ["monedas", "s-monedas"],
  ["puntos", "s-puntos"],
].map(([key, id]) => [key, document.getElementById(id)]);

function stats() {
  for (const [key, element] of STAT_FIELDS)
    if (element) element.textContent = state[key];
  const invEl = document.getElementById("seed-inventory");
  if (invEl)
    invEl.innerHTML = CROPS.map(
      (c) =>
        `<div class="seed-item"><span>${c.emoji} ${c.name}</span><span>x${state.seeds[c.name] || 0}</span></div>`,
    ).join("");
}
function nuevoResiduo() {
  state.trash = BASURA[Math.floor(Math.random() * BASURA.length)];
  state.trashTimer = 0;
}
function spawnParticles(x, y, n, emojis) {
  if (prefersReducedMotion) return;
  for (let i = 0; i < n; i++)
    state.particles.push({
      x: x + (Math.random() - 0.5) * 30,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -1.5 - Math.random() * 1.5,
      life: 1,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    });
}
function addWormFood(amount) {
  state.wormFood = Math.min(100, state.wormFood + amount);
  if (state.wormFood >= 100 && !state.wormsReady) {
    state.wormsReady = true;
    decir(
      "¡Las lombrices hicieron Humus! Tocá la lombricompostera 🪱",
      "#8b5a2b",
    );
    playSound("success");
  }
}

let isPlaying = false;
function startGame() {
  isPlaying = true;
  initAudio();
  if (!isMuted) playSound("success");
  const s = document.getElementById("start-screen");
  s.style.opacity = "0";
  setTimeout(() => {
    s.style.display = "none";
    resizeCanvas();
  }, 500);
}

// ── LAYOUT GRANJA ──
const GAP = 16;
const PAD = 20;
const COL_LEFT_W = Math.round((1000 - PAD * 2 - GAP) / 2);
const COL_RIGHT_W = 1000 - PAD * 2 - GAP - COL_LEFT_W;
const COL_LEFT_X = PAD;
const COL_RIGHT_X = PAD + COL_LEFT_W + GAP;
const TOTAL_H = 680 - PAD * 2;

const P1 = { x: COL_LEFT_X, y: PAD, w: COL_LEFT_W, h: Math.round((TOTAL_H - GAP) / 2) };
const P3_rec = { x: COL_LEFT_X, y: P1.y + P1.h + GAP, w: COL_LEFT_W, h: P1.h };

const P2 = { x: COL_RIGHT_X, y: PAD, w: COL_RIGHT_W, h: Math.round((TOTAL_H - GAP) * 0.75) };
const P3_lomb = { x: COL_RIGHT_X, y: P2.y + P2.h + GAP, w: COL_RIGHT_W, h: TOTAL_H - P2.h - GAP };

const P4_pol = null;

const A_COL_X = [P1.x + 15, P1.x + 240];
const A_ROW_Y = [P1.y + 46, P1.y + 180];
const A_W = 220, A_H = 125;
const ANIMAL_RECTS = Array.from({ length: 4 }, (_, i) => ({
  x: A_COL_X[i % 2],
  y: A_ROW_Y[Math.floor(i / 2)],
  w: A_W,
  h: A_H,
}));
function animalRect(i) {
  return ANIMAL_RECTS[i];
}

const H_COL_X = [P2.x + 20, P2.x + 170, P2.x + 320];
const H_ROW_Y = [P2.y + 80, P2.y + 170, P2.y + 290, P2.y + 380];
const H_W = 140, H_H = 80;
const PLOT_RECTS = Array.from({ length: 12 }, (_, i) => ({
  x: H_COL_X[i % 3],
  y: H_ROW_Y[Math.floor(i / 3)],
  w: H_W,
  h: H_H,
}));
function plotRect(i) {
  return PLOT_RECTS[i];
}

const BIN_MARGIN = 16, BIN_GAP = 10, B_W = 80;
const B_COL_X = BINS.map(
  (_, i) => P3_rec.x + BIN_MARGIN + (B_W + BIN_GAP) * i,
);
const B_Y = P3_rec.y + 165, B_H = 95;
const BIN_RECTS = BINS.map((_, i) => ({
  x: B_COL_X[i],
  y: B_Y,
  w: B_W,
  h: B_H,
}));
function binRect(i) {
  return BIN_RECTS[i];
}
const TRASH_X = P3_rec.x + P3_rec.w / 2 - 45, TRASH_Y = P3_rec.y + 50;

const BOX_X = P3_lomb.x + 190, BOX_Y = P3_lomb.y + 35;
const BOX_W = P3_lomb.w - 210, BOX_H = 100;

const W1 = { x: 20, y: 20, w: 470, h: 310 };
const W2 = { x: 510, y: 20, w: 470, h: 310 };
const W3 = { x: 20, y: 350, w: 470, h: 310 };
const W4 = { x: 510, y: 350, w: 470, h: 310 };

function drawPanel(p, title, icon, bgColor = "rgba(255, 255, 255, 0.25)") {
  ctx.fillStyle = bgColor;
  rrect(p.x, p.y, p.w, p.h, 16);
  ctx.fill();
  ctx.strokeStyle = isLightTheme ? "#d1d1e0" : "rgba(255,255,255,0.4)";
  ctx.lineWidth = 3;
  rrect(p.x, p.y, p.w, p.h, 16);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  rrect(p.x + 15, p.y - 15, 220, 34, 17);
  ctx.fill();
  texto(icon + " " + title, p.x + 30, p.y + 9, 18, "#2b2b3d", "left", "900");
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.04;
    p.life -= dt * 1.2;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function update(dt) {
  if (!isPlaying || document.hidden) return;
  state.time += dt;

  for (let i = state.hints.length - 1; i >= 0; i--) {
    state.hints[i].life -= dt;
    state.hints[i].y -= 15 * dt;
    if (state.hints[i].life <= 0) state.hints.splice(i, 1);
  }

  if (state.workshopMode) {
    updateWorkshop(dt);
    return;
  }
  if (state.selectingSeedFor !== null) return;

  state.animals.forEach((a) => {
    a.food = Math.max(0, a.food - 1.5 * dt);
    a.water = Math.max(0, a.water - 2.0 * dt);
    if (a.hasPoop) a.clean = Math.max(0, a.clean - 3.0 * dt);
    else a.clean = Math.max(0, a.clean - 1.0 * dt);
    if (a.shake > 0) a.shake = Math.max(0, a.shake - dt);
    if (a.poopTimer > 0) {
      a.poopTimer -= dt;
      if (a.poopTimer <= 0) a.hasPoop = true;
    }
    if (a.woolTimer > 0) {
      a.woolTimer -= dt;
      if (a.woolTimer <= 0) a.wool = true;
    }
  });
  if (state.binShake) {
    state.binShake = state.binShake.map((s) => Math.max(0, s - dt * 2));
  }
  state.plots.forEach((p) => {
    if (p.shake > 0) p.shake = Math.max(0, p.shake - dt * 2);
    if (p.estado !== "creciendo" || !p.crop) return;
    p.agua = Math.max(0, p.agua - 0.06 * dt);
    if (p.agua > 0) p.growth += (0.055 / p.crop.time) * dt;
    if (p.growth >= 1) {
      p.growth = 1;
      p.estado = "listo";
    }
  });
  if (!state.trash && state.trashTimer > 0) {
    state.trashTimer -= dt;
    if (state.trashTimer <= 0) nuevoResiduo();
  }
  state.flowers.forEach((f) => {
    if (f.estado === "fruto") {
      f.timer -= dt;
      if (f.timer <= 0) f.estado = "cerrada";
    }
  });
  state.wormDebris.forEach((d) => {
    d.timer -= dt;
    if (d.timer <= 0) {
      d.x = 0.15 + Math.random() * 0.7;
      d.y = 0.15 + Math.random() * 0.7;
      d.rot = (Math.random() - 0.5) * Math.PI;
      d.timer = 3 + Math.random() * 4;
    }
  });

  state.worms.forEach((w) => {
    w.timer -= dt;
    if (w.timer <= 0) {
      w.x = BOX_X + 16 + Math.random() * (BOX_W - 32);
      w.y = BOX_Y + 14 + Math.random() * (BOX_H - 28);
      w.angle = Math.random() * Math.PI * 2;
      w.timer = 2 + Math.random() * 4 + 3 + Math.random() * 3;
    }
    w.angle += (Math.random() - 0.5) * 0.5;
    w.x += Math.cos(w.angle) * w.speed * dt;
    w.y += Math.sin(w.angle) * w.speed * dt;
    const minX = BOX_X + 16,
      maxX = BOX_X + BOX_W - 16,
      minY = BOX_Y + 14,
      maxY = BOX_Y + BOX_H - 14;
    if (w.x < minX) { w.x = minX; w.angle = Math.PI - w.angle; }
    if (w.x > maxX) { w.x = maxX; w.angle = Math.PI - w.angle; }
    if (w.y < minY) { w.y = minY; w.angle = -w.angle; }
    if (w.y > maxY) { w.y = maxY; w.angle = -w.angle; }
  });
  updateParticles(dt);
}

function updateWorkshop(dt) {
  if (state.telar.spin > 0) {
    state.telar.wheelAngle += dt * 5;
  }
  updateMarket(dt);
  if (state.lastSale) {
    state.lastSale.timer -= dt;
    if (state.lastSale.timer <= 0) state.lastSale = null;
  }
  updateParticles(dt);
}

const CUSTOMER_EMOJIS = [
  "🧑‍🦰", "👩", "🧔", "👦", "👧", "👨‍🦱", "🧕", "👴", "👵",
];
const PRODUCT_INFO = {
  tejido: { emoji: "🧣", basePrice: 30, label: "Tejido" },
  mermelada: { emoji: "🍯", basePrice: 25, label: "Mermelada" },
  conserva: { emoji: "🥫", basePrice: 25, label: "Conserva" },
  harina: { emoji: "🥖", basePrice: 40, label: "Harina" },
  manualidad: { emoji: "🎨", basePrice: 20, label: "Manualidad" },
  humus: { emoji: "🪱", basePrice: 15, label: "Humus" },
};
const MARKET_ITEMS = [
  { key: "tejido", emoji: "🧣", label: "Tejidos" },
  { key: "mermelada", emoji: "🍯", label: "Mermeladas" },
  { key: "conserva", emoji: "🥫", label: "Conservas" },
  { key: "harina", emoji: "🥖", label: "Harina" },
  { key: "manualidad", emoji: "🎨", label: "Manualidades" },
  { key: "humus", emoji: "🪱", label: "Humus" },
];

function getInventory(type) {
  if (type === "tejido") return state.telar.tejido;
  if (type === "mermelada") return state.conservas.mermelada;
  if (type === "conserva") return state.conservas.conserva;
  if (type === "harina") return state.harina;
  if (type === "manualidad") return state.creativo.manualidad;
  if (type === "humus") return state.humus;
  return 0;
}
function decInventory(type) {
  if (type === "tejido") state.telar.tejido--;
  if (type === "mermelada") state.conservas.mermelada--;
  if (type === "conserva") state.conservas.conserva--;
  if (type === "harina") state.harina--;
  if (type === "manualidad") state.creativo.manualidad--;
  if (type === "humus") state.humus--;
}

const availableProducts = [];
const CUSTOMER_SLOT_Y = [W4.y + 165, W4.y + 250];

function updateMarket(dt) {
  const m = state.mercado;
  m.spawnTimer -= dt;

  availableProducts.length = 0;
  if (state.telar.tejido > 0) availableProducts.push("tejido");
  if (state.conservas.mermelada > 0) availableProducts.push("mermelada");
  if (state.conservas.conserva > 0) availableProducts.push("conserva");
  if (state.harina > 0) availableProducts.push("harina");
  if (state.creativo.manualidad > 0) availableProducts.push("manualidad");
  if (state.humus > 0) availableProducts.push("humus");

  let waitingCount = 0, usedSlot0 = false, usedSlot1 = false;
  for (const customer of m.customers) {
    if (customer.state === "waiting" || customer.state === "walking_in")
      waitingCount++;
    if (customer.slot === 0) usedSlot0 = true;
    if (customer.slot === 1) usedSlot1 = true;
  }
  const freeSlot = !usedSlot0 ? 0 : !usedSlot1 ? 1 : -1;

  if (
    m.spawnTimer <= 0 &&
    availableProducts.length > 0 &&
    waitingCount < 2 &&
    freeSlot !== -1
  ) {
    m.customers.push({
      emoji:
        CUSTOMER_EMOJIS[Math.floor(Math.random() * CUSTOMER_EMOJIS.length)],
      wants:
        availableProducts[Math.floor(Math.random() * availableProducts.length)],
      x: W4.x + W4.w + 40,
      y: CUSTOMER_SLOT_Y[freeSlot],
      slot: freeSlot,
      state: "walking_in",
      targetX: W4.x + W4.w - 80,
      bob: Math.random() * 6,
    });
    m.spawnTimer = 5 + Math.random() * 3;
  }

  for (let i = m.customers.length - 1; i >= 0; i--) {
    const customer = m.customers[i];
    if (customer.shake > 0) customer.shake = Math.max(0, customer.shake - dt * 2);
    customer.bob += dt * 3;
    if (customer.state === "walking_in") {
      customer.x += (customer.targetX - customer.x) * Math.min(1, dt * 3);
      if (Math.abs(customer.x - customer.targetX) < 5)
        customer.state = "waiting";
    } else if (customer.state === "walking_out") {
      customer.x += 150 * dt;
      if (customer.x > W4.x + W4.w + 60) m.customers.splice(i, 1);
    }
  }
}

function serveCustomer(customer) {
  const type = customer.wants;
  if (getInventory(type) <= 0) {
    customer.shake = 0.5;
    showHint(
      customer.x,
      customer.y - 20,
      `Te falta ${PRODUCT_INFO[type].label} ${PRODUCT_INFO[type].emoji}`,
    );
    return;
  }
  const info = PRODUCT_INFO[type];
  const earned = info.basePrice * (state.mercado.upgraded ? 2 : 1);

  decInventory(type);
  state.monedas += earned;
  state.puntos += 10;
  state.mercado.totalSold++;
  state.productosVendidos++;

  customer.state = "walking_out";
  customer.happy = true;

  spawnParticles(customer.x, customer.y - 20, 12, ["🪙", "✨", "🌟", "💰"]);
  state.lastSale = {
    product: info.label,
    emoji: info.emoji,
    earned: earned,
    timer: 4,
  };

  decir(`¡Vendiste 1 ${info.label}! +${earned}🪙`, "#f0e68c");
  playSound("coin");

  if (state.productosVendidos === 1) unlockAchievement("first_sale");
  if (state.productosVendidos >= 5) unlockAchievement("five_sales");
  if (state.productosVendidos >= 10) unlockAchievement("ten_sales");
  if (state.productosVendidos >= 20) unlockAchievement("twenty_sales");
  if (state.productosVendidos >= 50) unlockAchievement("fifty_sales");
  if (state.monedas >= 100) unlockAchievement("hundred_coins");
  stats();
}

const farmPanelLeft = `
  <div class="info-card"><h3>🐴 El Corral (Arriba)</h3><p>Los animales grandes comen <span class="highlight">cereales y forraje</span> (maíz, trigo, hierbas). Los conejos comen <span class="highlight">verduras</span>. Si no les das, se ponen tristes.</p><p>También juntá su <span class="highlight">estiércol 💩</span> para el compost y esquilá ovejas/llamas para <span class="highlight">lana 🧶</span>.</p></div>
  <div class="info-card"><h3>♻️ Reciclaje (Abajo)</h3><p>Separar la basura <span class="highlight">ahorra energía y protege el agua</span>.</p><p>Los materiales no-orgánicos van al <span class="highlight">taller creativo</span>.</p></div>
`;
const farmPanelRight = `
  <div class="info-card"><h3>🌱 La Huerta Dividida</h3><p>Arriba: 🍎 Frutas y 🥕 Verduras (para conservas y conejos).<br>Abajo: 🌾 Cereales y Forraje (para animales y harina).</p><div class="seed-box"><h4>🌱 Tus semillas guardadas:</h4><div id="seed-inventory"></div></div></div>
  <div class="info-card"><h3>🪱 Lombrices</h3><p> Y alimentá a las lombrices con orgánicos para conseguir <span class="highlight">Humus</span>, que se vende en el mercado.</p></div>
`;
const workshopPanelLeft = `
  <div class="info-card"><h3>🧶 El Telar (Arriba izq.)</h3><p>La <span class="highlight">lana 🧶</span> de ovejas y llamas se <b>hila</b> y se <b>teje</b>.</p><p><b>Click en la rueda 🎡</b> (5 veces = 1 hilo) y después <b>2 hilos → 1 tejido</b>.</p><p>¡Cada paso agrega valor!</p></div>
  <div class="info-card"><h3>🎨 Reciclaje Creativo (Abajo izq.)</h3><p>El <span class="highlight">plástico, papel y vidrio</span> no son basura: con imaginación se transforman en algo nuevo.</p><p><b>3 materiales 📦 → 1 manualidad 🎨</b>.</p></div>
`;
const workshopPanelRight = `
  <div class="info-card"><h3>🍯 Procesados (Arriba der.)</h3><p>Las <span class="highlight">frutas</span> se hacen mermelada. Las <span class="highlight">verduras</span>, conserva. Los <span class="highlight">cereales</span> se muelen para hacer <b>harina 🥖</b>.</p><p><b>Recetas:</b> 3 frutas → 🍯 · 3 verduras → 🥫 · 2 cereales → 🥖</p></div>
  <div class="info-card"><h3>🏪 El Mercado (Abajo der.)</h3><p>Los clientes aparecen solos. ¡Vendé todo lo que produzcas!</p><div class="seed-box"><h4>🔁 El ciclo completo:</h4><p style="font-size: 13px; line-height: 1.5; margin: 0;">Granja → Cosecha → Taller → Productos → Mercado → Monedas → Semillas → Granja</p></div></div>
`;

function switchView(view) {
  state.workshopMode = view === "workshop";
  state.selectingSeedFor = null;
  state.hints = [];
  document.getElementById("shop-modal").style.display = "none";
  document
    .querySelectorAll(".view-tab")
    .forEach((t) => t.classList.toggle("active", t.dataset.view === view));
  const panels = document.querySelectorAll(".side-panel");
  const msgHTML = `<p id="msg"></p>`;

  if (view === "workshop") {
    panels[0].innerHTML = workshopPanelLeft + msgHTML;
    panels[1].innerHTML = workshopPanelRight;
    state.mercado.customers = [];
    state.mercado.spawnTimer = 2;
    decir("¡Bienvenido al taller! Producí y vendé.", "#7ef0d0");
  } else {
    panels[0].innerHTML = farmPanelLeft + msgHTML;
    panels[1].innerHTML = farmPanelRight;
    state.mercado.customers = [];
    stats();
  }
}

function openShop() {
  renderShop();
  document.getElementById("shop-modal").style.display = "flex";
}
function renderShop() {
  document.getElementById("shop-coins").textContent = state.monedas;
  document.getElementById("shop-grid").innerHTML = CROPS.map((crop) => {
    const price = SEED_PRICES[crop.name],
      count = state.seeds[crop.name] || 0,
      canBuy = state.monedas >= price;
    const timeSec = Math.round(crop.time * 18);
    let typeLabel = "🍎";
    if (crop.type === "veggie") typeLabel = "🥕";
    if (crop.type === "cereal") typeLabel = "🌾";
    if (crop.type === "forraje") typeLabel = "🌿";
    return `<div class="shop-item"><div class="shop-emoji">${crop.emoji}</div><div class="shop-info"><div class="shop-name">${crop.name} ${typeLabel}</div><div class="shop-meta">⏱️ ${timeSec}s · 🌾 +${crop.yield} · Tenés: ${count}</div></div><button class="shop-buy" ${canBuy ? "" : "disabled"} onclick="buySeed('${crop.name}', ${price})">${price} 🪙</button></div>`;
  }).join("");
}
function buySeed(name, price) {
  if (state.monedas < price) {
    decir("No tenés suficientes monedas 🪙", "#ffd9a0");
    playSound("error");
    return;
  }
  state.monedas -= price;
  state.seeds[name] = (state.seeds[name] || 0) + 1;
  state.puntos += 2;
  decir(`🌱 ¡Compraste 1 semilla de ${name}!`, "#7ef0d0");
  playSound("success");
  stats();
  renderShop();
}

const stationButtons = [];
let clickableAreas = [];
function stationButton(x, y, w, h, label, enabled, onClick, disabledHint) {
  ctx.fillStyle = enabled ? "#ffffff" : "#e0e0e0";
  rrect(x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = enabled ? "#4caf50" : "#b0b0b0";
  ctx.lineWidth = 2;
  ctx.stroke();
  texto(
    label,
    x + w / 2,
    y + h / 2 + 5,
    13,
    enabled ? "#2b2b3d" : "#888",
    "center",
    "800",
  );
  if (enabled) {
    stationButtons.push({ x, y, w, h, onClick });
  } else if (disabledHint) {
    stationButtons.push({
      x, y, w, h,
      onClick: () => showHint(x + w / 2, y + h / 2, disabledHint),
    });
  }
}
function addClickable(r, handler) {
  clickableAreas.push({ ...r, handler });
}

function renderTelar() {
  const P = W1, s = state.telar;
  drawPanel(P, "Telar", "🧶");
  const centerX = P.x + P.w / 2;

  ctx.fillStyle = "#fff";
  rrect(centerX - 155, P.y + 48, 310, 26, 8);
  ctx.fill();
  texto("🎡 Hacé click en la rueda para hilar", centerX, P.y + 66, 13, "#2b2b3d", "center", "900");

  const wheelY = P.y + 130;
  ctx.save();
  ctx.translate(centerX, wheelY);
  ctx.rotate(s.wheelAngle);
  emoji("🎡", 0, 0, 66);
  ctx.restore();

  if (s.spin > 0) {
    ctx.beginPath();
    ctx.arc(centerX, wheelY, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (s.spin / 100));
    ctx.strokeStyle = "#f0e68c";
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  addClickable({ x: centerX - 55, y: wheelY - 50, w: 110, h: 100 }, () => {
    if (state.lana <= 0) {
      showHint(centerX, wheelY, "Te falta lana 🧶 — esquilá 🐑 o 🦙");
      return;
    }
    s.spin += 20;
    s.wheelAngle += 1;
    playSound("pop");
    spawnParticles(centerX, wheelY, 3, ["🧶", "✨"]);
    if (s.spin >= 100) {
      s.spin = 0;
      s.hilo++;
      state.lana--;
      unlockAchievement("first_hilo");
      decir("🧵 ¡Hilo listo!", "#f0e68c");
      playSound("success");
      stats();
    }
  });

  barra(P.x + 40, P.y + 186, P.w - 80, 12, s.spin / 100, "#f0e68c");
  ctx.fillStyle = "#fff";
  rrect(P.x + 20, P.y + 206, P.w - 40, 28, 8);
  ctx.fill();
  texto(
    `🧶 Lana: ${state.lana}  ·  🧵 Hilo: ${s.hilo}  ·  🧣 Tejido: ${s.tejido}`,
    centerX, P.y + 225, 13, "#2b2b3d", "center", "900",
  );

  stationButton(
    centerX - 105, P.y + P.h - 54, 210, 40,
    "🧶 Tejer (2🧵 → 1🧣)",
    s.hilo >= 2,
    () => {
      s.hilo -= 2;
      s.tejido++;
      unlockAchievement("first_tejido");
      playSound("success");
      decir("🧣 ¡Tejido listo!", "#f0e68c");
      stats();
    },
    "Necesitás 2 hilos 🧵",
  );
}

function renderConservas() {
  const P = W2, s = state.conservas;
  drawPanel(P, "Procesados", "🍯");
  const centerX = P.x + P.w / 2;
  const offsets = SLOT_OFFSETS;

  ctx.fillStyle = "#fff";
  rrect(centerX - 115, P.y + 46, 230, 22, 8);
  ctx.fill();
  texto("🍯 Mermeladas (3 frutas)", centerX, P.y + 62, 13, "#2b2b3d", "center", "900");
  FRUIT_SLOTS.forEach((fe, i) => {
    const fx = centerX + offsets[i];
    const fy = P.y + 90;
    if (s.mermeladaSlots[i]) {
      ctx.globalAlpha = 0.35;
      emoji(fe, fx, fy, 28);
      ctx.globalAlpha = 1;
      emoji("✓", fx + 12, fy + 10, 15);
    } else {
      emoji(fe, fx, fy, 28);
      addClickable({ x: fx - 22, y: fy - 18, w: 44, h: 36 }, () => {
        if (state.frutas <= 0) {
          showHint(fx, fy, "Te faltan frutas 🍎");
          return;
        }
        state.frutas--;
        s.mermeladaSlots[i] = true;
        playSound("chop");
        spawnParticles(fx, fy, 5, ["✨", fe]);
        if (s.mermeladaSlots.every((x) => x)) {
          s.mermeladaSlots = [false, false, false];
          s.mermelada++;
          unlockAchievement("first_mermelada");
          playSound("success");
          decir("🍯 ¡Mermelada lista!", "#f0e68c");
        }
        stats();
      });
    }
  });

  ctx.fillStyle = "#fff";
  rrect(centerX - 115, P.y + 114, 230, 22, 8);
  ctx.fill();
  texto("🥫 Conservas (3 verduras)", centerX, P.y + 130, 13, "#2b2b3d", "center", "900");
  VEGGIE_SLOTS.forEach((ve, i) => {
    const vx = centerX + offsets[i];
    const vy = P.y + 158;
    if (s.conservaSlots[i]) {
      ctx.globalAlpha = 0.35;
      emoji(ve, vx, vy, 28);
      ctx.globalAlpha = 1;
      emoji("✓", vx + 12, vy + 10, 15);
    } else {
      emoji(ve, vx, vy, 28);
      addClickable({ x: vx - 22, y: vy - 18, w: 44, h: 36 }, () => {
        if (state.verduras <= 0) {
          showHint(vx, vy, "Te faltan verduras 🥕");
          return;
        }
        state.verduras--;
        s.conservaSlots[i] = true;
        playSound("chop");
        spawnParticles(vx, vy, 5, ["✨", ve]);
        if (s.conservaSlots.every((x) => x)) {
          s.conservaSlots = [false, false, false];
          s.conserva++;
          unlockAchievement("first_conserva");
          playSound("success");
          decir("🥫 ¡Conserva lista!", "#f0e68c");
        }
        stats();
      });
    }
  });

  ctx.fillStyle = "#fff";
  rrect(centerX - 115, P.y + 182, 230, 22, 8);
  ctx.fill();
  texto("🥖 Molienda (2 cereales)", centerX, P.y + 198, 13, "#2b2b3d", "center", "900");
  const HARINA_SLOTS = ["🌾", "🌽"];
  const H_OFFSETS = [-55, 55];
  HARINA_SLOTS.forEach((he, i) => {
    const hx = centerX + H_OFFSETS[i];
    const hy = P.y + 226;
    if (s.harinaSlots && s.harinaSlots[i]) {
      ctx.globalAlpha = 0.35;
      emoji(he, hx, hy, 28);
      ctx.globalAlpha = 1;
      emoji("✓", hx + 12, hy + 10, 15);
    } else {
      emoji(he, hx, hy, 28);
      addClickable({ x: hx - 22, y: hy - 18, w: 44, h: 36 }, () => {
        if (state.cereales <= 0) {
          showHint(hx, hy, "Te faltan cereales 🌾");
          return;
        }
        state.cereales--;
        if (!s.harinaSlots) s.harinaSlots = [false, false];
        s.harinaSlots[i] = true;
        playSound("chop");
        spawnParticles(hx, hy, 5, ["✨", he]);
        if (s.harinaSlots.every((x) => x)) {
          s.harinaSlots = [false, false];
          state.harina++;
          unlockAchievement("first_harina");
          playSound("success");
          decir("🥖 ¡Harina lista!", "#f0e68c");
        }
        stats();
      });
    }
  });

  ctx.fillStyle = "#fff";
  rrect(centerX - 145, P.y + P.h - 36, 290, 24, 8);
  ctx.fill();
  texto(
    `🍯 ${s.mermelada}  |  🥫 ${s.conserva}  |  🥖 ${state.harina}`,
    centerX, P.y + P.h - 19, 13, "#2b2b3d", "center", "900",
  );
}

function renderCreativo() {
  const P = W3, s = state.creativo;
  drawPanel(P, "Reciclaje Creativo", "🎨");
  const centerX = P.x + P.w / 2;
  const offsets = SLOT_OFFSETS;

  ctx.fillStyle = "#fff";
  rrect(centerX - 130, P.y + 48, 260, 48, 8);
  ctx.fill();
  texto("3 materiales → 1 manualidad", centerX, P.y + 67, 14, "#2b2b3d", "center", "900");
  texto("Hacé click en cada material", centerX, P.y + 86, 12, "#2b2b3d", "center", "700");

  const MATS = MATERIAL_SLOTS, slotY = P.y + 165;
  MATS.forEach((me, i) => {
    const mx = centerX + offsets[i];
    if (i < s.used) {
      ctx.globalAlpha = 0.35;
      emoji(me, mx, slotY, 50);
      ctx.globalAlpha = 1;
      emoji("✓", mx + 22, slotY + 22, 22);
    } else {
      const bob = prefersReducedMotion ? 0 : Math.sin(state.time * 3 + i) * 3;
      const rot = prefersReducedMotion ? 0 : Math.sin(state.time + i) * 0.08;
      ctx.save();
      ctx.translate(mx, slotY + bob);
      ctx.rotate(rot);
      emoji(me, 0, 0, 50);
      ctx.restore();
      addClickable({ x: mx - 30, y: slotY - 30, w: 60, h: 60 }, () => {
        if (state.materialReciclado <= 0) {
          showHint(mx, slotY, "Te falta material 📦 — reciclá en la granja");
          return;
        }
        state.materialReciclado--;
        s.used++;
        playSound("chop");
        spawnParticles(mx, slotY, 6, ["⚡", "✨", "⭐"]);
        if (s.used >= 3) {
          s.used = 0;
          s.manualidad++;
          unlockAchievement("first_manualidad");
          playSound("success");
          decir("🎨 ¡Manualidad creada!", "#f0e68c");
        }
        stats();
      });
    }
  });

  ctx.fillStyle = "#fff";
  rrect(centerX - 135, P.y + P.h - 44, 270, 28, 8);
  ctx.fill();
  texto(
    `Manualidades: ${s.manualidad}  ·  Material: ${state.materialReciclado}📦`,
    centerX, P.y + P.h - 25, 13, "#2b2b3d", "center", "900",
  );
}

function renderMercado() {
  const P = W4, m = state.mercado;
  drawPanel(P, "Mercado", "🏪");

  const rank = getRank();
  ctx.fillStyle = "#fff";
  rrect(P.x + P.w - 140, P.y + 46, 120, 42, 8);
  ctx.fill();
  texto(`${rank.icon} ${rank.name}`, P.x + P.w - 80, P.y + 64, 14, "#2b2b3d", "center", "700");
  texto(`${m.totalSold} ventas`, P.x + P.w - 80, P.y + 80, 12, "#2b2b3d", "center", "700");

  ctx.fillStyle = "#fff";
  rrect(P.x + 20, P.y + 46, 115, 22, 8);
  ctx.fill();
  texto("📦 Inventario", P.x + 77, P.y + 62, 14, "#2b2b3d", "center", "700");

  let iy = P.y + 84;
  MARKET_ITEMS.forEach((item) => {
    const count = getInventory(item.key);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    rrect(P.x + 20, iy - 11, 160, 22, 6);
    ctx.fill();
    emoji(item.emoji, P.x + 35, iy, 16);
    texto(item.label, P.x + 50, iy + 4, 13, "#2b2b3d", "left", "700");
    texto(`x${count}`, P.x + 165, iy + 4, 13, count > 0 ? "#2e7d32" : "#888", "right", "700");
    iy += 24;
  });

  if (!m.upgraded) {
    stationButton(
      P.x + 25, P.y + P.h - 48, 150, 28,
      "⭐ 50🪙 Mejorar",
      state.monedas >= 50,
      () => {
        state.monedas -= 50;
        m.upgraded = true;
        decir("¡Mercado mejorado! Precios x2.", "#f0e68c");
        playSound("success");
        stats();
      },
      "Necesitás 50 monedas 🪙",
    );
  } else {
    ctx.fillStyle = "#fff";
    rrect(P.x + 25, P.y + P.h - 48, 150, 28, 8);
    ctx.fill();
    texto("⭐ Mejorado (x2)", P.x + 100, P.y + P.h - 30, 13, "#2b2b3d", "center", "700");
  }

  const allEmpty = MARKET_ITEMS.every((item) => getInventory(item.key) === 0);
  if (m.customers.length === 0) {
    if (allEmpty) {
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      rrect(P.x + 255, P.y + 150, 175, 45, 8);
      ctx.fill();
      texto("Producí algo para vender", P.x + 342, P.y + 168, 13, "#2b2b3d", "center", "700");
      texto("en las estaciones", P.x + 342, P.y + 184, 12, "#2b2b3d", "center", "600");
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      rrect(P.x + 275, P.y + 160, 135, 30, 8);
      ctx.fill();
      texto("Esperando clientes...", P.x + 342, P.y + 179, 13, "#2b2b3d", "center", "700");
    }
  }

  m.customers.forEach((c) => {
    const cy = c.y + Math.sin(c.bob) * 3;
    let shakeX = 0;
    if (c.shake > 0 && !prefersReducedMotion) {
      shakeX = Math.sin(state.time * 50) * 5 * c.shake;
    }
    ctx.save();
    ctx.translate(shakeX, 0);
    const canServe = getInventory(c.wants) > 0;
    if (c.state === "walking_out") {
      emoji(c.happy ? "😊" : "😐", c.x, cy - 25, 30);
      emoji(c.emoji, c.x, cy + 15, 40);
      return;
    }
    if (canServe && c.state === "waiting") {
      const pulse = 0.6 + 0.4 * Math.sin(state.time * 4);
      ctx.fillStyle = `rgba(76, 175, 80, ${pulse * 0.35})`;
      ctx.beginPath();
      ctx.arc(c.x, cy + 15, 36, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = canServe ? "#d4f4d4" : "#fff";
    rrect(c.x - 45, cy - 52, 90, 38, 10);
    ctx.fill();
    ctx.strokeStyle = canServe ? "#4caf50" : "#ccc";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(c.x - 8, cy - 14);
    ctx.lineTo(c.x + 8, cy - 14);
    ctx.lineTo(c.x, cy - 5);
    ctx.fillStyle = canServe ? "#d4f4d4" : "#fff";
    ctx.fill();
    emoji(PRODUCT_INFO[c.wants].emoji, c.x - 18, cy - 33, 20);
    texto("x1", c.x + 16, cy - 28, 12, "#2b2b3d", "center", "900");
    emoji(c.emoji, c.x, cy + 15, 40);
    if (c.state === "waiting")
      addClickable({ x: c.x - 45, y: cy - 52, w: 90, h: 95 }, () => serveCustomer(c));
    ctx.restore();
  });

  if (state.lastSale) {
    const ls = state.lastSale;
    const alpha = Math.min(1, ls.timer / 0.5);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    const msgX = P.x + P.w - 150;
    const msgY = P.y + P.h - 80;
    rrect(msgX - 130, msgY - 14, 260, 28, 8);
    ctx.fill();
    texto(
      `${ls.emoji} ¡Vendiste 1 ${ls.product}! +${ls.earned}🪙`,
      msgX, msgY + 5, 13, "#2b2b3d", "center", "700",
    );
    ctx.globalAlpha = 1;
  }
}

function renderWorkshop() {
  stationButtons.length = 0;
  clickableAreas.length = 0;
  paintChecker(WORKSHOP_PATTERN);
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillRect(0, 0, W, H);

  renderTelar();
  renderConservas();
  renderCreativo();
  renderMercado();
}

function handleWorkshopClick(x, y) {
  for (let btn of stationButtons) {
    if (inside(x, y, btn)) {
      btn.onClick();
      return;
    }
  }
  for (let i = clickableAreas.length - 1; i >= 0; i--) {
    if (inside(x, y, clickableAreas[i])) {
      clickableAreas[i].handler();
      return;
    }
  }
  playSound("pop");
}

function createCheckerPattern(colors) {
  const tile = document.createElement("canvas");
  tile.width = tile.height = 64;
  const tileCtx = tile.getContext("2d");
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      tileCtx.fillStyle = colors[(row + col) % 2];
      tileCtx.fillRect(col * 32, row * 32, 32, 32);
    }
  }
  return ctx.createPattern(tile, "repeat");
}
const FARM_PATTERN = createCheckerPattern(["#74bd48", "#7ec850"]);
const WORKSHOP_PATTERN = createCheckerPattern(["#4AACC4", "#354393"]);
function paintChecker(pattern) {
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, W, H);
}
function grass() {
  paintChecker(FARM_PATTERN);
}

function renderCorral() {
  drawPanel(P1, "Corral", "🐴");
  state.animals.forEach((a, i) => {
    const r = animalRect(i);
    const shakeX =
      a.shake > 0 && !prefersReducedMotion
        ? Math.sin(state.time * 40) * 4
        : 0;
    const bob = prefersReducedMotion
      ? 0
      : Math.sin(state.time * 2 + a.bobOffset) * 2;
    ctx.fillStyle = "#fff";
    rrect(r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.08)";
    ctx.lineWidth = 2;
    ctx.stroke();
    texto(a.nombre, r.x + 12, r.y + 22, 15, "#2b2b3d", "left", "900");

    const avg = (a.food + a.water + a.clean) / 3,
      lowest = Math.min(a.food, a.water, a.clean);
    emoji(moodFace(avg), r.x + r.w - 18, r.y + 18, 20);
    ctx.save();
    ctx.translate(r.x + 42 + shakeX, r.y + 64 + bob);
    emoji(a.emoji, 0, 0, 50);
    ctx.restore();

    const bx = r.x + 75;
    emoji(a.type === "conejo" ? "🥕" : "🌾", bx, r.y + 45, 16);
    barra(bx + 20, r.y + 39, 105, 11, a.food / 100, moodColor(a.food));
    emoji("💧", bx, r.y + 66, 16);
    barra(bx + 20, r.y + 60, 105, 11, a.water / 100, moodColor(a.water));
    emoji("🧼", bx, r.y + 87, 16);
    barra(bx + 20, r.y + 81, 105, 11, a.clean / 100, moodColor(a.clean));

    let action = a.hasPoop
      ? "💩"
      : a.food < 40
        ? a.type === "conejo" ? "🥕" : "🌾"
        : a.water < 40
          ? "💧"
          : a.clean < 40
            ? "🧼"
            : a.wool && lowest >= 90
              ? "✂️"
              : "❤️";
    if (action === "💩") {
      const pb = prefersReducedMotion ? 0 : Math.sin(state.time * 8) * 3;
      emoji("💩", r.x + r.w - 30, r.y + r.h - 30 + pb, 24);
    } else {
      ctx.fillStyle = "#f0f0f5";
      rrect(r.x + r.w - 45, r.y + r.h - 35, 35, 25, 8);
      ctx.fill();
      emoji(action, r.x + r.w - 27.5, r.y + r.h - 22.5, 18);
    }
  });
}

function renderHuerta() {
  drawPanel(P2, "Huerta", "🥕");

  texto("🍎 Frutas y Verduras", P2.x + 16, P2.y + 62, 15, "#2b2b3d", "left", "900");

  ctx.strokeStyle = isLightTheme ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(P2.x + 15, P2.y + 270);
  ctx.lineTo(P2.x + P2.w - 15, P2.y + 270);
  ctx.stroke();

  texto("🌾 Cereales y Forraje", P2.x + 16, P2.y + 285, 15, "#2b2b3d", "left", "900");

  state.plots.forEach((p, i) => {
    const r = plotRect(i);
    let shakeX = 0;
    if (p.shake > 0 && !prefersReducedMotion) {
      shakeX = Math.sin(state.time * 50) * 6 * p.shake;
    }
    ctx.save();
    ctx.translate(shakeX, 0);
    ctx.fillStyle = "#8b5a2b";
    rrect(r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    ctx.fillStyle = "#6d451f";
    rrect(r.x, r.y + 38, r.w, r.h - 38, 10);
    ctx.fill();
    ctx.fillStyle = "#7a4d24";
    for (let k = 0; k < 2; k++)
      ctx.fillRect(r.x + 10, r.y + 46 + k * 9, r.w - 20, 3);

    if (p.estado === "vacio") {
      emoji("🌱", r.x + r.w / 2, r.y + 24, 22);
      texto("Plantar", r.x + r.w / 2, r.y + 57, 14, "#ffe9c9", "center", "800");
    }
    if (p.estado === "creciendo" && p.crop) {
      const icon = p.growth >= 1 ? p.crop.emoji : p.growth > 0.65 ? "🌿" : "🌱";
      emoji(icon, r.x + r.w / 2, r.y + 27, 25);
      barra(r.x + 10, r.y + 6, r.w - 20, 6, p.agua, "#4aa3ff");
      texto("Regar 💧", r.x + r.w / 2, r.y + 58, 14, "#ffe9c9", "center", "800");
    }
    if (p.estado === "listo" && p.crop) {
      emoji(p.crop.emoji, r.x + r.w / 2, r.y + 24, 28);
      texto(`Cosechar +${p.crop.yield}`, r.x + r.w / 2, r.y + 58, 14, "#d8ffd0", "center", "900");
    }
    ctx.restore();
  });
}

function renderReciclaje() {
  drawPanel(P3_rec, "Reciclaje", "♻️");
  if (state.trash) {
    texto(
      "Tocá el tacho correcto:",
      P3_rec.x + P3_rec.w / 2, P3_rec.y + 152,
      15, "#2b2b3d", "center", "900",
    );
    ctx.fillStyle = "#fff";
    rrect(TRASH_X, TRASH_Y, 90, 85, 14);
    ctx.fill();
    ctx.strokeStyle = "#4caf50";
    ctx.lineWidth = 3;
    ctx.stroke();
    emoji(state.trash.icon, TRASH_X + 45, TRASH_Y + 42, 48);
  } else {
    texto(
      "¡Excelente! Preparando próximo residuo...",
      P3_rec.x + P3_rec.w / 2, P3_rec.y + 152,
      15, "#2b2b3d", "center", "900",
    );
  }
  BINS.forEach((b, i) => {
    const r = binRect(i);
    let shakeX = 0;
    if (state.binShake && state.binShake[i] > 0 && !prefersReducedMotion) {
      shakeX = Math.sin(state.time * 50) * 6 * state.binShake[i];
    }
    ctx.save();
    ctx.translate(shakeX, 0);
    ctx.fillStyle = b.color;
    rrect(r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.2)";
    ctx.lineWidth = 2;
    ctx.stroke();
    emoji(b.icon, r.x + r.w / 2, r.y + 40, 38);
    texto(b.nombre, r.x + r.w / 2, r.y + 82, 14, "#fff", "center", "900");
    ctx.restore();
  });
}

function renderLumbricario() {
  drawPanel(P3_lomb, "Lombricompostera", "🪱");

  texto(
    `Orgánicos: ${Math.round(state.wormFood)}%`,
    P3_lomb.x + 85, P3_lomb.y + 64,
    15, "#2b2b3d", "center", "900",
  );
  barra(P3_lomb.x + 16, P3_lomb.y + 72, 138, 12, state.wormFood / 100, "#8bc34a");
  texto("Dales 💩 o 🍃 orgánico", P3_lomb.x + 88, P3_lomb.y + 95, 13, "#2b2b3d", "center", "900");
  texto(`🪱 Humus juntado: ${state.humus}`, P3_lomb.x + 88, P3_lomb.y + 113, 14, "#2b2b3d", "center", "900");

  const btnW = 130, btnH = 28;
  const btnX = P3_lomb.x + 85 - btnW / 2;
  const btnY = P3_lomb.y + 130;
  ctx.fillStyle = state.compost > 0 ? "#4caf50" : "#666";
  rrect(btnX, btnY, btnW, btnH, 8);
  ctx.fill();
  texto("🍃 Alimentar (-1♻️)", P3_lomb.x + 85, btnY + 18, 14, "#2b2b3d", "center", "900");

  addClickable({ x: btnX, y: btnY, w: btnW, h: btnH }, () => {
    if (state.compost > 0) {
      state.compost--;
      addWormFood(20);
      playSound("pop");
      spawnParticles(btnX + btnW / 2, btnY, 4, ["🍃", "✨"]);
      stats();
    } else {
      showHint(btnX + btnW / 2, btnY, "Te falta compost ♻️");
    }
  });

  ctx.fillStyle = "#3e2723";
  rrect(BOX_X, BOX_Y, BOX_W, BOX_H, 10);
  ctx.fill();
  ctx.strokeStyle = "#8b5a2b";
  ctx.lineWidth = 3;
  ctx.stroke();

  state.wormDebris.forEach((d) => {
    if (d.timer > 0) {
      const dx = BOX_X + d.x * BOX_W;
      const dy = BOX_Y + d.y * BOX_H;
      let alpha = 0.8;
      if (d.timer < 1) alpha = Math.max(0, d.timer * 0.8);
      if (d.timer > 6) alpha = Math.min(0.8, (7 - d.timer) * 0.8);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(dx, dy);
      ctx.rotate(d.rot);
      emoji(d.emoji, 0, 0, 22);
      ctx.restore();
    }
  });

  state.worms.forEach((w) => emoji("🪱", w.x, w.y, 22));
  if (state.wormsReady) {
    ctx.fillStyle = `rgba(76, 175, 80, ${0.45 + 0.3 * Math.sin(state.time * 6)})`;
    rrect(BOX_X, BOX_Y, BOX_W, BOX_H, 10);
    ctx.fill();
    texto(
      "¡Tocá para juntar Humus! 🪱",
      BOX_X + BOX_W / 2, BOX_Y + BOX_H / 2 + 5,
      14, "#fff", "center", "900",
    );
  }
}

function renderPolinizadores() {
  drawPanel(P4_pol, "Polinizadores", "🐝");
  ctx.fillStyle = isLightTheme ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.3)";
  rrect(P4_pol.x + 15, P4_pol.y + 46, P4_pol.w - 30, 24, 6);
  ctx.fill();
  texto(
    "Tocá a los insectos (🐝 🦋 🪲) para que polinicen las flores",
    P4_pol.x + P4_pol.w / 2, P4_pol.y + 62,
    12, getTextColor(), "center", "800",
  );

  state.flowers.forEach((f) => {
    ctx.fillStyle = "#6d451f";
    ctx.beginPath();
    ctx.ellipse(f.x, f.y, 25, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    if (f.estado === "cerrada") emoji("🌱", f.x, f.y - 18, 26);
    else {
      emoji(f.emoji, f.x, f.y - 22, 32);
      emoji("🍎", f.x + 15, f.y - 35, 20);
    }
  });

  state.pollinators.forEach((p) => {
    if (p.target !== null) {
      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = isLightTheme ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(state.flowers[p.target].x, state.flowers[p.target].y - 20);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const bobY = prefersReducedMotion ? 0 : Math.sin(state.time * 8 + p.angle) * 2;
    ctx.save();
    ctx.translate(p.x, p.y + bobY);
    emoji(p.emoji, 0, 0, 26);
    ctx.restore();
  });
}

const SEED_MENU = {
  w: 580,
  h: 430,
  x: (W - 580) / 2,
  y: (H - 430) / 2,
};
let activeSeedButtons = [];
let cancelSeedBtn = null;

function renderSeedMenu() {
  activeSeedButtons = [];
  cancelSeedBtn = null;
  if (state.selectingSeedFor === null) return;
  const isBottomRow = state.selectingSeedFor >= 6;

  const { x: menuX, y: menuY, w: menuW, h: menuH } = SEED_MENU;
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = getPanelBg();
  rrect(menuX, menuY, menuW, menuH, 20);
  ctx.fill();
  ctx.strokeStyle = getPanelStroke();
  ctx.lineWidth = 4;
  ctx.stroke();

  texto(
    isBottomRow
      ? "¿Qué cereal o forraje querés plantar?"
      : "¿Qué fruta o verdura querés plantar?",
    W / 2, menuY + 42, 22, getTextColor(), "center", "900",
  );
  texto(
    isBottomRow
      ? "🌾 Para alimentar animales del corral y moler harina"
      : "🍎 Para hacer mermeladas, conservas y alimentar conejos",
    W / 2, menuY + 68, 13,
    isLightTheme ? "#4a4a5a" : "#ccc", "center", "700",
  );

  const semillasFiltradas = CROPS.filter((crop) => {
    const isCerealType = crop.type === "cereal" || crop.type === "forraje";
    return isBottomRow === isCerealType;
  });

  const cols = semillasFiltradas.length <= 3 ? semillasFiltradas.length : 4;
  const btnW = 122, btnH = 104, gapX = 14, gapY = 16;
  const totalGridW = cols * btnW + (cols - 1) * gapX;
  const startX = menuX + (menuW - totalGridW) / 2;
  const startY = semillasFiltradas.length <= 3 ? menuY + 135 : menuY + 95;

  semillasFiltradas.forEach((crop, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const bx = startX + col * (btnW + gapX);
    const by = startY + row * (btnH + gapY);
    const count = state.seeds[crop.name] || 0;

    activeSeedButtons.push({ x: bx, y: by, w: btnW, h: btnH, crop });

    ctx.fillStyle =
      count > 0
        ? isLightTheme ? "#e8f5e9" : "#3b4254"
        : isLightTheme ? "#f0f0f0" : "#252533";
    rrect(bx, by, btnW, btnH, 12);
    ctx.fill();
    ctx.strokeStyle = count > 0 ? "#7ec850" : "#555577";
    ctx.lineWidth = 2;
    ctx.stroke();

    emoji(crop.emoji, bx + btnW / 2, by + 28, 34);
    texto(
      crop.name, bx + btnW / 2, by + 58, 13,
      count > 0 ? getTextColor() : "#888", "center", "900",
    );

    const ts = Math.round(crop.time * 18);
    let typeEmoji =
      crop.type === "fruit" ? "🍎"
      : crop.type === "veggie" ? "🥕"
      : crop.type === "cereal" ? "🌾"
      : "🌿";
    texto(
      `⏱️ ${ts}s · ${typeEmoji}+${crop.yield}`,
      bx + btnW / 2, by + 76, 11,
      count > 0 ? (isLightTheme ? "#2e7d32" : "#9be08a") : "#888",
      "center", "800",
    );
    texto(
      `Tenés: x${count}`,
      bx + btnW / 2, by + 94, 12,
      count > 0 ? (isLightTheme ? "#b8860b" : "#f0e68c") : "#ff6b6b",
      "center", "900",
    );
  });

  const cw = 150, ch = 38, cx = W / 2 - cw / 2, cy = menuY + menuH - 54;
  cancelSeedBtn = { x: cx, y: cy, w: cw, h: ch };
  ctx.fillStyle = "#e74c3c";
  rrect(cx, cy, cw, ch, 10);
  ctx.fill();
  texto("Cancelar ✖", W / 2, cy + 24, 14, "#fff", "center", "900");
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);

  ctx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (isPlaying) {
    if (state.workshopMode) {
      renderWorkshop();
    } else {
      clickableAreas.length = 0;
      stationButtons.length = 0;
      grass();
      renderCorral();
      renderHuerta();
      renderReciclaje();
      renderLumbricario();
      renderSeedMenu();
    }
    state.particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life);
      emoji(p.emoji, p.x, p.y, 26);
    });
    ctx.globalAlpha = 1;
    drawHints();
  }
  requestAnimationFrame(loop);
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    last = performance.now();
    resizeCanvas();
  }
});
window.addEventListener("resize", resizeCanvas);
function posicion(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (W / r.width),
    y: (e.clientY - r.top) * (H / r.height),
  };
}
function inside(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

canvas.addEventListener("click", (e) => {
  if (!isPlaying) return;
  if (!audioCtx) initAudio();
  const { x, y } = posicion(e);
  if (state.workshopMode) {
    handleWorkshopClick(x, y);
    return;
  }
  let interacted = false;

  if (state.selectingSeedFor !== null) {
    if (cancelSeedBtn && inside(x, y, cancelSeedBtn)) {
      state.selectingSeedFor = null;
      playSound("pop");
      return;
    }
    let handled = false;
    for (const btn of activeSeedButtons) {
      if (inside(x, y, btn)) {
        handled = true;
        const p = state.plots[state.selectingSeedFor], crop = btn.crop;
        if (state.seeds[crop.name] > 0 && state.compost > 0) {
          state.seeds[crop.name]--;
          state.compost--;
          p.crop = crop;
          p.estado = "creciendo";
          p.growth = 0;
          p.agua = 1;
          const idx = state.selectingSeedFor;
          state.selectingSeedFor = null;
          const r = plotRect(idx);
          spawnParticles(r.x + r.w / 2, r.y + 35, 4, ["✨", "💧"]);
          decir(`🌱 ¡Semilla de ${p.crop.name} plantada!`);
          playSound("pop");
          stats();
        } else if (state.seeds[crop.name] <= 0) {
          showHint(btn.x + btn.w / 2, btn.y, `Sin semillas de ${crop.name} — comprá en la 🛒`);
        } else {
          showHint(btn.x + btn.w / 2, btn.y, "Te falta compost ♻️");
          state.selectingSeedFor = null;
        }
        break;
      }
    }
    if (!handled && !inside(x, y, SEED_MENU)) {
      state.selectingSeedFor = null;
    }
    return;
  }

  if (inside(x, y, P3_lomb)) {
    if (state.wormsReady) {
      state.humus += 1;
      state.wormFood = 0;
      state.wormsReady = false;
      state.puntos += 20;
      playSound("success");
      decir("🪱 ¡Juntaste Humus premium! +1 Humus.", "#8b5a2b");
      spawnParticles(BOX_X + BOX_W / 2, BOX_Y + BOX_H / 2, 12, ["✨", "🪱", "🌟"]);
      stats();
    } else {
      showHint(
        x, y,
        state.wormFood < 100
          ? `Faltan orgánicos (${Math.round(state.wormFood)}%) 🍎`
          : "Esperá a que las lombrices coman 🪱",
      );
    }
    return;
  }

  state.animals.forEach((a, i) => {
    const r = animalRect(i);
    if (a.hasPoop) {
      const d = Math.hypot(x - (r.x + r.w - 30), y - (r.y + r.h - 30));
      if (d < 35) {
        interacted = true;
        a.hasPoop = false;
        state.compost += 2;
        state.puntos += 5;
        addWormFood(20);
        spawnParticles(r.x + 120, r.y + 102, 5, ["♻️", "✨", "🌟"]);
        decir("💩 ¡Limpiaste el establo! +2 Compost.");
        playSound("pop");
        stats();
        return;
      }
    }
    if (inside(x, y, r)) {
      interacted = true;
      let ls = "food", lv = a.food;
      if (a.water < lv) { lv = a.water; ls = "water"; }
      if (a.clean < lv) { lv = a.clean; ls = "clean"; }

      if (lv < 90) {
        if (ls === "food") {
          const isRabbit = a.type === "conejo";
          const foodKey = isRabbit ? "verduras" : "cereales";
          const foodName = isRabbit ? "verduras 🥕" : "cereales 🌾";
          const foodEmoji = isRabbit ? "🥕" : "🌾";

          if (state[foodKey] > 0) {
            state[foodKey]--;
            a.food = 100;
            a.poopTimer = 3;
            state.puntos += 5;
            spawnParticles(r.x + 45, r.y + 50, 6, [foodEmoji, "✨"]);
            decir(`¡${a.nombre} comió feliz! Le diste ${foodName}.`);
            playSound("feed");
            stats();
          } else {
            a.shake = 0.35;
            showHint(r.x + 45, r.y + 50, `Te falta ${foodName} para ${a.nombre}`);
          }
        } else if (ls === "water") {
          a.water = 100;
          spawnParticles(r.x + 45, r.y + 50, 4, ["💧", "✨"]);
          decir(`¡Le diste agua a ${a.nombre}!`);
          playSound("water");
        } else if (ls === "clean") {
          a.clean = 100;
          spawnParticles(r.x + 45, r.y + 50, 4, ["🧼", "✨"]);
          decir(`¡Cepillaste a ${a.nombre}!`);
          playSound("pop");
        }
      } else if (a.wool) {
        a.wool = false;
        state.lana += 1;
        state.puntos += 15;
        a.woolTimer = 45;
        spawnParticles(r.x + 45, r.y + 50, 8, ["🧶", "✨", "🌟"]);
        decir(`¡Esquilaste a ${a.nombre}! +1 Lana 🧶`);
        playSound("success");
        stats();
      } else {
        state.puntos += 1;
        decir(`Acaricias a ${a.nombre}.`);
        spawnParticles(r.x + 45, r.y + 50, 3, ["❤️"]);
        playSound("pop");
      }
    }
  });

  state.plots.forEach((p, i) => {
    const r = plotRect(i);
    if (inside(x, y, r)) {
      interacted = true;
      if (p.estado === "vacio") {
        if (state.compost > 0) state.selectingSeedFor = i;
        else {
          p.shake = 0.5;
          showHint(r.x + r.w / 2, r.y + r.h / 2, "Te falta compost ♻️");
        }
      } else if (p.estado === "creciendo") {
        p.agua = 1;
        spawnParticles(r.x + r.w / 2, r.y + 40, 3, ["💧"]);
        decir("💧 ¡Regado!");
        playSound("water");
      } else if (p.estado === "listo") {
        p.estado = "vacio";
        p.growth = 0;
        p.agua = 1;
        const yld = p.crop.yield;
        const isFruit = p.crop.type === "fruit";
        const isCereal = p.crop.type === "cereal" || p.crop.type === "forraje";

        if (isFruit) state.frutas += yld;
        else if (isCereal) state.cereales += yld;
        else state.verduras += yld;

        state.compost += 1;
        state.seeds[p.crop.name] += 2;
        state.puntos += 5 * yld;

        spawnParticles(r.x + r.w / 2, r.y + 30, 8, [p.crop.emoji, "✨", "🌱"]);
        let tipoTexto = isFruit ? "🍎 frutas" : isCereal ? "🌾 cereales" : "🥕 verduras";
        decir(`¡Cosechaste ${yld} ${p.crop.emoji}! +${yld} ${tipoTexto} y 2 semillas`);
        playSound("success");
        stats();
      }
    }
  });

  if (state.trash) {
    BINS.forEach((b, i) => {
      const r = binRect(i);
      if (inside(x, y, r)) {
        interacted = true;
        if (b.tipo === state.trash.tipo) {
          state.puntos += 10;
          state.compost += 1;
          if (state.trash.tipo === "organico") {
            addWormFood(25);
            decir("✅ ¡Correcto! Al la lombricompostera.");
          } else {
            state.materialReciclado += 1;
            if (Math.random() < 0.3) {
              const rc = CROPS[Math.floor(Math.random() * CROPS.length)];
              state.seeds[rc.name]++;
              decir(`✅ ¡Correcto! +1 Material y semilla de ${rc.name} ${rc.emoji}`);
            } else decir("✅ ¡Correcto! +1 Material.");
          }
          spawnParticles(r.x + r.w / 2, r.y + 40, 8, ["✨", "⭐", "🌟"]);
          playSound("success");
          stats();
        } else {
          if (!state.binShake) state.binShake = [0, 0, 0, 0, 0];
          state.binShake[i] = 0.5;
          showHint(r.x + r.w / 2, r.y + r.h / 2, `Casi… el ${state.trash.icon} no va en ${b.nombre}`);
        }
        state.trash = null;
        state.trashTimer = 1.2;
      }
    });
  }

  if (!interacted) playSound("pop");
});

stats();
nuevoResiduo();
resizeCanvas();
requestAnimationFrame(loop);
switchView("farm");
