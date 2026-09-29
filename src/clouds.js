import { gsap } from 'gsap';

/*
 * Três planos de nuvens. Cada plano é um ladrilho SVG gerado aqui (sem imagens
 * externas, sem filtros): nuvens feitas de elipses com gradiente radial que se
 * somam em bordas macias. O ladrilho é rasterizado uma vez pelo navegador; por
 * frame só mexemos em transform.
 *
 * drift: deriva contínua em px/s (o site "respira" mesmo parado)
 * parallax: fração do scroll aplicada ao plano
 */
const LAYERS = [
  { selector: '.clouds--far', tile: [900, 620], count: 5, scale: [0.35, 0.6], alpha: 0.55, drift: 4, parallax: 0.06, seed: 7 },
  { selector: '.clouds--mid', tile: [1300, 880], count: 4, scale: [0.6, 0.95], alpha: 0.7, drift: 9, parallax: 0.16, seed: 19 },
  { selector: '.clouds--near', tile: [1800, 1150], count: 3, scale: [0.95, 1.4], alpha: 0.85, drift: 15, parallax: 0.34, seed: 41 },
];

function random(seed) {
  // mulberry32: determinístico, para as nuvens serem sempre as mesmas
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cloudPuffs(rand, cx, cy, s) {
  const puffs = [];
  const width = 420 * s;
  // base achatada e levemente sombreada
  const base = 4 + Math.floor(rand() * 3);
  for (let i = 0; i < base; i++) {
    const t = i / (base - 1) - 0.5;
    puffs.push({ x: cx + t * width, y: cy + 10 * s, rx: (70 + rand() * 40) * s, ry: (34 + rand() * 12) * s, g: 'b' });
  }
  // topo arredondado
  const tops = 2 + Math.floor(rand() * 3);
  for (let i = 0; i < tops; i++) {
    const t = (i + 0.5) / tops - 0.5;
    const r = (60 + rand() * 50) * s;
    puffs.push({ x: cx + t * width * 0.7 + (rand() - 0.5) * 30 * s, y: cy - r * 0.45, rx: r, ry: r * 0.85, g: 'w' });
  }
  return puffs;
}

/**
 * Gera o SVG de um grupo de nuvens.
 * place(i, rand) → [cx, cy, escala]. wrap: repete cópias nas bordas para o
 * ladrilho emendar sem costura. light/shade: cor do topo e da base.
 */
export function cloudSVG({ width: W, height: H, count, place, seed, wrap = false, light = '#fff', shade = '#e4eaf4', alpha = 0.9 }) {
  const rand = random(seed);
  const offsets = wrap ? [-1, 0, 1] : [0];
  const ellipses = [];

  for (let i = 0; i < count; i++) {
    const [cx, cy, s] = place(i, rand);
    for (const p of cloudPuffs(rand, cx, cy, s)) {
      for (const ox of offsets) {
        for (const oy of offsets) {
          ellipses.push(
            `<ellipse cx="${(p.x + ox * W).toFixed(1)}" cy="${(p.y + oy * H).toFixed(1)}" rx="${p.rx.toFixed(1)}" ry="${p.ry.toFixed(1)}" fill="url(#${p.g})"/>`,
          );
        }
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
<defs>
<radialGradient id="w"><stop offset="0" stop-color="${light}" stop-opacity="${alpha}"/><stop offset=".55" stop-color="${light}" stop-opacity="${alpha / 2}"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></radialGradient>
<radialGradient id="b"><stop offset="0" stop-color="${shade}" stop-opacity="${alpha * 0.95}"/><stop offset=".6" stop-color="${shade}" stop-opacity="${alpha * 0.4}"/><stop offset="1" stop-color="${shade}" stop-opacity="0"/></radialGradient>
</defs>${ellipses.join('')}</svg>`;
}

export const svgURL = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

function tileSVG({ tile: [W, H], count, scale, seed }) {
  return cloudSVG({
    width: W,
    height: H,
    count,
    seed,
    wrap: true,
    // distribui em faixas verticais para não empilhar nuvens
    place: (i, rand) => [rand() * W, ((i + 0.2 + rand() * 0.6) / count) * H, scale[0] + rand() * (scale[1] - scale[0])],
  });
}

export function buildClouds() {
  return LAYERS.map((layer) => {
    const el = document.querySelector(layer.selector);
    const [W, H] = layer.tile;
    el.style.backgroundImage = svgURL(tileSVG(layer));
    el.style.backgroundSize = `${W}px ${H}px`;
    el.style.setProperty('--tile-w', `${W}px`);
    el.style.setProperty('--tile-h', `${H}px`);
    el.style.opacity = layer.alpha;
    return {
      ...layer,
      el,
      wrapX: gsap.utils.wrap(-W, 0),
      wrapY: gsap.utils.wrap(-H, 0),
      setX: gsap.quickSetter(el, 'x', 'px'),
      setY: gsap.quickSetter(el, 'y', 'px'),
    };
  });
}

/** Deriva + parallax. Retorna a função de limpeza. */
export function animateClouds(layers) {
  const tick = (time) => {
    const y = window.scrollY;
    for (const l of layers) {
      l.setX(l.wrapX(-time * l.drift));
      l.setY(l.wrapY(-y * l.parallax));
    }
  };
  gsap.ticker.add(tick);
  return () => gsap.ticker.remove(tick);
}
