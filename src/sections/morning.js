import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { revealKanji, revealWords } from '../reveal.js';

/*
 * Manhã · 力
 * Entrada (dispara uma vez): o kanji é pincelado, a barra se estende, a frase
 * desce palavra por palavra.
 * Scroll (scrub): três palavras executam as habilidades em relação à barra —
 * pull-up (queixo passa a barra), muscle-up (sobe até apoiar em cima),
 * handstand (vira no eixo horizontal: de cabeça para baixo, como um corpo
 * visto de frente — esquerda e direita não trocam; depois desce do outro
 * lado, completando a volta).
 */

const section = document.querySelector('#manha');
const q = (sel) => section.querySelector(sel);

export function initMorning({ reduced }) {
  if (reduced) return; // poses finais já estão no CSS

  const bar = q('.morning__bar');
  const [pullup, muscleup, handstand] = gsap.utils.toArray('.skill', section);
  const word = (li) => li.querySelector('.skill__word');

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
          .add(revealKanji(q('.morning__kanji')), 0)
          .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 2.4, ease: 'sine.inOut' }, 0.5)
          .add(revealWords(q('.morning__phrase')), 1.6);
      }),
  });

  // Scroll
  gsap
    .timeline({
      defaults: { ease: 'sine.inOut' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    })
    // 一 pull-up
    .fromTo(pullup, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 0)
    .fromTo(word(pullup), { yPercent: 0 }, { yPercent: -50, duration: 1.6 }, 0.6)
    .to(pullup, { autoAlpha: 0, duration: 0.6 }, 2.8)
    // 二 muscle-up
    .fromTo(muscleup, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 3.4)
    .fromTo(word(muscleup), { yPercent: 0 }, { yPercent: -100, duration: 2 }, 3.8)
    .to(muscleup, { autoAlpha: 0, duration: 0.6 }, 6.2)
    // 三 handstand
    .fromTo(handstand, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 6.6)
    .fromTo(word(handstand), { yPercent: -100, rotationX: 0, transformPerspective: 1400 }, { rotationX: 180, duration: 1.6 }, 7.1)
    .to(word(handstand), { rotationX: 360, duration: 1.4 }, 9.6)
    .to({}, { duration: 0.4 }, 11);

  return () => intro?.kill();
}
