/*
 * Paisagem do amanhecer, em quatro planos (do mais distante ao mais próximo).
 * Desenho próprio em SVG: perspectiva atmosférica — quanto mais longe, mais
 * clara e mais fundida à névoa rosada do horizonte.
 * Todos os planos usam viewBox 1600×600 ancorado embaixo.
 */

const f = (n) => Math.round(n * 10) / 10;

const svg = (name, defs, body) =>
  `<svg class="dawn__layer dawn__layer--${name}" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><defs>${defs}</defs>${body}</svg>`;

// Preenchimento que clareia para a névoa na base
const mist = (id, from, to, y1, y2) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y1}" x2="0" y2="${y2}"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>`;

function pagoda(cx, base, s) {
  let d = `M${f(cx - 26 * s)},${f(base + 4 * s)}h${f(52 * s)}v${f(-6 * s)}h${f(-52 * s)}Z`;
  let y = base - 2 * s;
  for (let i = 0; i < 5; i++) {
    const w = (76 - i * 9) * s; // beiral
    const body = (14 - i) * s;
    const bw = w * 0.46;
    d += `M${f(cx - bw / 2)},${f(y)}h${f(bw)}v${f(-body)}h${f(-bw)}Z`;
    y -= body;
    // telhado com as pontas dos beirais curvadas para cima
    const t = 7 * s;
    d +=
      `M${f(cx - w / 2)},${f(y - 3.5 * s)}` +
      `Q${f(cx - w * 0.34)},${f(y + 1.2 * s)} ${f(cx - w * 0.2)},${f(y)}` +
      `L${f(cx + w * 0.2)},${f(y)}` +
      `Q${f(cx + w * 0.34)},${f(y + 1.2 * s)} ${f(cx + w / 2)},${f(y - 3.5 * s)}` +
      `L${f(cx + w * 0.18)},${f(y - t)}L${f(cx - w * 0.18)},${f(y - t)}Z`;
    y -= t;
  }
  // sōrin: mastro com anéis
  d += `M${f(cx - 1.2 * s)},${f(y)}h${f(2.4 * s)}v${f(-32 * s)}h${f(-2.4 * s)}Z`;
  for (let k = 0; k < 6; k++) {
    const ry = y - 5 * s - k * 4 * s;
    d += `M${f(cx - 3.6 * s)},${f(ry)}h${f(7.2 * s)}v${f(-1.4 * s)}h${f(-7.2 * s)}Z`;
  }
  return d;
}

// Pinheiro japonês: tronco inclinado e almofadas de folhagem achatadas
function pine(x, y, s, lean = 1) {
  const tx = x + 22 * s * lean;
  const ty = y - 96 * s;
  let d =
    `M${f(x - 4 * s)},${f(y)}Q${f(x - 2 * s * lean)},${f(y - 55 * s)} ${f(tx - 2 * s)},${f(ty)}` +
    `L${f(tx + 2 * s)},${f(ty)}Q${f(x + 10 * s * lean)},${f(y - 55 * s)} ${f(x + 4 * s)},${f(y)}Z`;
  const pads = [
    [22, -98, 30, 9],
    [0, -80, 38, 10],
    [34, -66, 30, 9],
    [-10, -50, 28, 8],
    [26, -38, 22, 7],
  ];
  for (const [dx, dy, rx, ry] of pads) {
    const px = x + dx * s * lean;
    const py = y + dy * s;
    d += `M${f(px - rx * s)},${f(py)}a${f(rx * s)},${f(ry * s)} 0 1,0 ${f(2 * rx * s)},0a${f(rx * s)},${f(ry * s)} 0 1,0 ${f(-2 * rx * s)},0Z`;
  }
  return d;
}

// 1 · cordilheira distante com um vulcão de neve no cume
const far = svg(
  'far',
  mist('m-far', '#D6C2D2', '#F4D8CF', 170, 470),
  `<path fill="url(#m-far)" d="M0,600L0,410C80,395 150,372 230,386C300,398 360,420 420,428Q610,400 690,168L712,160L730,166Q810,400 1010,428C1100,440 1180,402 1260,393C1340,384 1420,410 1500,398C1550,392 1580,380 1600,384L1600,600Z"/>
   <path fill="#F4E9EC" opacity=".8" d="M654,253Q672,215 690,168L712,160L730,166Q748,215 767,251L752,238L740,256L722,236L706,258L690,240L672,262Z"/>`,
);

// 2 · cumes intermediários
// névoa baixa que se acumula nos vales
const valleyMist = '<radialGradient id="vm"><stop offset="0" stop-color="#FBEDE8" stop-opacity=".75"/><stop offset="1" stop-color="#FBEDE8" stop-opacity="0"/></radialGradient>';

const ridge = svg(
  'ridge',
  mist('m-ridge', '#BFA6BF', '#EECFCB', 430, 540) + valleyMist,
  `<path fill="url(#m-ridge)" d="M0,600L0,455C120,430 200,445 300,462C400,478 470,440 560,432C660,424 720,470 820,476C930,482 1000,440 1100,436C1200,432 1260,468 1360,470C1460,472 1540,445 1600,440L1600,600Z"/>
   <ellipse cx="420" cy="500" rx="560" ry="34" fill="url(#vm)"/>
   <ellipse cx="1180" cy="492" rx="480" ry="28" fill="url(#vm)"/>`,
);

// 3 · colina com o pagode e pinheiros
const hill = svg(
  'hill',
  mist('m-hill', '#9C86A7', '#D8BBC4', 330, 580),
  `<path fill="url(#m-hill)" d="M0,600L0,520C150,505 260,515 380,522C520,530 640,520 760,512C900,500 1000,450 1120,430C1220,414 1300,420 1400,440C1480,456 1550,470 1600,475L1600,600Z
   ${pagoda(1185, 422, 0.95)}
   ${pine(1070, 442, 0.55, 1)}
   ${pine(1275, 424, 0.5, -1)}
   ${pine(1335, 432, 0.42, 1)}"/>`,
);

// 4 · terraços de arroz alagados refletindo o céu, e um pinheiro em primeiro plano
const terraces = [
  ['M0,520C420,500 980,538 1600,512', '#86729A'],
  ['M0,548C380,532 1020,562 1600,538', '#77658C'],
  ['M0,573C360,561 1060,587 1600,565', '#68587E'],
  ['M0,593C400,585 1000,603 1600,591', '#5B4D70'],
];
const near = svg(
  'near',
  '',
  terraces.map(([top, fill]) => `<path fill="${fill}" d="${top}L1600,600L0,600Z"/>`).join('') +
    terraces
      .map(([top]) => `<path fill="none" stroke="#FBE6DC" stroke-opacity=".55" stroke-width="1.2" vector-effect="non-scaling-stroke" d="${top}"/>`)
      .join('') +
    `<path fill="#4E4262" d="${pine(1500, 600, 2.3, -1)}"/>`,
);

export const landscapeLayers = [far, ridge, hill, near];
