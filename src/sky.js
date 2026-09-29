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
 * sun / dusk / moon / halo / clouds: opacidades.
 */
const STATES = {
  dawn: { top: C.dawn2, bottom: C.dawn1, angle: 166, sun: 1, dusk: 0.45, moon: 0, halo: 0.9, clouds: 0.95 },
  morning: { top: C.morning, bottom: interpolate(C.morning, C.washi, 0.45), angle: 122, sun: 1, dusk: 0, moon: 0, halo: 0.7, clouds: 1 },
  afternoon: { top: C.afternoon, bottom: C.morning, angle: 72, sun: 1, dusk: 0, moon: 0, halo: 0.6, clouds: 0.9 },
  sunset: { top: C.sunset2, bottom: C.sunset1, angle: 20, sun: 1, dusk: 1, moon: 0, halo: 0.85, clouds: 0.7 },
  night: { top: C.night, bottom: interpolate(C.night, C.sunset2, 0.28), angle: 46, sun: 0, dusk: 0, moon: 1, halo: 0.22, clouds: 0.18 },
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
  };
  const sections = gsap.utils.toArray('[data-moment]');
  const states = sections.map((s) => STATES[s.dataset.moment]);

  gsap.set(orb, { xPercent: -50, yPercent: -50 });
  const setX = gsap.quickSetter(orb, 'x', 'px');
  const setY = gsap.quickSetter(orb, 'y', 'px');

  function apply(s) {
    sky.style.setProperty('--sky-top', s.top);
    sky.style.setProperty('--sky-bottom', s.bottom);

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

  // Céu contínuo: cada estado é "pleno" quando o centro da sua seção passa
  // pelo centro da tela; entre dois estados, interpolação com easing sine.
  let anchors = [];
  const lerps = states.slice(1).map((s, i) => interpolate(states[i], s));
  const ease = gsap.parseEase('sine.inOut');

  function measure() {
    const vh = window.innerHeight;
    const max = ScrollTrigger.maxScroll(window);
    anchors = sections.map((s) => clamp(0, max, s.offsetTop + s.offsetHeight / 2 - vh / 2));
    anchors[0] = 0;
    anchors[anchors.length - 1] = max;
  }

  function render(y) {
    let i = 0;
    while (i < lerps.length - 1 && y > anchors[i + 1]) i++;
    const span = anchors[i + 1] - anchors[i] || 1;
    apply(lerps[i](ease(clamp(0, 1, (y - anchors[i]) / span))));
  }

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
