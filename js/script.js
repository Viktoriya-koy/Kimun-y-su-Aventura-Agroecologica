"use strict";
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false });
const W = 1000,
  H = 680;
let canvasScale = 1;
let canvasScaleX = 1;
let canvasScaleY = 1;

function resizeCanvas() {
  const wrapper = canvas.parentElement;
  if (
    wrapper &&
    window.innerHeight <= 560 &&
    window.innerWidth > window.innerHeight
  ) {
    const availW = Math.max(100, wrapper.clientWidth - 6);
    const availH = Math.max(100, wrapper.clientHeight - 4);
    const fitW = Math.floor(Math.min(availW, availH * (W / H)));
    const fitH = Math.floor(fitW * (H / W));
    const targetW = `${fitW}px`;
    const targetH = `${fitH}px`;
    if (canvas.style.width !== targetW || canvas.style.height !== targetH) {
      canvas.style.width = targetW;
      canvas.style.height = targetH;
    }
  } else if (canvas.style.width !== "" || canvas.style.height !== "") {
    canvas.style.width = "";
    canvas.style.height = "";
  }

  // Usamos clientWidth / clientHeight (content-box real sin bordes) para evitar reescalado borroso
  const cssW = canvas.clientWidth;
  const cssH = canvas.clientHeight;
  if (cssW === 0 || cssH === 0) return;

  const rawDpr = window.devicePixelRatio || 1;
  // En monitores de PC (DPR < 2) renderizamos a 2x del DPR nativo para nitidez HiDPI perfecta
  const dpr = rawDpr < 2 ? rawDpr * 2 : Math.min(rawDpr, 3);
  const displayW = Math.round(cssW * dpr);
  const displayH = Math.round(cssH * dpr);

  if (canvas.width !== displayW || canvas.height !== displayH) {
    canvas.width = displayW;
    canvas.height = displayH;
  }

  canvasScaleX = canvas.width / W;
  canvasScaleY = canvas.height / H;
  canvasScale = canvasScaleX;
}
const EMOJI_FONT =
  '"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol",sans-serif';

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
  requestAnimationFrame(resizeCanvas);
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
  requestAnimationFrame(resizeCanvas);
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
  ctx.font = `${safeWeight} ${size}px "Outfit", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  const sx = Math.round(x * canvasScaleX) / canvasScaleX;
  const sy = Math.round(y * canvasScaleY) / canvasScaleY;
  ctx.fillText(t, sx, sy);
}
function emoji(ch, x, y, size) {
  ctx.save();
  ctx.fillStyle = "#000";
  ctx.font = `${size}px "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const sx = Math.round(x * canvasScaleX) / canvasScaleX;
  const sy = Math.round(y * canvasScaleY) / canvasScaleY;
  ctx.fillText(ch, sx, sy);
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
  { emoji: "🍇", name: "Uvas", time: 1.3, yield: 4, type: "fruit" },
  { emoji: "🍉", name: "Sandía", time: 1.6, yield: 4, type: "fruit" },
  { emoji: "🍎", name: "Manzana", time: 2.0, yield: 5, type: "fruit" },
  { emoji: "🥕", name: "Zanahoria", time: 0.65, yield: 2, type: "veggie" },
  { emoji: "🫑", name: "Pimiento", time: 0.6, yield: 2, type: "veggie" },
  { emoji: "🥦", name: "Brócoli", time: 0.7, yield: 2, type: "veggie" },
  { emoji: "🍠", name: "Batata", time: 0.9, yield: 3, type: "veggie" },  
  { emoji: "🌽", name: "Maíz", time: 1.0, yield: 3, type: "cereal" },
  { emoji: "🌾", name: "Trigo", time: 0.8, yield: 3, type: "cereal" },
  { emoji: "🌿", name: "Hierbas", time: 0.4, yield: 2, type: "forraje" },
];
const SEED_PRICES = {
  Frutilla: 10,
  Uvas: 30,
  Sandía: 38,
  Manzana: 50,
  Zanahoria: 15,
  Pimiento: 15,
  Brócoli: 14,
  Batata: 18,
  Maíz: 22,
  Trigo: 20,
  Hierbas: 12,
};

const ACHIEVEMENTS = {
  first_hilo: { icon: "🧵", name: "Primer hilo" },
  first_tejido: { icon: "🧣", name: "Primer tejido" },
  first_mermelada: { icon: "🍯", name: "Primera mermelada" },
  first_conserva: { icon: "🥫", name: "Primera conserva" },
  first_harina: { icon: "🥖", name: "Primera harina" },
  first_manualidad: { icon: "🎨", name: "Primera manualidad" },
  first_fish: { icon: "🐟", name: "Pesca responsable" },
  fire_hero: { icon: "🚒", name: "Guardián del bosque" },
  river_clean: { icon: "🌊", name: "Río cristalino" },
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
  huevos: 0,
  peces: 0,
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
    Uva: 1,
    Sandia: 1,
    Manzana: 0,
    Pimiento: 2,
    Brocoli: 2,
    Batata: 1,
    Trigo: 2,
    Hierbas: 2,
  },
  animals: [
          {
            type: "gallina",
            emoji: "🐔",
            nombre: "Gallina",
            food: 60,
            water: 60,
            clean: 60,
            hasPoop: false,
            poopTimer: 0,
            wool: true,
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
  trashBag: [],
  trashTimer: 0,
  particles: [],
  time: 0,
  selectingSeedFor: null,
  flowers: [
    { x: 565, y: 530, emoji: "🌻", estado: "cerrada", timer: 0 },
    { x: 675, y: 520, emoji: "🌸", estado: "cerrada", timer: 0 },
    { x: 795, y: 530, emoji: "🌼", estado: "cerrada", timer: 0 },
    { x: 910, y: 520, emoji: "🌺", estado: "cerrada", timer: 0 },
    { x: 615, y: 598, emoji: "🌷", estado: "cerrada", timer: 0 },
    { x: 735, y: 592, emoji: "🌹", estado: "cerrada", timer: 0 },
    { x: 855, y: 598, emoji: "🪷", estado: "cerrada", timer: 0 },
    { x: 935, y: 590, emoji: "🌻", estado: "cerrada", timer: 0 },
  ],
  pollinators: [
    { x: 590, y: 462, emoji: "🐝", speed: 120, angle: 0.4, target: null },
    { x: 695, y: 482, emoji: "🦋", speed: 95, angle: 2.3, target: null },
    { x: 795, y: 468, emoji: "🐝", speed: 112, angle: 1.1, target: null },
    { x: 880, y: 486, emoji: "🦋", speed: 92, angle: 3.5, target: null },
    { x: 745, y: 458, emoji: "🪲", speed: 85, angle: 1.8, target: null },
  ],
  nature: {
    riverPurity: 80,
    riverTrash: [],
    riverSpawnTimer: 1.2,
    oxygen: 88,
    fishes: [
      { x: 575, y: 135, vx: 30, nombre: "Pejerrey", emoji: "🐟", filter: "none", sx: 1.16, sy: 0.84, size: 28, phase: 0 },
      { x: 650, y: 185, vx: -25, nombre: "Trucha serrana", emoji: "🐟", filter: "hue-rotate(305deg) saturate(1.25)", sx: 1.04, sy: 0.96, size: 30, phase: 1.2 },
      { x: 740, y: 145, vx: 22, nombre: "Carpa", emoji: "🐟", filter: "hue-rotate(155deg) saturate(1.45)", sx: 0.96, sy: 1.12, size: 33, phase: 2.4 },
      { x: 835, y: 205, vx: -28, nombre: "Pejerrey", emoji: "🐟", filter: "none", sx: 1.16, sy: 0.84, size: 31, phase: 3.6 },
      { x: 610, y: 225, vx: 26, nombre: "Trucha serrana", emoji: "🐟", filter: "hue-rotate(305deg) saturate(1.25)", sx: 1.04, sy: 0.96, size: 27, phase: 4.8 },
      { x: 785, y: 170, vx: -22, nombre: "Carpa", emoji: "🐟", filter: "hue-rotate(155deg) saturate(1.45)", sx: 0.96, sy: 1.12, size: 32, phase: 5.5 },
      { x: 885, y: 145, vx: -26, nombre: "Pejerrey", emoji: "🐟", filter: "none", sx: 1.16, sy: 0.84, size: 29, phase: 6.2 },
    ],
    fishSpawnProgress: 0,
    trees: [
      // Fila superior del bosque (7 árboles frondosos)
      { x: 64, y: 450, emoji: "🌲", size: 54, estado: "sano", fireTimer: 0 },
      { x: 118, y: 445, emoji: "🌳", size: 58, estado: "sano", fireTimer: 0 },
      { x: 176, y: 452, emoji: "🌲", size: 54, estado: "sano", fireTimer: 0 },
      { x: 235, y: 446, emoji: "🌳", size: 58, estado: "sano", fireTimer: 0 },
      { x: 295, y: 452, emoji: "🌲", size: 54, estado: "sano", fireTimer: 0 },
      { x: 355, y: 445, emoji: "🌳", size: 58, estado: "sano", fireTimer: 0 },
      { x: 418, y: 450, emoji: "🌲", size: 54, estado: "sano", fireTimer: 0 },
      // Fila media con claros de césped entre arboledas (5 árboles)
      { x: 62, y: 514, emoji: "🌳", size: 56, estado: "sano", fireTimer: 0 },
      { x: 120, y: 510, emoji: "🌲", size: 54, estado: "sano", fireTimer: 0 },
      { x: 252, y: 512, emoji: "🌳", size: 58, estado: "sano", fireTimer: 0 },
      { x: 388, y: 510, emoji: "🌲", size: 54, estado: "sano", fireTimer: 0 },
      { x: 442, y: 516, emoji: "🌳", size: 56, estado: "sano", fireTimer: 0 },
      // Fila inferior con claros de pasto al frente (3 árboles)
      { x: 76, y: 576, emoji: "🌲", size: 56, estado: "sano", fireTimer: 0 },
      { x: 214, y: 574, emoji: "🌳", size: 58, estado: "sano", fireTimer: 0 },
      { x: 358, y: 576, emoji: "🌲", size: 56, estado: "sano", fireTimer: 0 },
    ],
    fireSpawnTimer: 9,
    forestTrash: [],
    forestSpawnTimer: 1.8,
  },
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
  currentView: "nature",
  natureMode: true,
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
const FRUIT_SLOTS = ["🍓", "🍉", "🍎"];
const VEGGIE_SLOTS = ["🥕", "🥦", "🍠"];
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
// En el Río y el Bosque solo aparecen residuos no-orgánicos habituales al aire libre
const BASURA_INORGANICA = BASURA.filter(
  (b) => b.tipo !== "organico" && !["⌨️", "💾", "🖨️", "🖱️", "💻"].includes(b.icon),
);
// Especies de agua dulce típicas de los diques de San Luis (Pejerrey, Trucha serrana y Carpa)
const FISH_SPECIES = [
  { nombre: "Pejerrey", emoji: "🐟", filter: "none", sx: 1.16, sy: 0.84, baseSize: 28 },
  { nombre: "Trucha serrana", emoji: "🐟", filter: "hue-rotate(305deg) saturate(1.25)", sx: 1.04, sy: 0.96, baseSize: 30 },
  { nombre: "Carpa", emoji: "🐟", filter: "hue-rotate(155deg) saturate(1.45)", sx: 0.96, sy: 1.12, baseSize: 33 },
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
  ctx.font = '700 14px "Outfit", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", Arial, sans-serif';
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
    ctx.font = '700 14px "Outfit", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", Arial, sans-serif';
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
  ["huevos", "s-huevos"],
  ["peces", "s-peces"],
  ["puntos", "s-puntos"],
].map(([key, id]) => [key, document.getElementById(id)]);

function stats() {
  for (const [key, element] of STAT_FIELDS)
    if (element) element.textContent = state[key] ?? 0;
  const seedsHTML = CROPS.map(
    (c) =>
      `<div class="seed-item"><span>${c.emoji} ${c.name}</span><span>x${state.seeds[c.name] || 0}</span></div>`,
  ).join("");
  const invEl = document.getElementById("seed-inventory");
  if (invEl) invEl.innerHTML = seedsHTML;
  const invModalEl = document.getElementById("seed-inventory-modal");
  if (invModalEl) invModalEl.innerHTML = seedsHTML;
}
function collectToTrashBag(item) {
  const copy = { icon: item.icon, tipo: item.tipo };
  if (!state.trash && state.trashBag.length === 0) {
    state.trash = copy;
    state.trashTimer = 0;
  } else {
    state.trashBag.push(copy);
  }
}
function nuevoResiduo() {
  if (state.trashBag.length > 0) {
    state.trash = state.trashBag.shift();
  } else {
    state.trash = null;
  }
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
  if (
    (window.innerHeight <= 600 || window.innerWidth <= 1024) &&
    document.documentElement.requestFullscreen &&
    !document.fullscreenElement
  ) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
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

function updateNature(dt) {
  const n = state.nature;
  const isLookingAtNature = state.currentView === "nature";

  // 1. Río: aparición y movimiento de residuos flotantes (solo inorgánicos)
  n.riverSpawnTimer -= dt;
  if (n.riverSpawnTimer <= 0 && n.riverTrash.length < 4) {
    const b = BASURA_INORGANICA[Math.floor(Math.random() * BASURA_INORGANICA.length)];
    n.riverTrash.push({
      icon: b.icon,
      tipo: b.tipo,
      x: W1.x + 42,
      y: W1.y + 135 + Math.random() * 75,
      vx: 22 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
    });
    n.riverSpawnTimer = 3.2 + Math.random() * 2.5;
  }

  for (let i = n.riverTrash.length - 1; i >= 0; i--) {
    const item = n.riverTrash[i];
    item.x += item.vx * dt;
    if (item.x > W1.x + W1.w - 42) {
      item.x = W1.x + 42;
      if (isLookingAtNature) {
        n.riverPurity = Math.max(10, n.riverPurity - 3);
      }
    }
  }

  if (n.riverTrash.length > 0) {
    n.riverPurity = Math.max(
      15,
      n.riverPurity - n.riverTrash.length * (isLookingAtNature ? 0.55 : 0.15) * dt,
    );
  } else {
    n.riverPurity = Math.min(100, n.riverPurity + 1.2 * dt);
  }

  // 2. Dique: nado de peces, balance de oxígeno y reproducción
  const minX = W2.x + 42,
    maxX = W2.x + W2.w - 42;
  n.fishes.forEach((f) => {
    f.x += f.vx * dt;
    if (f.x < minX) {
      f.x = minX;
      f.vx = Math.abs(f.vx);
    } else if (f.x > maxX) {
      f.x = maxX;
      f.vx = -Math.abs(f.vx);
    }
  });

  const targetOxygen = Math.min(
    100,
    Math.max(15, (n.fishes.length / 7) * 55 + (n.riverPurity / 100) * 45),
  );
  n.oxygen += (targetOxygen - n.oxygen) * Math.min(1, dt * 1.5);

  if (n.fishes.length < 10 && n.fishes.length >= 1) {
    const reproSpeed = n.riverPurity >= 65 ? 0.15 : n.riverPurity >= 40 ? 0.08 : 0.04;
    n.fishSpawnProgress += reproSpeed * dt;
    if (n.fishSpawnProgress >= 1) {
      n.fishSpawnProgress = 0;
      const dir = Math.random() < 0.5 ? 1 : -1;
      const sp = FISH_SPECIES[Math.floor(Math.random() * FISH_SPECIES.length)];
      n.fishes.push({
        x: W2.x + 65 + Math.random() * (W2.w - 130),
        y: W2.y + 125 + Math.random() * 105,
        vx: dir * (20 + Math.random() * 15),
        nombre: sp.nombre,
        emoji: sp.emoji,
        filter: sp.filter,
        sx: sp.sx,
        sy: sp.sy,
        size: sp.baseSize + Math.floor(Math.random() * 4) - 1,
        phase: Math.random() * Math.PI * 2,
      });
    }
  } else {
    n.fishSpawnProgress = 0;
  }

  // 3. Bosque: incendios (SOLO aparecen y avanzan cuando estás mirando Naturaleza) y residuos
  if (isLookingAtNature) {
    const burningCount = n.trees.filter((t) => t.estado === "fuego").length;
    const healthyTrees = n.trees.filter((t) => t.estado === "sano");
    n.fireSpawnTimer -= dt;
    if (n.fireSpawnTimer <= 0) {
      if (burningCount === 0 && healthyTrees.length > 0) {
        const chosen = healthyTrees[Math.floor(Math.random() * healthyTrees.length)];
        chosen.estado = "fuego";
        chosen.fireTimer = 14;
        decir("🔥 ¡Cuidado! Apareció un foco de incendio en el bosque. ¡Tocalo para apagarlo!", "#ffb040");
      }
      n.fireSpawnTimer = 11 + Math.random() * 6;
    }

    n.trees.forEach((t) => {
      if (t.estado === "fuego") {
        t.fireTimer -= dt;
        if (t.fireTimer <= 0) {
          t.estado = "quemado";
          t.fireTimer = 0;
          state.puntos = Math.max(0, state.puntos - 5);
          playSound("error");
          decir("🪵 Un árbol se quemó… Tocalo para replantarlo con Compost ♻️ o Humus 🪱.", "#ff6b6b");
          stats();
        }
      }
    });
  }

  // Claros de césped entre las arboledas (nunca encima de los árboles)
  const FOREST_SPOTS = [
    { x: 186, y: 520 },
    { x: 320, y: 520 },
    { x: 145, y: 584 },
    { x: 286, y: 584 },
    { x: 422, y: 584 },
  ];
  n.forestSpawnTimer -= dt;
  if (n.forestSpawnTimer <= 0 && n.forestTrash.length < 3) {
    const freeSpots = FOREST_SPOTS.filter(
      (sp) =>
        !n.forestTrash.some((ft) => Math.hypot(ft.x - sp.x, ft.y - sp.y) < 25) &&
        !n.trees.some((t) => Math.hypot(t.x - sp.x, t.y - sp.y) < 38),
    );
    if (freeSpots.length > 0) {
      const sp = freeSpots[Math.floor(Math.random() * freeSpots.length)];
      const b = BASURA_INORGANICA[Math.floor(Math.random() * BASURA_INORGANICA.length)];
      n.forestTrash.push({
        icon: b.icon,
        tipo: b.tipo,
        x: sp.x,
        y: sp.y,
      });
    }
    n.forestSpawnTimer = 4 + Math.random() * 3;
  }

  // 4. Polinizadores y Flores (en cuadrante N4 = W4)
  state.flowers.forEach((f) => {
    if (f.estado === "fruto") {
      f.timer -= dt;
      if (f.timer <= 0) f.estado = "cerrada";
    }
  });

  const pMinX = W4.x + 35,
    pMaxX = W4.x + W4.w - 35,
    pMinY = W4.y + 85,
    pMaxY = W4.y + W4.h - 40;

  state.pollinators.forEach((p) => {
    if (p.target !== null) {
      const f = state.flowers[p.target];
      if (!f || f.estado !== "cerrada") {
        p.target = null;
        return;
      }
      const tx = f.x,
        ty = f.y - 22;
      const dx = tx - p.x,
        dy = ty - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 16) {
        f.estado = "fruto";
        f.timer = 10;
        p.target = null;
        state.frutas += 1;
        state.puntos += 10;
        spawnParticles(f.x, f.y - 24, 8, [f.emoji, "🍎", "✨", "🐝"]);
        playSound("success");
        if (Math.random() < 0.45) {
          const rc = CROPS[Math.floor(Math.random() * CROPS.length)];
          state.seeds[rc.name] = (state.seeds[rc.name] || 0) + 1;
          decir(`🐝 ¡Flor polinizada! +1 🍎 Fruta y +1 semilla de ${rc.name} ${rc.emoji}`);
        } else {
          decir("🐝 ¡Flor polinizada! +1 🍎 Fruta silvestre para la Granja o el Taller.");
        }
        stats();
      } else {
        p.x += (dx / dist) * p.speed * 1.45 * dt;
        p.y += (dy / dist) * p.speed * 1.45 * dt;
      }
    } else {
      p.angle += (Math.random() - 0.5) * 1.4 * dt;
      p.x += Math.cos(p.angle) * p.speed * 0.45 * dt;
      p.y += Math.sin(p.angle) * p.speed * 0.45 * dt;
      if (p.x < pMinX) { p.x = pMinX; p.angle = Math.PI - p.angle; }
      if (p.x > pMaxX) { p.x = pMaxX; p.angle = Math.PI - p.angle; }
      if (p.y < pMinY) { p.y = pMinY; p.angle = -p.angle; }
      if (p.y > pMaxY) { p.y = pMaxY; p.angle = -p.angle; }
    }
  });
}

function update(dt) {
  if (!isPlaying || document.hidden) return;
  state.time += dt;

  for (let i = state.hints.length - 1; i >= 0; i--) {
    state.hints[i].life -= dt;
    state.hints[i].y -= 15 * dt;
    if (state.hints[i].life <= 0) state.hints.splice(i, 1);
  }

  updateNature(dt);

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
  huevo: { emoji: "🥚", basePrice: 20, label: "Huevos" },
  pescado: { emoji: "🐟", basePrice: 24, label: "Pescado" },
  mermelada: { emoji: "🍯", basePrice: 25, label: "Mermelada" },
  conserva: { emoji: "🥫", basePrice: 25, label: "Conserva" },
  harina: { emoji: "🥖", basePrice: 40, label: "Harina" },
  manualidad: { emoji: "🎨", basePrice: 20, label: "Manualidad" },
  humus: { emoji: "🪱", basePrice: 15, label: "Humus" },
};
const MARKET_ITEMS = [
  { key: "tejido", emoji: "🧣", label: "Tejidos" },
  { key: "huevo", emoji: "🥚", label: "Huevos" },
  { key: "pescado", emoji: "🐟", label: "Pescados" },
  { key: "mermelada", emoji: "🍯", label: "Mermeladas" },
  { key: "conserva", emoji: "🥫", label: "Conservas" },
  { key: "harina", emoji: "🥖", label: "Harina" },
  { key: "manualidad", emoji: "🎨", label: "Manualidades" },
  { key: "humus", emoji: "🪱", label: "Humus" },
];

function getInventory(type) {
  if (type === "tejido") return state.telar.tejido;
  if (type === "huevo") return state.huevos;
  if (type === "pescado") return state.peces;
  if (type === "mermelada") return state.conservas.mermelada;
  if (type === "conserva") return state.conservas.conserva;
  if (type === "harina") return state.harina;
  if (type === "manualidad") return state.creativo.manualidad;
  if (type === "humus") return state.humus;
  return 0;
}
function decInventory(type) {
  if (type === "tejido") state.telar.tejido--;
  if (type === "huevo") state.huevos--;
  if (type === "pescado") state.peces--;
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
  if (state.huevos > 0) availableProducts.push("huevo");
  if (state.peces > 0) availableProducts.push("pescado");
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

const naturePanelLeft = `
  <div class="info-card"><h3>🌊 El Río (Arriba izq.)</h3><p>El agua limpia da vida a todo el ecosistema. Tocá los <span class="highlight">residuos que flotan</span> para sacarlos del río.</p><p>Van a tu <span class="highlight">bolsa de clasificación 🎒</span> para que los separes en el <b>Reciclaje de la Granja</b>.</p></div>
  <div class="info-card"><h3>🌲 El Bosque (Abajo izq.)</h3><p>Tocá rápido los <span class="highlight">focos de incendio 🔥</span> para apagarlos con agua 💧. Si un árbol se quema, podés replantarlo con <b>Compost ♻️ o Humus 🪱</b>.</p><p>También juntá la basura del bosque para tu bolsa 🎒.</p></div>
`;
const naturePanelRight = `
  <div class="info-card"><h3>🐟 El Dique (Arriba der.)</h3><p>Tocá un pez para pescarlo (<span class="highlight">+1 🐟</span>) y venderlo en el <b>Mercado</b>.</p><p><b>¡Cuidá el balance!</b> Dejá siempre al menos <span class="highlight">3 peces</span> para mantener el oxígeno 🫧 y que puedan reproducirse.</p></div>
  <div class="info-card"><h3>🐝 Polinizadores (Abajo der.)</h3><p>Las abejas 🐝, mariposas 🦋 y escarabajos 🪲 polinizan las flores.</p><p>Tocalos para guiarlos hacia una flor y obtener <span class="highlight">frutas 🍎 y semillas 🌱</span>.</p></div>
`;
const farmPanelLeft = `
  <div class="info-card"><h3>🐑 El Corral</h3><p>Los animales grandes comen <span class="highlight">cereales y forraje</span> (maíz, trigo, hierbas). Los conejos comen <span class="highlight">verduras</span>. Si no les das, se ponen tristes.</p><p>También juntá su <span class="highlight">estiércol 💩</span> para el compost y esquilá ovejas/llamas para <span class="highlight">lana 🧶</span>.</p></div>
  <div class="info-card"><h3>♻️ Reciclaje</h3><p>Clasificá los residuos que juntaste en tu <span class="highlight">bolsa 🎒</span> en el río y el bosque.</p><p>Separar la basura <span class="highlight">limpia el río</span> y te da materiales para el <b>taller creativo</b>.</p></div>
`;
const farmPanelRight = `
  <div class="info-card"><h3>🌱 La Huerta Dividida</h3><p>Arriba: 🍎 Frutas y 🥕 Verduras (para conservas y conejos).<br>Abajo: 🌾 Cereales y Forraje (para animales y harina).</p><div class="seed-box seed-inventory-box"><h4>🌱 Tus semillas guardadas:</h4><div id="seed-inventory"></div></div></div>
  <div class="info-card"><h3>🪱 Lombrices</h3><p> Y alimentá a las lombrices con orgánicos para conseguir <span class="highlight">Humus</span>, que se vende en el mercado.</p></div>
`;
const workshopPanelLeft = `
  <div class="info-card"><h3>🧶 El Telar (Arriba izq.)</h3><p>La <span class="highlight">lana 🧶</span> de ovejas y llamas se <b>hila</b> y se <b>teje</b>.</p><p><b>Click en la rueda 🎡</b> (5 veces = 1 hilo) y después <b>2 hilos → 1 tejido</b>.</p><p>¡Cada paso agrega valor!</p></div>
  <div class="info-card"><h3>🎨 Reciclaje Creativo (Abajo izq.)</h3><p>El <span class="highlight">plástico, papel y vidrio</span> no son basura: con imaginación se transforman en algo nuevo.</p><p><b>3 materiales 📦 → 1 manualidad 🎨</b>.</p></div>
`;
const workshopPanelRight = `
  <div class="info-card"><h3>🍯 Procesados (Arriba der.)</h3><p>Las <span class="highlight">frutas</span> se hacen mermelada. Las <span class="highlight">verduras</span>, conserva. Los <span class="highlight">cereales</span> se muelen para hacer <b>harina 🥖</b>.</p><p><b>Recetas:</b> 3 frutas → 🍯 · 3 verduras → 🥫 · 2 cereales → 🥖</p></div>
  <div class="info-card"><h3>🏪 El Mercado (Abajo der.)</h3><p>Los clientes aparecen solos. ¡Vendé todo lo que produzcas!</p><div class="seed-box"><h4>🔁 El ciclo completo:</h4><p style="font-size: 13px; line-height: 1.5; margin: 0;">Naturaleza → Granja → Taller → Mercado → Monedas → Semillas</p></div></div>
`;

function switchView(view) {
  state.currentView = view;
  state.natureMode = view === "nature";
  state.workshopMode = view === "workshop";
  state.selectingSeedFor = null;
  state.hints = [];
  document.getElementById("shop-modal").style.display = "none";
  document
    .querySelectorAll(".view-tab")
    .forEach((t) => t.classList.toggle("active", t.dataset.view === view));
  const leftCards = document.getElementById("cards-left");
  const rightCards = document.getElementById("cards-right");

  if (view === "nature") {
    if (leftCards) leftCards.innerHTML = naturePanelLeft;
    if (rightCards) rightCards.innerHTML = naturePanelRight;
    state.mercado.customers = [];
    stats();
    decir("🏞️ ¡Cuidemos la naturaleza! Limpiá el río y el bosque, pescá con equilibrio y polinizá.");
  } else if (view === "workshop") {
    if (leftCards) leftCards.innerHTML = workshopPanelLeft;
    if (rightCards) rightCards.innerHTML = workshopPanelRight;
    state.mercado.customers = [];
    state.mercado.spawnTimer = 2;
    decir("¡Bienvenido al taller! Producí y vendé.", "#7ef0d0");
  } else {
    if (leftCards) leftCards.innerHTML = farmPanelLeft;
    if (rightCards) rightCards.innerHTML = farmPanelRight;
    if (!state.trash && state.trashBag.length > 0) nuevoResiduo();
    state.mercado.customers = [];
    stats();
    decir("🌱 ¡A cuidar la granja agroecológica!");
  }
  requestAnimationFrame(resizeCanvas);
}

function openShop() {
  renderShop();
  document.getElementById("shop-modal").style.display = "flex";
}
function openSeedsModal() {
  stats();
  const modal = document.getElementById("seeds-modal");
  if (modal) modal.style.display = "flex";
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
        
        // Cajita blanca redonda
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.beginPath();
        ctx.arc(centerX, wheelY, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Emoji adentro
        ctx.save();
        ctx.translate(centerX, wheelY); // 👈 Acá lo centramos en la cajita
        ctx.rotate(s.wheelAngle);
        emoji("🎡", 0, 0, 55); // Un poquito más chiquito para que no se salga
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
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            rrect(fx - 22, fy - 22, 44, 44, 8);
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.15)";
            ctx.lineWidth = 2;
            ctx.stroke();
      emoji(fe, fx, fy, 28);
     addClickable({ x: fx - 22, y: fy - 22, w: 44, h: 44 }, () => {
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
       ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            rrect(vx - 22, vy - 22, 44, 44, 8);
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.15)";
            ctx.lineWidth = 2;
            ctx.stroke();
      emoji(ve, vx, vy, 28);
      addClickable({ x: vx - 22, y: vy - 22, w: 44, h: 44 }, () => {
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
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            rrect(hx - 22, hy - 22, 44, 44, 8);
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.15)";
            ctx.lineWidth = 2;
            ctx.stroke();
      emoji(he, hx, hy, 28);
      addClickable({ x: hx - 22, y: hy - 22, w: 44, h: 44 }, () => {
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
          // 1. Dibujamos la cajita blanca (quieta)
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          rrect(mx - 40, slotY - 40, 80, 80, 12);
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.15)";
          ctx.lineWidth = 2;
          ctx.stroke();

          // 2. Calculamos la animación
          const bob = prefersReducedMotion ? 0 : Math.sin(state.time * 3 + i) * 3;
          const rot = prefersReducedMotion ? 0 : Math.sin(state.time + i) * 0.08;
          
          // 3. Dibujamos el emoji ADENTRO de la cajita, con su animación
          ctx.save();
          ctx.translate(mx, slotY + bob); // El emoji va al centro de la cajita (mx, slotY)
          ctx.rotate(rot);
          emoji(me, 0, 0, 45); // Un poquito más chiquito (45) para que no se salga
          ctx.restore();

          // 4. El área clickeable
          addClickable(
            { x: mx - 40, y: slotY - 40, w: 80, h: 80 },
            () => {
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
           }
          );
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
     // DINERO AL LADO DEL TÍTULO
    ctx.fillStyle = "#f0e68c"; 
    rrect(P.x + 170, P.y - 15, 80, 34, 17); 
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();
    texto(`🪙 ${state.monedas}`, P.x + 210, P.y + 9, 16, "#2b1e00", "center", "900");

    // 👇 CARTEL DE MEJORAR AL LADO DE LA MONEDA 👇
    if (!m.upgraded && state.monedas >= 50) {
      // Dibujamos un cartel verde al lado
      ctx.fillStyle = "#4caf50"; 
      rrect(P.x + 260, P.y - 15, 100, 34, 17); 
      ctx.fill();
      texto("⭐ ¡Mejorar!", P.x + 310, P.y + 9, 15, "#fff", "center", "900");
      
      // Hacemos que se pueda clickear
      addClickable(
        { x: P.x + 260, y: P.y - 15, w: 100, h: 34 },
        () => {
          state.monedas -= 50;
          m.upgraded = true;
          decir("¡Mercado mejorado! Precios x2.", "#f0e68c");
          playSound("success");
          stats();
        }
      );
    }
    // 👆 FIN DEL CARTEL 👆
  const rank = getRank();
  ctx.fillStyle = "#fff";
  rrect(P.x + P.w - 140, P.y + 46, 120, 42, 8);
  ctx.fill();
  texto(`${rank.icon} ${rank.name}`, P.x + P.w - 80, P.y + 64, 14, "#2b2b3d", "center", "700");
  texto(`${m.totalSold} ventas`, P.x + P.w - 80, P.y + 80, 12, "#2b2b3d", "center", "700");

        // 1. Título del inventario (Más ancho y con más espacio)
        ctx.fillStyle = "#fff";
        rrect(P.x + 20, P.y + 44, 140, 24, 8); 
        ctx.fill();
        texto("📦 Inventario", P.x + 90, P.y + 61, 15, "#2b2b3d", "center", "800");

        // 2. Los ítems de adentro (8 productos incluyendo Pescados y Huevos)
        let iy = P.y + 83;
        MARKET_ITEMS.forEach((item) => {
          const count = getInventory(item.key);
          ctx.fillStyle = "rgba(255,255,255,0.95)";
          rrect(P.x + 20, iy - 11, 190, 22, 7); 
          ctx.fill();
          
          emoji(item.emoji, P.x + 38, iy, 18);
          texto(item.label, P.x + 55, iy + 5, 14, "#2b2b3d", "left", "700"); 
          texto(`x${count}`, P.x + 195, iy + 5, 14, count > 0 ? "#2e7d32" : "#888", "right", "700"); 
          
          iy += 24.5;
        });


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
const NATURE_PATTERN = createCheckerPattern(["#5eb54e", "#68c258"]);
const FARM_PATTERN = createCheckerPattern(["#74bd48", "#7ec850"]);
const WORKSHOP_PATTERN = createCheckerPattern(["#4AACC4", "#354393"]);
function paintChecker(pattern) {
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, W, H);
}
function grass() {
  paintChecker(FARM_PATTERN);
}

function getTrashBagCount() {
  return state.trashBag.length + (state.trash ? 1 : 0);
}

function renderRio() {
  const P = W1,
    n = state.nature;
  drawPanel(P, "El Río", "🌊");

  const purity = Math.round(n.riverPurity);
  const pColor = purity >= 70 ? "#29b6f6" : purity >= 40 ? "#ffb300" : "#e53935";

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  rrect(P.x + 14, P.y + 42, 276, 38, 10);
  ctx.fill();
  texto(`💧 Pureza del agua: ${purity}%`, P.x + 24, P.y + 58, 13, "#2b2b3d", "left", "900");
  barra(P.x + 24, P.y + 65, 256, 9, n.riverPurity / 100, pColor);

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  rrect(P.x + 300, P.y + 42, 156, 38, 10);
  ctx.fill();
  texto(`🎒 Bolsa: ${getTrashBagCount()}`, P.x + 378, P.y + 66, 14, "#2e7d32", "center", "900");

  // Orillas y cauce del río
  const rx = P.x + 14,
    ry = P.y + 90,
    rw = P.w - 28,
    rh = 172;
  ctx.fillStyle = "#558b2f";
  rrect(rx, ry, rw, rh, 14);
  ctx.fill();

  const waterColor =
    purity >= 70
      ? "#29b6f6"
      : purity >= 45
        ? "#26a69a"
        : "#7e784f";
  ctx.fillStyle = waterColor;
  rrect(rx, ry + 18, rw, rh - 36, 10);
  ctx.fill();

  // Piedras y vegetación decorativa en las orillas del río
  const bankDeco = [
    { e: "🪨", x: rx + 26, y: ry + 11, s: 17 },
    { e: "🌿", x: rx + 85, y: ry + 10, s: 16 },
    { e: "🪨", x: rx + 165, y: ry + 12, s: 15 },
    { e: "🪨", x: rx + 275, y: ry + 11, s: 18 },
    { e: "🌿", x: rx + 355, y: ry + 10, s: 16 },
    { e: "🪨", x: rx + 415, y: ry + 11, s: 16 },
    { e: "🌿", x: rx + 45, y: ry + rh - 8, s: 16 },
    { e: "🪨", x: rx + 125, y: ry + rh - 8, s: 18 },
    { e: "🪨", x: rx + 230, y: ry + rh - 7, s: 15 },
    { e: "🌿", x: rx + 315, y: ry + rh - 8, s: 16 },
    { e: "🪨", x: rx + 395, y: ry + rh - 8, s: 17 },
  ];
  bankDeco.forEach((d) => emoji(d.e, d.x, d.y, d.s));

  // Piedras decorativas dentro del cauce con espuma de agua
  const riverRocks = [
    { x: rx + 78, y: ry + 52, s: 24 },
    { x: rx + 235, y: ry + 122, s: 27 },
    { x: rx + 372, y: ry + 64, s: 23 },
  ];
  riverRocks.forEach((rk) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(rk.x + 3, rk.y + 3, rk.s * 0.65, rk.s * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
    emoji("🪨", rk.x, rk.y, rk.s);
  });

  // Olas animadas de la corriente
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 2;
  for (let row = 0; row < 3; row++) {
    const wy = ry + 45 + row * 40;
    const offset = ((state.time * 35 + row * 50) % 90) - 45;
    for (let col = 0; col < 5; col++) {
      const wx = rx + 25 + col * 85 + offset;
      if (wx > rx + 10 && wx + 40 < rx + rw - 10) {
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.quadraticCurveTo(wx + 10, wy - 5, wx + 20, wy);
        ctx.quadraticCurveTo(wx + 30, wy + 5, wx + 40, wy);
        ctx.stroke();
      }
    }
  }

  // Pececitos de fondo si el río está limpio
  if (purity >= 65) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    const fx1 = rx + 60 + ((state.time * 28) % (rw - 120));
    const fx2 = rx + rw - 60 - ((state.time * 22) % (rw - 120));
    emoji("🐟", fx1, ry + 65, 17);
    emoji("🐟", fx2, ry + 115, 15);
    ctx.restore();
  }

  // Residuos flotando en el río (proporcionados al cauce)
  n.riverTrash.forEach((item, idx) => {
    const bob = prefersReducedMotion ? 0 : Math.sin(state.time * 3.5 + item.phase) * 3.5;
    const iy = item.y + bob;

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(item.x, iy, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e53935";
    ctx.lineWidth = 2;
    ctx.stroke();

    emoji(item.icon, item.x, iy, 19);

    addClickable({ x: item.x - 24, y: iy - 24, w: 48, h: 48 }, () => {
      collectToTrashBag(item);
      n.riverTrash.splice(idx, 1);
      n.riverPurity = Math.min(100, n.riverPurity + 10);
      state.puntos += 5;
      if (n.riverPurity >= 95) unlockAchievement("river_clean");
      playSound("water");
      spawnParticles(item.x, iy, 6, ["💧", "🎒", "✨"]);
      decir(`🌊 ¡Sacaste ${item.icon} del río! Guardado en tu 🎒 bolsa para reciclar en la Granja.`);
      stats();
    });
  });

  if (n.riverTrash.length === 0) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    rrect(P.x + P.w / 2 - 135, ry + rh / 2 - 16, 270, 32, 10);
    ctx.fill();
    texto("✨ ¡El río está limpio y cristalino!", P.x + P.w / 2, ry + rh / 2 + 5, 14, "#0277bd", "center", "900");
  }

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  rrect(P.x + 14, P.y + P.h - 38, P.w - 28, 26, 8);
  ctx.fill();
  texto(
    "Tocá los residuos del agua para guardarlos en la 🎒 bolsa de clasificación",
    P.x + P.w / 2,
    P.y + P.h - 20,
    12,
    "#2b2b3d",
    "center",
    "800",
  );
}

function renderDique() {
  const P = W2,
    n = state.nature;
  drawPanel(P, "El Dique", "🐟");

  const ox = Math.round(n.oxygen);
  const oxColor = ox >= 65 ? "#29b6f6" : ox >= 40 ? "#ffb300" : "#e53935";
  const count = n.fishes.length;
  const canFish = count > 3;

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  rrect(P.x + 14, P.y + 42, 246, 38, 10);
  ctx.fill();
  texto(`🫧 Oxígeno: ${ox}%`, P.x + 24, P.y + 58, 13, "#2b2b3d", "left", "900");
  barra(P.x + 24, P.y + 65, 226, 9, n.oxygen / 100, oxColor);

  ctx.fillStyle = canFish ? "rgba(255,255,255,0.95)" : "#fff3e0";
  rrect(P.x + 270, P.y + 42, 186, 38, 10);
  ctx.fill();
  texto(
    `🐟 Cardumen: ${count}/10`,
    P.x + 363,
    P.y + 66,
    14,
    canFish ? "#0277bd" : "#e65100",
    "center",
    "900",
  );

  // Espejo de agua del dique con costa natural (sin la barra gris extraña)
  const dx = P.x + 14,
    dy = P.y + 90,
    dw = P.w - 28,
    dh = 172;
  // Borde de costa natural de tierra y piedras
  ctx.fillStyle = "#8d6e63";
  rrect(dx, dy, dw, dh, 18);
  ctx.fill();

  // Orilla de agua baja turquesa
  ctx.fillStyle = ox >= 50 ? "#29b6f6" : "#546e7a";
  rrect(dx + 6, dy + 6, dw - 12, dh - 12, 14);
  ctx.fill();

  // Agua profunda en el centro del dique
  ctx.fillStyle = ox >= 50 ? "#0288d1" : "#455a64";
  rrect(dx + 14, dy + 14, dw - 28, dh - 28, 12);
  ctx.fill();

  // Piedras y juncos decorativos en el contorno del dique
  const shoreDeco = [
    { e: "🪨", x: dx + 18, y: dy + 14, s: 17 },
    { e: "🌿", x: dx + 42, y: dy + 12, s: 16 },
    { e: "🪨", x: dx + dw - 20, y: dy + 14, s: 18 },
    { e: "🌿", x: dx + dw - 44, y: dy + 12, s: 16 },
    { e: "🌿", x: dx + 20, y: dy + dh - 10, s: 16 },
    { e: "🪨", x: dx + 44, y: dy + dh - 10, s: 17 },
    { e: "🪨", x: dx + dw - 22, y: dy + dh - 10, s: 17 },
    { e: "🌿", x: dx + dw - 46, y: dy + dh - 10, s: 16 },
  ];
  shoreDeco.forEach((d) => emoji(d.e, d.x, d.y, d.s));

  // Burbujas de oxígeno
  if (ox >= 45) {
    for (let b = 0; b < 4; b++) {
      const bx = dx + 65 + b * 95;
      const by = dy + dh - 22 - (((state.time * 25 + b * 35) % (dh - 44)));
      emoji("🫧", bx, by, 15);
    }
  }

  // Peces de agua dulce de San Luis (Pejerrey, Trucha serrana y Carpa)
  n.fishes.forEach((f, idx) => {
    const bob = prefersReducedMotion ? 0 : Math.sin(state.time * 4 + f.phase) * 3.5;
    const fy = f.y + bob;
    const fSize = f.size || 29;
    const dirScale = f.vx > 0 ? -1 : 1;

    ctx.save();
    ctx.translate(f.x, fy);
    ctx.scale(dirScale * (f.sx || 1), f.sy || 1);
    if (f.filter && f.filter !== "none") ctx.filter = f.filter;
    emoji(f.emoji, 0, 0, fSize);
    ctx.restore();

    addClickable({ x: f.x - 25, y: fy - 22, w: 50, h: 44 }, () => {
      if (n.fishes.length <= 3) {
        showHint(f.x, fy, "⚠️ ¡Dejá al menos 3 peces para cuidar el oxígeno!");
        decir(
          "⚠️ ¡Cuidemos el equilibrio del dique! Esperá a que se reproduzcan antes de pescar más.",
          "#ffb040",
        );
        return;
      }
      const spName = f.nombre || "Pez";
      n.fishes.splice(idx, 1);
      state.peces += 1;
      state.puntos += 10;
      n.oxygen = Math.max(25, n.oxygen - 10);
      unlockAchievement("first_fish");
      playSound("water");
      spawnParticles(f.x, fy, 7, ["🐟", "💧", "✨"]);
      decir(
        `🎣 ¡Pescaste 1 ${spName}! (+1 🐟 para el Mercado). Quedan ${n.fishes.length} en el dique.`,
      );
      stats();
    });
  });

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  rrect(P.x + 14, P.y + P.h - 38, P.w - 28, 26, 8);
  ctx.fill();
  const footerMsg =
    count <= 3
      ? `⚠️ Población mínima (3): reproduciéndose (${Math.round(n.fishSpawnProgress * 100)}%)`
      : count < 10
        ? `Pejerrey, Trucha y Carpa (+1🐟) · Reproducción: ${Math.round(n.fishSpawnProgress * 100)}%`
        : "Tocá un pez (Pejerrey, Trucha o Carpa) para pescar cuidando el equilibrio";
  texto(
    footerMsg,
    P.x + P.w / 2,
    P.y + P.h - 20,
    12,
    count <= 3 ? "#e65100" : "#2b2b3d",
    "center",
    "800",
  );
}

function renderBosque() {
  const P = W3,
    n = state.nature;
  drawPanel(P, "El Bosque Nativo", "🌲");

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  rrect(P.x + 14, P.y + 42, P.w - 28, 26, 8);
  ctx.fill();
  texto(
    "🔥 Apagá incendios, limpiá el césped y conocé la fauna autóctona de San Luis",
    P.x + P.w / 2,
    P.y + 59,
    11.5,
    "#2b2b3d",
    "center",
    "800",
  );

  // Suelo del bosque con césped y claros naturales
  const fx = P.x + 14,
    fy = P.y + 74,
    fw = P.w - 28,
    fh = 192;
  ctx.fillStyle = "rgba(46, 125, 50, 0.42)";
  rrect(fx, fy, fw, fh, 14);
  ctx.fill();

  // Claros de césped más claros en el suelo donde puede caer basura
  ctx.fillStyle = "rgba(129, 199, 132, 0.35)";
  [
    { x: 186, y: 520, rx: 32, ry: 15 },
    { x: 320, y: 520, rx: 32, ry: 15 },
    { x: 145, y: 584, rx: 34, ry: 15 },
    { x: 286, y: 584, rx: 34, ry: 15 },
    { x: 422, y: 584, rx: 30, ry: 15 },
  ].forEach((cl) => {
    ctx.beginPath();
    ctx.ellipse(cl.x, cl.y, cl.rx, cl.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Sotobosque abundante: plantas nativas, pastizales, helechos y hongos
  const forestPlants = [
    { e: "🌿", x: 48, y: 480, s: 17 },
    { e: "🌾", x: 92, y: 476, s: 16 },
    { e: "🌱", x: 148, y: 468, s: 15 },
    { e: "🌿", x: 206, y: 474, s: 17 },
    { e: "🌾", x: 268, y: 472, s: 16 },
    { e: "🌿", x: 326, y: 474, s: 17 },
    { e: "🌱", x: 386, y: 476, s: 15 },
    { e: "🌿", x: 448, y: 482, s: 17 },
    { e: "🍄", x: 88, y: 538, s: 14 },
    { e: "🌿", x: 222, y: 536, s: 17 },
    { e: "🌾", x: 284, y: 540, s: 16 },
    { e: "🍄", x: 416, y: 544, s: 14 },
    { e: "🌿", x: 48, y: 598, s: 18 },
    { e: "🌾", x: 112, y: 596, s: 16 },
    { e: "🌿", x: 180, y: 598, s: 17 },
    { e: "🌱", x: 250, y: 598, s: 16 },
    { e: "🌿", x: 324, y: 596, s: 17 },
    { e: "🌾", x: 392, y: 598, s: 16 },
  ];
  forestPlants.forEach((d) => emoji(d.e, d.x, d.y, d.s));

  // Árboles grandes y frondosos del bosque (15 árboles)
  n.trees.forEach((t) => {
    const tSize = t.size || 56;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(t.x, t.y + 23, 25, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    if (t.estado === "sano") {
      emoji(t.emoji, t.x, t.y, tSize);
    } else if (t.estado === "fuego") {
      const pulse = 0.55 + 0.35 * Math.sin(state.time * 8);
      ctx.fillStyle = `rgba(255, 87, 34, ${pulse})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 32, 0, Math.PI * 2);
      ctx.fill();

      emoji(t.emoji, t.x, t.y, tSize - 2);
      const flameBob = prefersReducedMotion ? 0 : Math.sin(state.time * 14) * 3;
      emoji("🔥", t.x + 4, t.y + 4 + flameBob, 34);

      barra(t.x - 28, t.y - 36, 56, 6, t.fireTimer / 14, "#ff3d00");

      ctx.fillStyle = "#0288d1";
      rrect(t.x - 34, t.y + 18, 68, 18, 6);
      ctx.fill();
      texto("💧 ¡Apagar!", t.x, t.y + 31, 10.5, "#fff", "center", "900");

      addClickable({ x: t.x - 38, y: t.y - 38, w: 76, h: 76 }, () => {
        t.estado = "sano";
        t.fireTimer = 0;
        state.puntos += 12;
        unlockAchievement("fire_hero");
        playSound("water");
        spawnParticles(t.x, t.y, 8, ["💧", "✨", "🌲"]);
        decir("🚒 ¡Apagaste el foco de incendio a tiempo! Salvaste el árbol y el hogar de Kimün.");
        stats();
      });
    } else if (t.estado === "quemado") {
      emoji("🪵", t.x, t.y + 6, 36);
      ctx.fillStyle = state.compost > 0 || state.humus > 0 ? "#4caf50" : "#757575";
      rrect(t.x - 38, t.y + 18, 76, 18, 6);
      ctx.fill();
      texto("🌱 Replantar", t.x, t.y + 31, 10.5, "#fff", "center", "900");

      addClickable({ x: t.x - 38, y: t.y - 26, w: 76, h: 68 }, () => {
        if (state.compost > 0 || state.humus > 0) {
          if (state.compost > 0) state.compost--;
          else state.humus--;
          t.estado = "sano";
          state.puntos += 10;
          playSound("success");
          spawnParticles(t.x, t.y, 7, ["🌱", "🌲", "✨"]);
          decir("🌱 ¡Replantaste un árbol nativo usando abono de la Granja!");
          stats();
        } else {
          showHint(t.x, t.y, "Necesitás 1 Compost ♻️ o Humus 🪱");
        }
      });
    }
  });

  // Fauna autóctona de San Luis (hábitat natural de Kimün)
  const faunaSanLuis = [
    {
      emoji: "🦌",
      nombre: "Venado de las Pampas",
      x: 154,
      y: 486,
      size: 25,
      phase: 0.5,
      msg: "🦌 Venado de las Pampas: Monumento Natural de San Luis que habita nuestros pastizales y montes.",
    },
    {
      emoji: "🦉",
      nombre: "Lechucita serrana",
      x: 235,
      y: 428,
      size: 21,
      phase: 1.8,
      msg: "🦉 Lechucita serrana: ¡Familia de Kimün! Vigila el bosque nativo desde las copas.",
    },
    {
      emoji: "🦊",
      nombre: "Zorro gris serrano",
      x: 348,
      y: 544,
      size: 23,
      phase: 3.1,
      msg: "🦊 Zorro gris serrano: Habitante autóctono muy curioso de los montes y sierras de San Luis.",
    },
    {
      emoji: "🐢",
      nombre: "Tortuga terrestre",
      x: 108,
      y: 552,
      size: 21,
      phase: 4.4,
      msg: "🐢 Tortuga terrestre argentina: Especie autóctona de nuestro monte que debemos proteger.",
    },
  ];
  faunaSanLuis.forEach((an) => {
    const bob = prefersReducedMotion ? 0 : Math.sin(state.time * 2.6 + an.phase) * 1.8;
    emoji(an.emoji, an.x, an.y + bob, an.size);
    addClickable({ x: an.x - 16, y: an.y - 16, w: 32, h: 32 }, () => {
      playSound("pop");
      spawnParticles(an.x, an.y, 4, ["✨", "🍃", an.emoji]);
      showHint(an.x, an.y - 12, `${an.emoji} ${an.nombre}`);
      decir(an.msg);
    });
  });

  // Residuos tirados en los claros de césped (pequeños y proporcionados respecto a los árboles)
  n.forestTrash.forEach((ft, idx) => {
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.beginPath();
    ctx.arc(ft.x, ft.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e53935";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    emoji(ft.icon, ft.x, ft.y, 17);

    addClickable({ x: ft.x - 19, y: ft.y - 19, w: 38, h: 38 }, () => {
      collectToTrashBag(ft);
      n.forestTrash.splice(idx, 1);
      state.puntos += 5;
      playSound("pop");
      spawnParticles(ft.x, ft.y, 6, ["🎒", "🍃", "✨"]);
      decir(`🌲 ¡Levantaste ${ft.icon} del césped! Guardado en tu 🎒 bolsa de reciclaje.`);
      stats();
    });
  });

  const healthyCount = n.trees.filter((t) => t.estado === "sano").length;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  rrect(P.x + 14, P.y + P.h - 38, P.w - 28, 26, 8);
  ctx.fill();
  texto(
    `🌲 Árboles sanos: ${healthyCount}/${n.trees.length}  ·  🦌 Fauna protegida  ·  🎒 Bolsa: ${getTrashBagCount()}`,
    P.x + P.w / 2,
    P.y + P.h - 20,
    12,
    "#2b2b3d",
    "center",
    "800",
  );
}

function renderNature() {
  stationButtons.length = 0;
  clickableAreas.length = 0;
  paintChecker(NATURE_PATTERN);
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  ctx.fillRect(0, 0, W, H);

  renderRio();
  renderDique();
  renderBosque();
  renderPolinizadores();
}

function renderCorral() {
  drawPanel(P1, "Corral", "🐑");
  state.animals.forEach((a, i) => {
    const r = animalRect(i);
    const shakeX =
      a.shake > 0 && !prefersReducedMotion
        ? Math.sin(state.time * 40) * 4
        : 0;
    const bob = prefersReducedMotion
      ? 0
      : Math.sin(state.time * 2 + a.bobOffset) * 2;
    ctx.fillStyle = "#f5ebd6";
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
              ? a.type === "conejo"
                ? "🥕"
                : "🌾"
              : a.water < 40
                ? "💧"
                : a.clean < 40
                  ? "🧼"
                  : a.wool && lowest >= 90
                    ? (a.type === "gallina" ? "🥚" : "✂️")
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


  texto("🌾 Cereales y Forraje", P2.x + 16, P2.y + 270, 15, "#2b2b3d", "left", "900");

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
  const totalBag = getTrashBagCount();
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  rrect(P3_rec.x + P3_rec.w - 155, P3_rec.y - 15, 140, 34, 17);
  ctx.fill();
  texto(
    `🎒 Bolsa: ${totalBag}`,
    P3_rec.x + P3_rec.w - 85,
    P3_rec.y + 8,
    14,
    totalBag > 0 ? "#2e7d32" : "#757575",
    "center",
    "900",
  );

  if (state.trash) {
    texto(
      "Tocá el tacho correcto para clasificar:",
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
  } else if (state.trashBag.length > 0) {
    texto(
      "¡Excelente! Sacando próximo residuo de la bolsa...",
      P3_rec.x + P3_rec.w / 2, P3_rec.y + 152,
      14, "#2b2b3d", "center", "900",
    );
  } else {
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    rrect(P3_rec.x + 24, P3_rec.y + 62, P3_rec.w - 48, 66, 12);
    ctx.fill();
    texto(
      "🎒 ¡Tu bolsa de clasificación está vacía!",
      P3_rec.x + P3_rec.w / 2, P3_rec.y + 89,
      14, "#2e7d32", "center", "900",
    );
    texto(
      "Juntá más residuos en el Río 🌊 o el Bosque 🌲 (🏞️ Naturaleza)",
      P3_rec.x + P3_rec.w / 2, P3_rec.y + 112,
      12.5, "#2b2b3d", "center", "800",
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

function assignPollinatorToFlower(pollinator, preferredFlowerIdx = null) {
  const closedIndices = state.flowers
    .map((f, idx) => (f.estado === "cerrada" ? idx : -1))
    .filter((idx) => idx !== -1);
  if (closedIndices.length === 0) {
    showHint(pollinator.x, pollinator.y, "¡Todas las flores ya están polinizadas! 🌸");
    return;
  }
  const targetIdx =
    preferredFlowerIdx !== null && state.flowers[preferredFlowerIdx].estado === "cerrada"
      ? preferredFlowerIdx
      : closedIndices[Math.floor(Math.random() * closedIndices.length)];
  pollinator.target = targetIdx;
  playSound("buzz");
  spawnParticles(pollinator.x, pollinator.y, 4, ["✨", pollinator.emoji]);
  decir(`${pollinator.emoji} ¡Volando a polinizar la flor!`);
}

function renderPolinizadores() {
  const P = W4;
  drawPanel(P, "Polinizadores", "🐝");
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  rrect(P.x + 14, P.y + 42, P.w - 28, 26, 8);
  ctx.fill();
  texto(
    "Tocá a los insectos (🐝 🦋 🪲) o a las flores para polinizar",
    P.x + P.w / 2,
    P.y + 59,
    12,
    "#2b2b3d",
    "center",
    "800",
  );

  // Pradera de flores
  ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
  rrect(P.x + 14, P.y + 74, P.w - 28, 192, 14);
  ctx.fill();

  state.flowers.forEach((f, idx) => {
    ctx.fillStyle = "#6d451f";
    ctx.beginPath();
    ctx.ellipse(f.x, f.y, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (f.estado === "cerrada") {
      emoji("🌱", f.x, f.y - 18, 28);
      addClickable({ x: f.x - 26, y: f.y - 42, w: 52, h: 50 }, () => {
        const freePol =
          state.pollinators.find((p) => p.target === null) || state.pollinators[0];
        assignPollinatorToFlower(freePol, idx);
      });
    } else {
      emoji(f.emoji, f.x, f.y - 22, 34);
      emoji("🍎", f.x + 15, f.y - 34, 20);
      addClickable({ x: f.x - 26, y: f.y - 44, w: 52, h: 52 }, () => {
        f.estado = "cerrada";
        f.timer = 0;
        state.frutas += 1;
        state.puntos += 5;
        playSound("pop");
        spawnParticles(f.x, f.y - 22, 6, ["🍎", "✨", f.emoji]);
        decir("🍎 ¡Cosechaste un fruto silvestre de la flor polinizada!");
        stats();
      });
    }
  });

  state.pollinators.forEach((p) => {
    if (p.target !== null && state.flowers[p.target]) {
      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(state.flowers[p.target].x, state.flowers[p.target].y - 22);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const bobY = prefersReducedMotion ? 0 : Math.sin(state.time * 8 + p.angle) * 3;
    ctx.save();
    ctx.translate(p.x, p.y + bobY);
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    emoji(p.emoji, 0, 0, 30);
    ctx.restore();

    addClickable({ x: p.x - 26, y: p.y - 26, w: 52, h: 52 }, () => {
      assignPollinatorToFlower(p);
    });
  });

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  rrect(P.x + 14, P.y + P.h - 38, P.w - 28, 26, 8);
  ctx.fill();
  texto(
    "🌺 Cada flor polinizada produce +1 🍎 Fruta y puede darte semillas 🌱",
    P.x + P.w / 2,
    P.y + P.h - 20,
    12,
    "#2b2b3d",
    "center",
    "800",
  );
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
    W / 2, menuY + 42, W < 600 ? 19 : 22, getTextColor(), "center", "900",
  );
  texto(
    isBottomRow
      ? "🌾 Para alimentar animales del corral y moler harina"
      : "🍎 Para hacer mermeladas, conservas y alimentar conejos",
    W / 2, menuY + 68, W < 600 ? 12 : 13,
    isLightTheme ? "#4a4a5a" : "#ccc", "center", "700",
  );

  const semillasFiltradas = CROPS.filter((crop) => {
    const isCerealType = crop.type === "cereal" || crop.type === "forraje";
    return isBottomRow === isCerealType;
  });

  const cols = semillasFiltradas.length <= 3 ? semillasFiltradas.length : 4;
  const btnW = W < 600 ? 105 : 122,
    btnH = W < 600 ? 100 : 104,
    gapX = W < 600 ? 10 : 14,
    gapY = W < 600 ? 14 : 16;
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

  ctx.setTransform(canvasScaleX, 0, 0, canvasScaleY, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (isPlaying) {
    if (state.natureMode) {
      renderNature();
    } else if (state.workshopMode) {
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
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", resizeCanvas);
}
if (typeof ResizeObserver !== "undefined") {
  const ro = new ResizeObserver(() => resizeCanvas());
  ro.observe(canvas);
  if (canvas.parentElement) ro.observe(canvas.parentElement);
}
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
  if (state.natureMode || state.workshopMode) {
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
          const isHen = a.type === "gallina";
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
          if (a.type === "gallina") {
            state.huevos = (state.huevos || 0) + 1;
            state.puntos += 15;
            a.woolTimer = 30;
            spawnParticles(r.x + 45, r.y + 50, 8, ["🥚", "✨", "🌟"]);
            decir(`¡Juntaste un huevo fresco! +1 Huevo 🥚`);
          } else {
            state.lana += 1;
            state.puntos += 15;
            a.woolTimer = 45;
            spawnParticles(r.x + 45, r.y + 50, 8, ["🧶", "✨", "🌟"]);
            decir(`¡Esquilaste a ${a.nombre}! +1 Lana 🧶`);
          }
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
          state.nature.riverPurity = Math.min(100, state.nature.riverPurity + 4);
          if (state.trash.tipo === "organico") {
            addWormFood(25);
            decir("✅ ¡Correcto! A la lombricompostera y ayudás a cuidar el río 🌊.");
          } else {
            state.materialReciclado += 1;
            if (Math.random() < 0.3) {
              const rc = CROPS[Math.floor(Math.random() * CROPS.length)];
              state.seeds[rc.name]++;
              decir(`✅ ¡Correcto! +1 Material y semilla de ${rc.name} ${rc.emoji}`);
            } else decir("✅ ¡Correcto! +1 Material reciclado y río más limpio 🌊.");
          }
          spawnParticles(r.x + r.w / 2, r.y + 40, 8, ["✨", "⭐", "🌟"]);
          playSound("success");
          state.trash = null;
          state.trashTimer = 0.7;
          stats();
        } else {
          if (!state.binShake) state.binShake = [0, 0, 0, 0, 0];
          state.binShake[i] = 0.5;
          showHint(r.x + r.w / 2, r.y + r.h / 2, `Casi… el ${state.trash.icon} no va en ${b.nombre}`);
        }
      }
    });
  }

  if (!interacted) playSound("pop");
});

// Inicializamos la bolsa con 2 residuos inorgánicos para clasificar
collectToTrashBag(BASURA_INORGANICA[Math.floor(Math.random() * BASURA_INORGANICA.length)]);
collectToTrashBag(BASURA_INORGANICA[Math.floor(Math.random() * BASURA_INORGANICA.length)]);
stats();
resizeCanvas();
requestAnimationFrame(loop);
switchView("nature");
