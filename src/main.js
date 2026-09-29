import 'lenis/dist/lenis.css';
import './styles/base.css';
import './styles/sky.css';
import './styles/kanji.css';
import './styles/dawn.css';
import './styles/morning.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

import { initSky } from './sky.js';
import { buildClouds, animateClouds } from './clouds.js';
import { initDawn } from './sections/dawn.js';
import { initMorning } from './sections/morning.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const clouds = buildClouds();
const mm = gsap.matchMedia();

mm.add(
  {
    motion: '(prefers-reduced-motion: no-preference)',
    reduced: '(prefers-reduced-motion: reduce)',
  },
  (context) => {
    const { reduced } = context.conditions;
    const cleanups = [];

    if (!reduced) {
      const lenis = new Lenis({ lerp: 0.08 });
      const raf = (time) => lenis.raf(time * 1000);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      cleanups.push(() => {
        gsap.ticker.remove(raf);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
      });
      cleanups.push(animateClouds(clouds));
    }

    initSky({ reduced });
    for (const init of [initDawn, initMorning]) {
      const cleanup = init({ reduced });
      if (cleanup) cleanups.push(cleanup);
    }

    return () => cleanups.forEach((fn) => fn());
  },
);
