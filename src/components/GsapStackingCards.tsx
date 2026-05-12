'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  Globe,
  Zap,
  Rocket,
  Bitcoin,
  Gem,
  Sparkles
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stackingCardsData = [
  {
    id: 1,
    title: "Tipping Model",
    color: "bg-gradient-to-br from-blue-300 to-cyan-200",
    icon: <Globe className="w-8 h-8 text-blue-600" />,
    images: [
      "/images/Elements/tips.webp",
      "/images/Elements/createTIP.webp",
      "/images/Elements/publicTip.webp"
    ]
  },
  {
    id: 2,
    title: "Subscription Model",
    color: "bg-gradient-to-br from-emerald-300 to-teal-200",
    icon: <Zap className="w-8 h-8 text-emerald-600" />,
    images: [
      "/images/Elements/createSUB.webp",
      "/images/Elements/profileSUB.webp",
      "/images/Elements/trackSUB.webp"
    ]
  },
  {
    id: 3,
    title: "Posting Model",
    color: "bg-gradient-to-br from-purple-300 to-fuchsia-200",
    icon: <Rocket className="w-8 h-8 text-purple-600" />,
    images: [
      "/images/Elements/myPost.webp",
      "/images/Elements/postTOEarn.webp",
      "/images/Elements/unlockpost.webp"
    ]
  },
  {
    id: 4,
    title: "Earning Model",
    color: "bg-gradient-to-br from-yellow-300 to-orange-200",
    icon: <Bitcoin className="w-8 h-8 text-orange-600" />,
    images: [
      "/images/Elements/earnALLTime.webp",
      "/images/Elements/realTimeEarnTrack.webp"
    ]
  },
  {
    id: 5,
    title: "Profile Model",
    color: "bg-gradient-to-br from-rose-300 to-pink-200",
    icon: <Sparkles className="w-8 h-8 text-rose-600" />,
    images: [
      "/images/Elements/profile.webp",
      "/images/Elements/watchFollowers.webp",
      "/images/Elements/explorecreators.webp"
    ]
  },
  {
    id: 6,
    title: "Tooling",
    color: "bg-gradient-to-br from-indigo-300 to-blue-200",
    icon: <Gem className="w-8 h-8 text-indigo-600" />,
    images: [
      "/images/Elements/tools.webp",
      "/images/Elements/getNotified.webp"
    ]
  }
];

export default function GsapStackingCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    const cards = cardsRef.current;
    if (!cards || cards.length === 0 || !containerRef.current) return;

    // Set initial states
    gsap.set(cards, { transformOrigin: "top center" });

    // Cards 1 to N start below and hidden
    cards.forEach((card, index) => {
      if (index === 0) return;
      gsap.set(card, {
        y: window.innerHeight,
        scale: 0.9,
        rotationX: 15,
        opacity: 0
      });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: `+=${cards.length * 100}%`,
        pin: true,
        pinSpacing: true,
        scrub: 1, // smooth scrubbing
        anticipatePin: 1,
      }
    });

    // Create staggered animations for each card entry
    cards.forEach((card, index) => {
      if (index === 0) return;

      // Bring current card in
      tl.to(card, {
        y: 0,
        scale: 1,
        rotationX: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.inOut",
      }, index); // Using the index as the absolute time position on timeline

      // Push all previous cards back
      for (let j = 0; j < index; j++) {
        const prevCard = cards[j];
        const depth = index - j; // How many layers deep this card is now

        const targetScale = 1 - (depth * 0.05); // 0.95, 0.90, etc.
        const targetOpacity = Math.max(0, 1 - (depth * 0.2)); // Fades out the deeper it gets
        const targetY = depth * -20; // Moves slightly up to create tab effect

        tl.to(prevCard, {
          scale: targetScale,
          opacity: targetOpacity,
          y: targetY,
          rotationX: -5, // Slight backwards tilt
          duration: 1,
          ease: "power3.inOut",
        }, index);
      }
    });
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-[#050505] overflow-hidden text-white flex flex-col pt-20 pb-10"
    >

      {/* Cards Area */}
      <div
        ref={cardsWrapperRef}
        className="relative w-full flex-1 flex justify-center items-center px-4"
        style={{ perspective: '1500px' }}
      >
        <div className="relative w-full max-w-6xl h-[70vh] md:h-[80vh]">
          {stackingCardsData.map((card, i) => (
            <div
              key={card.id}
              ref={(el) => { cardsRef.current[i] = el; }}
              className={`absolute top-0 w-full h-full rounded-[2.5rem] ${card.color} shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col`}
              style={{ zIndex: i }}
            >
              {/* SVG Noise Overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none mix-blend-overlay z-0">
                <filter id={`noiseFilter-${i}`}>
                  <feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter={`url(#noiseFilter-${i})`} />
              </svg>

              <div className="relative z-10 flex flex-col h-full p-6 md:p-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg flex-shrink-0">
                    {card.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="bg-white text-slate-900 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full w-fit mb-1 md:mb-2 shadow-sm flex items-center justify-center">
                      {i + 1} / {stackingCardsData.length}
                    </span>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-slate-900">
                      {card.title}
                    </h3>
                  </div>
                </div>

                {/* Content Body: The images grid */}
                <div className="flex-1 w-full flex items-center lg:justify-center gap-6 overflow-x-auto no-scrollbar pb-6 px-4 md:px-0 snap-x snap-mandatory scroll-smooth">
                  {card.images.map((imgSrc, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="h-[85%] md:h-full w-[85%] md:w-auto flex-shrink-0 flex items-center justify-center overflow-hidden snap-center"
                    >
                      <img
                        src={imgSrc}
                        alt={`${card.title} screenshot ${imgIdx + 1}`}
                        className="h-full w-full md:w-auto object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500 rounded-3xl"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
