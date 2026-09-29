import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { revealKanji, revealWords } from '../reveal.js';

/*
 * Pôr do sol · 家族
 * A seção mais quieta: nenhum movimento além da revelação vertical.
 * O texto só aparece depois que o céu já escureceu (washi sobre ameixa).
 * Entrada: 家族 é pincelado, o horizonte se estende, a frase desce.
 * Scroll: cada membro da família é pincelado em pé sobre o horizonte, um de
 * cada vez; o sol, no seu arco, encosta na linha no meio da seção.
 */

const section = document.querySelector('#por-do-sol');
const q = (sel) => section.querySelector(sel);

export function initSunset({ reduced }) {
  if (reduced) return;

  const played = [];
  const once = (start, build) =>
    ScrollTrigger.create({
      trigger: section,
      start,
      once: true,
      onEnter: () => document.fonts.ready.then(() => played.push(build())),
    });

  // "top -40%": o topo da seção já passou 40% de tela acima — céu escuro
  once('top -40%', () =>
    gsap
      .timeline()
      .add(revealKanji(q('.sunset__kanji')), 0)
      .fromTo(q('.sunset__horizon'), { scaleX: 0 }, { scaleX: 1, duration: 2.6, ease: 'sine.inOut' }, 0.5)
      .add(revealWords(q('.sunset__phrase')), 1.4),
  );

  gsap.utils.toArray('.member', section).forEach((member, i) => {
    once(`top -${75 + i * 26}%`, () => revealKanji(member, { duration: 2 }));
  });

  return () => played.forEach((tl) => tl.kill());
}
