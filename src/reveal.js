import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

/*
 * Movimento-assinatura 3: revelação vertical.
 *
 * Kanji: uma janela (.kanji__mask) desce de cima para baixo enquanto a tinta
 * (.kanji__ink) faz o movimento contrário, ficando parada na tela: o traço
 * aparece como pincelada. A borda inferior da janela é esfumada por uma
 * máscara CSS estática; só transform é animado.
 */
export function revealKanji(el, { duration = 2.4 } = {}) {
  const mask = el.querySelector('.kanji__mask');
  const ink = el.querySelector('.kanji__ink');
  const h = () => mask.offsetHeight;

  return gsap
    .timeline()
    .set(el, { autoAlpha: 1 })
    .fromTo(mask, { y: () => -h() }, { y: 0, duration, ease: 'sine.inOut' }, 0)
    .fromTo(ink, { y: () => h() }, { y: 0, duration, ease: 'sine.inOut' }, 0);
}

/** Depois do kanji: o texto em português desce palavra por palavra. */
export function revealWords(el, { stagger = 0.18, duration = 1.4 } = {}) {
  const split = SplitText.create(el, { type: 'words', mask: 'words' });

  return gsap
    .timeline()
    .set(el, { autoAlpha: 1 })
    .from(split.words, { yPercent: -110, duration, ease: 'power2.out', stagger });
}
