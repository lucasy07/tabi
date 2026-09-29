import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { revealKanji, revealWords } from '../reveal.js';
import { createCube, label } from './cube.js';

/*
 * Tarde · 知
 * Entrada (dispara uma vez): o kanji é pincelado, a frase desce palavra por
 * palavra.
 * Scroll: o cubo começa embaralhado e o scroll executa, um a um, os 20
 * movimentos que o resolvem. A notação acompanha: feito em tinta cheia,
 * pendente esmaecido. Resolvido, entra a linha sobre o número de Deus.
 */

// Embaralhada fixa de 20 movimentos; a solução é o inverso dela
const SCRAMBLE = "D2 R' F U2 L B' R2 D' F2 U L' B2 R D F' U' L2 B R' U";

const section = document.querySelector('#tarde');
const q = (sel) => section.querySelector(sel);

const cube = createCube(q('.cube'), SCRAMBLE);
q('.afternoon__moves').innerHTML = cube.solution.map((m) => `<span class="algo__move">${label(m)}</span>`).join(' ');
const moves = gsap.utils.toArray('.algo__move', section);

export function initAfternoon({ reduced }) {
  cube.measure();

  if (reduced) {
    cube.render(1);
    moves.forEach((el) => el.classList.add('is-done'));
    return;
  }

  // Entrada
  let intro;
  ScrollTrigger.create({
    trigger: section,
    start: 'top 35%',
    once: true,
    onEnter: () =>
      document.fonts.ready.then(() => {
        intro = gsap
          .timeline()
          .add(revealKanji(q('.afternoon__kanji')), 0)
          .add(revealWords(q('.afternoon__phrase')), 1.2);
      }),
  });

  // Scroll: resolve entre 8% e 84% da seção, depois descansa resolvido
  const ease = gsap.parseEase('sine.inOut');
  let done = -1;
  let god;

  function update(p) {
    const t = (p - 0.08) / 0.76;
    const n = cube.render(t, ease);
    if (n !== done) {
      moves.forEach((el, i) => el.classList.toggle('is-done', i < n));
      done = n;
    }
    if (!god && t >= 1) god = revealWords(q('.afternoon__god'), { stagger: 0.06, duration: 1.2 });
  }

  update(0);
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => update(self.progress),
    onRefresh: (self) => {
      cube.measure();
      update(self.progress);
    },
  });

  return () => {
    intro?.kill();
    god?.kill();
  };
}
