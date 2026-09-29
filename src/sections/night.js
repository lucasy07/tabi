import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { random, svgURL } from '../clouds.js';
import { revealKanji, revealWords } from '../reveal.js';

/*
 * Noite
 * A frase final desce palavra por palavra quando o céu já escureceu; o
 * colofão (空 力 知 家族) é pincelado de uma vez, o dia inteiro num traço.
 * "voltar ao amanhecer" rola devagar até o topo: o céu refaz o dia ao
 * contrário.
 */

const section = document.querySelector('#noite');
const q = (sel) => section.querySelector(sel);

// Campo de estrelas (paradas). Poucas brilhantes, com um halo discreto.
function starsSVG(W = 1200, H = 900, count = 150, seed = 97) {
  const rand = random(seed);
  let dots = '';
  for (let i = 0; i < count; i++) {
    const x = (rand() * W).toFixed(1);
    const y = (rand() * H).toFixed(1);
    const bright = rand() < 0.08;
    const r = bright ? 1.4 + rand() * 0.6 : 0.4 + rand() * 0.7;
    const a = bright ? 1 : 0.35 + rand() * 0.5;
    if (bright) dots += `<circle cx="${x}" cy="${y}" r="${(r * 4).toFixed(1)}" fill="url(#g)"/>`;
    dots += `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" fill="#FAF7F0" fill-opacity="${a.toFixed(2)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="g"><stop offset="0" stop-color="#FAF7F0" stop-opacity=".35"/><stop offset="1" stop-color="#FAF7F0" stop-opacity="0"/></radialGradient></defs>${dots}</svg>`;
}

const stars = document.querySelector('.sky__stars');
stars.style.backgroundImage = svgURL(starsSVG());
stars.style.backgroundSize = '1200px 900px';

export function initNight({ reduced, lenis }) {
  const rewind = q('.night__rewind');
  const title = document.querySelector('#dawn-name');
  title.tabIndex = -1; // recebe o foco ao voltar, sem entrar na ordem de tab

  const onRewind = (e) => {
    e.preventDefault();
    const done = () => title.focus({ preventScroll: true });
    if (lenis) {
      lenis.scrollTo(0, {
        duration: 6,
        easing: (t) => -(Math.cos(Math.PI * t) - 1) / 2, // sine.inOut
        onComplete: done,
      });
    } else {
      window.scrollTo(0, 0);
      done();
    }
  };
  rewind.addEventListener('click', onRewind);
  const cleanup = () => rewind.removeEventListener('click', onRewind);

  if (reduced) return cleanup;

  let intro;
  ScrollTrigger.create({
    trigger: section,
    start: 'top -40%', // céu já escuro
    once: true,
    onEnter: () =>
      document.fonts.ready.then(() => {
        intro = gsap
          .timeline()
          .add(revealWords(q('.night__phrase'), { stagger: 0.24, duration: 1.6 }), 0)
          .add(revealKanji(q('.night__day'), { duration: 3.2 }), 1.2);
      }),
  });

  return () => {
    cleanup();
    intro?.kill();
  };
}
