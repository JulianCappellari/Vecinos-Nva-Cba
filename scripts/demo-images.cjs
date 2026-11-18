// Genera ilustraciones SVG ficticias para el sitio de muestra: public/demo/**
// Uso: node scripts/demo-images.cjs
const fs = require("node:fs");
const path = require("node:path");

const OUT = path.join(__dirname, "..", "public", "demo");

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, list) => list[Math.floor(r() * list.length)];
const GRADIENTS = [
  ["#062b4b", "#069af1"], ["#0061a7", "#78cdff"], ["#ffc93c", "#ff8a4c"], ["#7c6bd6", "#38b6ff"],
  ["#2da56a", "#b8e3ff"], ["#ef6f5e", "#ffc93c"], ["#084572", "#2da56a"], ["#02528a", "#ffc93c"],
];
const SKIN = ["#f5cfa8", "#e0a97d", "#c68642", "#8d5524", "#f1c9a5", "#d9a066"];
const HAIR = ["#2b1b12", "#5a3825", "#a0522d", "#d6a94a", "#1c1c1c", "#7a7a7a", "#b5472f"];
const SHIRT = ["#062b4b", "#069af1", "#ffc93c", "#ef6f5e", "#2da56a", "#7c6bd6", "#ffffff"];

const tag = (w, h) =>
  `<text x="${w - 18}" y="28" text-anchor="end" font-family="Arial, sans-serif" font-size="15" fill="#fff" fill-opacity=".65">Imagen de muestra</text>`;
const wrap = (w, h, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Imagen de muestra">${defs}${body}${tag(w, h)}</svg>\n`;
const grad = (id, a, b, vertical = true) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

const MOTIFS = {
  mountains: (c) => `<path d="M60 460 L260 180 L360 320 L470 220 L740 460 Z" fill="#fff" fill-opacity=".85"/><path d="M260 180 L300 240 L260 230 L225 245 Z" fill="${c}"/><circle cx="600" cy="150" r="46" fill="#ffc93c"/>`,
  book: (c) => `<path d="M400 190 Q300 150 170 180 V430 Q300 400 400 440 Z" fill="#fff"/><path d="M400 190 Q500 150 630 180 V430 Q500 400 400 440 Z" fill="#fff" fill-opacity=".85"/><path d="M215 235 Q300 215 360 240 M215 285 Q300 265 360 290 M440 240 Q500 215 585 235 M440 290 Q500 265 585 285" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round"/>`,
  note: (c) => `<circle cx="300" cy="400" r="62" fill="#fff"/><circle cx="500" cy="360" r="62" fill="#fff" fill-opacity=".85"/><rect x="345" y="170" width="24" height="230" fill="#fff"/><rect x="545" y="130" width="24" height="230" fill="#fff" fill-opacity=".85"/><path d="M345 170 L569 130 V190 L345 230 Z" fill="${c}" fill-opacity=".9"/>`,
  ball: (c) => `<circle cx="400" cy="300" r="170" fill="#fff"/><path d="M400 130 L470 185 L445 270 H355 L330 185 Z" fill="${c}"/><path d="M355 270 L300 340 M445 270 L500 340 M470 185 L545 190 M330 185 L255 190 M400 130 V80" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/>`,
  cup: (c) => `<path d="M250 230 H520 V360 Q520 450 385 450 Q250 450 250 360 Z" fill="#fff"/><path d="M520 270 H570 Q620 270 620 320 Q620 370 570 370 H515" stroke="#fff" stroke-width="26" fill="none"/><path d="M330 190 Q310 150 335 120 M400 190 Q380 140 405 100 M470 190 Q450 150 475 120" stroke="#fff" stroke-opacity=".8" stroke-width="14" fill="none" stroke-linecap="round"/><rect x="290" y="270" width="190" height="24" rx="12" fill="${c}"/>`,
  dice: (c) => `<rect x="190" y="170" width="250" height="250" rx="44" fill="#fff" transform="rotate(-10 315 295)"/><rect x="380" y="240" width="230" height="230" rx="42" fill="#fff" fill-opacity=".85" transform="rotate(12 495 355)"/><g fill="${c}"><circle cx="250" cy="230" r="20"/><circle cx="375" cy="230" r="20"/><circle cx="312" cy="295" r="20"/><circle cx="250" cy="360" r="20"/><circle cx="375" cy="360" r="20"/><circle cx="450" cy="300" r="18"/><circle cx="540" cy="390" r="18"/></g>`,
  camera: (c) => `<rect x="180" y="210" width="440" height="280" rx="44" fill="#fff"/><rect x="290" y="170" width="140" height="60" rx="20" fill="#fff" fill-opacity=".85"/><circle cx="400" cy="350" r="105" fill="${c}"/><circle cx="400" cy="350" r="70" fill="#fff" fill-opacity=".9"/><circle cx="400" cy="350" r="34" fill="${c}"/><circle cx="560" cy="255" r="14" fill="${c}"/>`,
  plant: (c) => `<path d="M300 430 H500 L480 520 H320 Z" fill="#fff"/><path d="M400 430 V230" stroke="#fff" stroke-width="16" stroke-linecap="round"/><path d="M400 330 Q300 330 270 240 Q370 230 400 330 Z M400 280 Q500 280 540 180 Q430 170 400 280 Z M400 230 Q360 170 400 110 Q445 170 400 230 Z" fill="#fff" fill-opacity=".9"/><circle cx="400" cy="125" r="10" fill="${c}"/>`,
};

function grupo(seed, motif) {
  const r = rng(seed * 97 + 3);
  const [a, b] = GRADIENTS[seed % GRADIENTS.length];
  const blobs = Array.from({ length: 4 }, () => `<circle cx="${Math.floor(r() * 800)}" cy="${Math.floor(r() * 600)}" r="${80 + Math.floor(r() * 160)}" fill="#fff" fill-opacity="${(0.05 + r() * 0.1).toFixed(2)}"/>`).join("");
  return wrap(800, 600, `<defs>${grad("g", a, b)}</defs>`, `<rect width="800" height="600" fill="url(#g)"/>${blobs}${MOTIFS[motif](a)}`);
}

function perfil(seed) {
  const r = rng(seed * 131 + 7);
  const [a, b] = GRADIENTS[(seed + 2) % GRADIENTS.length];
  const skin = pick(r, SKIN), hair = pick(r, HAIR), shirt = pick(r, SHIRT);
  const style = Math.floor(r() * 4);
  const glasses = r() > 0.55;
  const hairBack = style === 1 ? `<path d="M170 330 Q170 150 320 150 Q470 150 470 330 L500 560 H140 Z" fill="${hair}"/>` : style === 2 ? `<circle cx="320" cy="115" r="48" fill="${hair}"/>` : "";
  const hairFront = style === 3 ? "" : `<path d="M215 300 Q205 170 320 165 Q435 170 425 300 Q400 230 320 225 Q240 230 215 300 Z" fill="${hair}"/>`;
  const stubble = style === 3 ? `<path d="M240 340 Q320 440 400 340 Q400 420 320 450 Q240 420 240 340 Z" fill="${hair}" fill-opacity=".55"/>` : "";
  const gl = glasses ? `<g fill="none" stroke="#1c1c1c" stroke-width="7"><circle cx="278" cy="310" r="30"/><circle cx="362" cy="310" r="30"/><path d="M308 310 H332"/></g>` : "";
  return wrap(640, 800, `<defs>${grad("g", a, b)}</defs>`,
    `<rect width="640" height="800" fill="url(#g)"/><circle cx="520" cy="170" r="150" fill="#fff" fill-opacity=".10"/>${hairBack}
<path d="M80 800 Q90 560 320 540 Q550 560 560 800 Z" fill="${shirt}"/>
<rect x="285" y="440" width="70" height="120" rx="30" fill="${skin}"/>
<ellipse cx="320" cy="330" rx="112" ry="132" fill="${skin}"/>${stubble}${hairFront}
<circle cx="278" cy="318" r="9" fill="#1c1c1c"/><circle cx="362" cy="318" r="9" fill="#1c1c1c"/>
<path d="M285 385 Q320 415 355 385" stroke="#7a3b2e" stroke-width="8" fill="none" stroke-linecap="round"/>${gl}`);
}

function lugar(seed, variant) {
  const r = rng(seed * 211 + variant * 31 + 5);
  const modes = [
    { sky: ["#78cdff", "#eff8ff"], sun: "#ffc93c", win: "#fff3c4", body: ["#d9c3a5", "#c98b6b", "#e8dcc8", "#b5472f", "#9bb4c8"] },
    { sky: ["#062b4b", "#ef6f5e"], sun: "#ffe49b", win: "#ffd36b", body: ["#3b2f4a", "#4a3b5a", "#2f3c5a", "#5a3b3b", "#34495e"] },
    { sky: ["#02122a", "#084572"], sun: "#f4f1de", win: "#ffd36b", body: ["#0f2b46", "#12385a", "#0b2239", "#17405f", "#1d2e44"] },
  ];
  const m = modes[(seed + variant) % 3];
  const W = 800, H = 1000, ground = 800;
  let x = -20, bld = "";
  while (x < W) {
    const w = 90 + Math.floor(r() * 110), h = 260 + Math.floor(r() * 380), c = pick(r, m.body);
    bld += `<rect x="${x}" y="${ground - h}" width="${w}" height="${h}" fill="${c}"/>`;
    for (let wy = ground - h + 28; wy < ground - 30; wy += 46)
      for (let wx = x + 14; wx < x + w - 24; wx += 36)
        bld += `<rect x="${wx}" y="${wy}" width="18" height="26" rx="3" fill="${r() > 0.35 ? m.win : "#000"}" fill-opacity="${r() > 0.35 ? 0.85 : 0.18}"/>`;
    x += w + 6 + Math.floor(r() * 14);
  }
  const trees = Array.from({ length: 5 }, () => {
    const tx = Math.floor(r() * W), ts = 34 + Math.floor(r() * 30);
    return `<rect x="${tx - 5}" y="${ground - ts}" width="10" height="${ts}" fill="#5a3825"/><circle cx="${tx}" cy="${ground - ts - 18}" r="${ts * 0.8}" fill="${pick(r, ["#2da56a", "#3a8f5c", "#52b36f"])}"/>`;
  }).join("");
  const sunX = 120 + Math.floor(r() * 560);
  return wrap(W, H, `<defs>${grad("s", m.sky[0], m.sky[1])}</defs>`,
    `<rect width="${W}" height="${H}" fill="url(#s)"/><circle cx="${sunX}" cy="170" r="${60 + Math.floor(r() * 30)}" fill="${m.sun}"/>${bld}${trees}
<rect y="${ground}" width="${W}" height="${H - ground}" fill="#2b3a4a"/><path d="M0 ${ground + 80} H${W}" stroke="#ffc93c" stroke-width="8" stroke-dasharray="46 34"/>`);
}

const write = (rel, content) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const pad = (n) => String(n).padStart(2, "0");

const GRUPO_MOTIFS = ["book", "ball", "camera", "dice", "cup", "mountains", "note", "plant", "cup", "book", "ball", "camera", "mountains", "plant"];
GRUPO_MOTIFS.forEach((m, i) => write(`grupos/g${pad(i + 1)}.svg`, grupo(i + 1, m)));
for (let i = 1; i <= 14; i++) write(`profesionales/p${pad(i)}.svg`, perfil(i));
for (let i = 1; i <= 14; i++) for (const v of ["a", "b", "c"]) write(`lugares/l${pad(i)}-${v}.svg`, lugar(i, "abc".indexOf(v)));
// Un motivo por publicación, en el mismo orden en que scripts/demo.cjs las crea:
// 6 planes, 5 mesas de estudio, 4 beneficios, 6 grupos, 6 avisos y 2 pendientes.
const COM_MOTIFS = [
  "cup", "ball", "camera", "dice", "book", "mountains",
  "book", "book", "book", "book", "book",
  "cup", "book", "ball", "camera",
  "cup", "cup", "book", "ball", "cup", "note",
  "dice", "book", "plant", "camera", "plant", "book",
  "book", "mountains",
];
COM_MOTIFS.forEach((m, i) => write(`comunidad/c${pad(i + 1)}.svg`, grupo(i + 20, m)));

console.log("Imágenes de muestra generadas en public/demo");
