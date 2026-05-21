'use client';

import { gsap } from 'gsap';
import { ScrollTrigger, ScrollSmoother, SplitText } from 'gsap/all';

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

export { gsap, ScrollSmoother, ScrollTrigger, SplitText };
