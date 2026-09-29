/*
 * Cubo mágico em CSS 3D: 26 peças visíveis, cada uma com 6 faces.
 * Cada peça guarda só a rotação acumulada Q (3×3). Posição atual = Q · casa.
 * Um movimento gira em 90°/180° as peças da camada, em torno do eixo dela.
 * Toda a matemática fica aqui, então o estado entre dois movimentos e o
 * estado final de cada um batem exatamente — não há "salto" no scrub.
 *
 * Eixos no sistema do CSS: x → direita, y → baixo, z → para quem olha.
 */

const FACES = {
  R: { axis: 0, layer: 1, angle: 90 },
  L: { axis: 0, layer: -1, angle: -90 },
  U: { axis: 1, layer: -1, angle: -90 },
  D: { axis: 1, layer: 1, angle: 90 },
  F: { axis: 2, layer: 1, angle: 90 },
  B: { axis: 2, layer: -1, angle: -90 },
};

const SIDES = [
  // nome, eixo, lado, face do cubo
  ['front', 2, 1, 'F'],
  ['back', 2, -1, 'B'],
  ['right', 0, 1, 'R'],
  ['left', 0, -1, 'L'],
  ['top', 1, -1, 'U'],
  ['bottom', 1, 1, 'D'],
];

const I = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

function rotation(axis, deg) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  // mesmas fórmulas de rotateX/Y/Z do CSS
  if (axis === 0) return [[1, 0, 0], [0, c, -s], [0, s, c]];
  if (axis === 1) return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
}

const mul = (A, B) => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
const apply = (A, p) => A.map((row) => row[0] * p[0] + row[1] * p[1] + row[2] * p[2]);
const snap = (A) => A.map((row) => row.map(Math.round));

export function parseMoves(str) {
  return str
    .trim()
    .split(/\s+/)
    .map((token) => {
      const face = token[0];
      const mod = token.slice(1);
      const base = FACES[face];
      const angle = mod === "'" ? -base.angle : mod === '2' ? base.angle * 2 : base.angle;
      return { ...base, face, mod, angle };
    });
}

export function invert(moves) {
  return moves
    .slice()
    .reverse()
    .map((m) => ({
      ...m,
      mod: m.mod === '2' ? '2' : m.mod === "'" ? '' : "'",
      angle: m.mod === '2' ? m.angle : -m.angle,
    }));
}

// notação tipográfica: ′ (prime) no lugar do apóstrofo
export const label = (m) => m.face + (m.mod === "'" ? '′' : m.mod);

export function createCube(root, scramble) {
  const homes = [];
  for (const x of [-1, 0, 1])
    for (const y of [-1, 0, 1])
      for (const z of [-1, 0, 1]) if (x || y || z) homes.push([x, y, z]);

  // DOM
  const pieces = homes.map((home) => {
    const el = document.createElement('div');
    el.className = 'cubie';
    for (const [name, axis, side, face] of SIDES) {
      const f = document.createElement('div');
      f.className = `cubie__face cubie__face--${name}`;
      if (home[axis] === side) f.dataset.face = face;
      el.append(f);
    }
    root.append(el);
    return el;
  });

  // Estados: [0] embaralhado, [k] depois de k movimentos da solução
  const solution = invert(parseMoves(scramble));
  const step = (Q, m) =>
    Q.map((q, i) => (Math.round(apply(q, homes[i])[m.axis]) === m.layer ? snap(mul(rotation(m.axis, m.angle), q)) : q));

  let Q = homes.map(() => I);
  for (const m of parseMoves(scramble)) Q = step(Q, m);
  const states = [Q];
  for (const m of solution) states.push(step(states[states.length - 1], m));

  let S = 0;
  const measure = () => (S = root.offsetWidth / 3);

  const write = (el, A, home) => {
    const [tx, ty, tz] = apply(A, home).map((v) => v * S);
    const a = A.map((row) => row.map((v) => Math.round(v * 1e4) / 1e4));
    el.style.transform = `matrix3d(${a[0][0]},${a[1][0]},${a[2][0]},0,${a[0][1]},${a[1][1]},${a[2][1]},0,${a[0][2]},${a[1][2]},${a[2][2]},0,${tx.toFixed(2)},${ty.toFixed(2)},${tz.toFixed(2)},1)`;
  };

  /**
   * progress 0 → embaralhado, 1 → resolvido. Cada movimento ocupa uma fatia;
   * gira nos primeiros 80% dela e descansa no resto.
   * Retorna quantos movimentos já passaram da metade (para a notação).
   */
  function render(progress, ease = (t) => t) {
    const n = solution.length;
    const x = Math.min(Math.max(progress, 0), 1) * n;
    const k = Math.min(Math.floor(x), n);
    const t = k === n ? 0 : ease(Math.min((x - k) / 0.8, 1));
    const Qk = states[k];
    const m = solution[k];
    const turning = m && t > 0 ? rotation(m.axis, m.angle * t) : null;

    pieces.forEach((el, i) => {
      const inLayer = turning && Math.round(apply(Qk[i], homes[i])[m.axis]) === m.layer;
      write(el, inLayer ? mul(turning, Qk[i]) : Qk[i], homes[i]);
    });

    return k + (t >= 0.5 ? 1 : 0);
  }

  return { solution, measure, render };
}
