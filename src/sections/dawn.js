import { gsap } from 'gsap';

import { cloudSVG, svgURL } from '../clouds.js';
import { revealKanji, revealWords } from '../reveal.js';
import { landscapeLayers } from './dawn-landscape.js';

/*
 * Amanhecer · 空
 * Entrada (por tempo): o kanji é pincelado, o véu de nuvens se abre e revela o
 * nome, a frase desce palavra por palavra.
 * Scroll (scrub): a paisagem afunda em planos — a câmera sobe para o céu —,
 * e um banco de nuvens se fecha à frente, levando à manhã.
 */

const section = document.querySelector('#amanhecer');
const q = (sel) => section.querySelector(sel);

// Desenhos: rodam uma vez, com ou sem movimento
q('.dawn__landscape').innerHTML = landscapeLayers.join('');

const veil = (seed) =>
  svgURL(
    cloudSVG({
      width: 1400,
      height: 760,
      count: 6,
      seed,
      light: '#FFFAF6',
      shade: '#EFDCDC',
      alpha: 0.95,
      place: (i, rand) => [480 + rand() * 440, 330 + rand() * 160, 0.9 + rand() * 0.35],
    }),
  );
q('.dawn__veil--left').style.backgroundImage = veil(5);
q('.dawn__veil--right').style.backgroundImage = veil(23);

q('.dawn__mist-crest').style.backgroundImage = svgURL(
  cloudSVG({
    width: 1800,
    height: 620,
    count: 9,
    seed: 61,
    light: '#FFFFFF',
    shade: '#F3E3E2',
    alpha: 0.95,
    place: (i, rand) => [((i + 0.5) / 9) * 1800 + (rand() - 0.5) * 120, 360 + rand() * 90, 1 + rand() * 0.45],
  }),
);

export function initDawn({ reduced }) {
  if (reduced) return; // estado final já está no CSS

  const kanji = q('.dawn__kanji');
  const layers = gsap.utils.toArray('.dawn__layer', section);
  const vh = () => window.innerHeight;

  // Entrada
  const intro = gsap.timeline({ paused: true, delay: 0.3 });
  document.fonts.ready.then(() => {
    intro
      .add(revealKanji(kanji), 0)
      .to(q('.dawn__veil--left'), { xPercent: -88, autoAlpha: 0.5, duration: 3.4, ease: 'sine.inOut' }, 0.7)
      .to(q('.dawn__veil--right'), { xPercent: 88, autoAlpha: 0.5, duration: 3.4, ease: 'sine.inOut' }, 0.7)
      .fromTo(q('.dawn__name'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.6, ease: 'sine.inOut' }, 1.1)
      .add(revealWords(q('.dawn__phrase')), 2.8)
      .play();
  });

  // Scroll
  gsap
    .timeline({
      defaults: { ease: 'none', duration: 1 },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
    .to(layers[0], { yPercent: 14 }, 0)
    .to(layers[1], { yPercent: 26 }, 0)
    .to(layers[2], { yPercent: 42 }, 0)
    .to(layers[3], { yPercent: 62 }, 0)
    .to(q('.dawn__title'), { y: () => -vh() * 0.12 }, 0)
    .to(kanji, { y: () => -vh() * 0.06 }, 0)
    .fromTo(q('.dawn__mist'), { y: () => vh() }, { y: () => -vh() * 0.16, ease: 'sine.inOut', duration: 0.62 }, 0.38);

  return () => intro.kill();
}
