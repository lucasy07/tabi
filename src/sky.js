import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const { interpolate, clamp } = gsap.utils;

const C = {
  dawn1: '#F6D6C9',
  dawn2: '#B8C6E0',
  morning: '#8EC5FF',
  afternoon: '#4A90D9',
  sunset1: '#F28C5B',
  sunset2: '#7A3E6B',
  night: '#0B1026',
  washi: '#FAF7F0',
};

/*
 * Estado do céu em cada momento do dia.
 * angle: posição do sol/lua no arco (180° = horizonte esquerdo, 0° = direito).
 * hold: até que altura (%) a cor do topo se mantém antes do degradê começar.
 * sun / dusk / moon / halo / clouds / stars: opacidades.
 */
const STATES = {
  dawn: { hold: 0, top: C.dawn2, bottom: C.dawn1, angle: 166, sun: 1, dusk: 0.45, moon: 0, halo: 0.9, clouds: 0.95, stars: 0 },
  morning: { hold: 0, top: C.morning, bottom: interpolate(C.morning, C.washi, 0.45), angle: 122, sun: 1, dusk: 0, moon: 0, halo: 0.7, clouds: 1, stars: 0 },
  afternoon: { hold: 0, top: C.afternoon, bottom: C.morning, angle: 96, sun: 1, dusk: 0, moon: 0, halo: 0.6, clouds: 0.9, stars: 0 },
  sunset: { hold: 35, top: C.sunset2, bottom: C.sunset1, angle: 20, sun: 1, dusk: 1, moon: 0, halo: 0.85, clouds: 0.7, stars: 0 },
  night: { hold: 0, top: C.night, bottom: interpolate(C.night, C.sunset2, 0.28), angle: 46, sun: 0, dusk: 0, moon: 1, halo: 0.22, clouds: 0.18, stars: 1 },
};

export function initSky({ reduced }) {
  const sky = document.querySelector('.sky');
  const orb = sky.querySelector('.sky__celestial');
  const layers = {
    sun: sky.querySelector('.sky__sun:not(.sky__sun--dusk)'),
    dusk: sky.querySelector('.sky__sun--dusk'),
    moon: sky.querySelector('.sky__moon'),
    halo: sky.querySelector('.sky__halo'),
    clouds: sky.querySelector('.sky__clouds'),
    stars: sky.querySelector('.sky__stars'),
  };
  const sections = gsap.utils.toArray('[data-moment]');
  const states = sections.map((s) => STATES[s.dataset.moment]);

  gsap.set(orb, { xPercent: -50, yPercent: -50 });
  const setX = gsap.quickSetter(orb, 'x', 'px');
  const setY = gsap.quickSetter(orb, 'y', 'px');

  function apply(s) {
    sky.style.setProperty('--sky-top', s.top);
    sky.style.setProperty('--sky-bottom', s.bottom);
    sky.style.setProperty('--sky-hold', `${s.hold}%`);

    // Arco elíptico ancorado abaixo do centro da tela
    const w = window.innerWidth;
    const h = window.innerHeight;
    const rad = (s.angle * Math.PI) / 180;
    setX(w * (0.5 + 0.42 * Math.cos(rad)));
    setY(h * (0.9 - 0.75 * Math.sin(rad)));

    for (const key in layers) layers[key].style.opacity = s[key];
  }

  if (reduced) {
    // Sem scrub: o céu troca por seção, com uma transição simples.
    let current = states[0];
    const proxy = { p: 0 };
    apply(current);

    sections.forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (!self.isActive) return;
          const lerp = interpolate(current, states[i]);
          proxy.p = 0;
          gsap.to(proxy, {
            p: 1,
            duration: 1.2,
            ease: 'sine.inOut',
            overwrite: true,
            onUpdate: () => apply((current = lerp(proxy.p))),
          });
        },
      });
    });
    return;
  }

  // Céu contínuo. Dois ritmos:
  // - cores e opacidades ficam no estado da seção enquanto ela ocupa a tela
  //   e fazem a transição na passagem para a próxima (garante o contraste
  //   do texto de cada seção);
  // - o sol/lua anda sem parar: cada ângulo é "pleno" quando o centro da
  //   seção passa pelo centro da tela.
  // Entre dois estados, interpolação com easing sine.
  let holds = [];
  let centers = [];
  const lerps = states.slice(1).map((s, i) => interpolate(states[i], s));
  const ease = gsap.parseEase('sine.inOut');

  function measure() {
    const vh = window.innerHeight;
    const max = ScrollTrigger.maxScroll(window);
    const at = (y) => clamp(0, max, y);
    // a troca de cor começa quando o texto da seção anterior já quase saiu
    // (¼ de tela antes do topo da próxima) e termina ½ tela depois
    holds = sections.map((s, i) => {
      const next = sections[i + 1];
      return [i ? at(s.offsetTop + vh * 0.5) : 0, next ? at(next.offsetTop - vh * 0.25) : max];
    });
    centers = sections.map((s) => at(s.offsetTop + s.offsetHeight / 2 - vh / 2));
    centers[0] = 0;
    centers[centers.length - 1] = max;
  }

  // spans[i] = [início, fim] do trecho em que o estado i está pleno
  function sample(y, spans) {
    let i = 0;
    while (i < lerps.length - 1 && y > spans[i + 1][0]) i++;
    const from = spans[i][1];
    const to = spans[i + 1][0];
    return lerps[i](ease(clamp(0, 1, (y - from) / (to - from || 1))));
  }

  function render(y) {
    const arc = sample(y, centers.map((c) => [c, c]));
    apply({ ...sample(y, holds), angle: arc.angle });
  }

  measure();
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => render(self.scroll()),
    onRefresh: (self) => {
      measure();
      render(self.scroll());
    },
  });
}
