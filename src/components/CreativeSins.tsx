import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const sins = [
  {
    src: '/images/the-ear-trap.webp',
    alt: 'The Ear Trap',
    text: 'WE STARTED\nLISTENING TO\nEVERY OPINION',
  },
  {
    src: '/images/the-skull-seal.webp',
    alt: 'The Skull Seal',
    text: 'WE BEGAN\nCALLING ANYTHING\nCREATIVE',
  },
  {
    src: '/images/the-severed-puppet.webp',
    alt: 'The Severed Puppet',
    text: 'WE STOPPED\nWORKING WITH\nOUR OWN HANDS',
  },
];

const offsets = [
  { rotate: '-4deg', translateY: '18px',  maxW: '260px' },
  { rotate:  '2deg', translateY: '-22px', maxW: '240px' },
  { rotate:  '5deg', translateY: '8px',   maxW: '255px' },
];

function SinCard({ src, alt, text, idx, isTouch }: {
  src: string; alt: string; text: string; idx: number; isTouch: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [glow,    setGlow]    = useState(false);
  const filterId = `edges-${idx}`;

  const cardOuterRef   = useRef<HTMLDivElement>(null);
  const tiltRef        = useRef<HTMLDivElement>(null);
  const flipRef        = useRef<HTMLDivElement>(null);
  const backContentRef = useRef<HTMLDivElement>(null);

  // ── Scroll-driven flip on touch devices ──────────────────────
  // Each card flips when it enters the centre 40% of the viewport,
  // so they naturally trigger one at a time as the user scrolls.
  useEffect(() => {
    if (!isTouch) return;
    const el = cardOuterRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const hit = entry.isIntersecting;
        setFlipped(hit);
        setGlow(hit);
      },
      { rootMargin: '-30% 0px -30% 0px', threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isTouch]);

  // ── Flip spring ──────────────────────────────────────────────
  const flipTarget = useMotionValue(0);
  const flipY      = useSpring(flipTarget, { stiffness: 65, damping: 15 });

  useEffect(() => {
    const unsub = flipY.onChange((v) => {
      if (flipRef.current) {
        flipRef.current.style.transform = `rotateY(${v}deg)`;
      }
      // Back content fades in as card approaches face-on (90° → 180°)
      const backOpacity = Math.max(0, Math.min(1, (v - 90) / 90));
      if (backContentRef.current) {
        backContentRef.current.style.opacity = String(backOpacity);
      }
    });
    return unsub;
  }, [flipY]);

  useEffect(() => {
    flipTarget.set(flipped ? 180 : 0);
  }, [flipped, flipTarget]);

  // ── Mouse tilt (desktop only) ─────────────────────────────────
  const rafRef   = useRef<number | null>(null);
  const tiltVals = useRef({ x: 0, y: 0 });

  const applyTilt = (x: number, y: number) => {
    tiltVals.current = { x, y };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (tiltRef.current && !flipped) {
        tiltRef.current.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
      }
    });
  };

  const resetTilt = () => {
    if (tiltRef.current) tiltRef.current.style.transform = '';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || flipped) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width  - 0.5;
    const ny = (e.clientY - r.top)  / r.height - 0.5;
    applyTilt(ny * -6, nx * 8);
  };

  const handleEnter = () => {
    if (isTouch) return;
    resetTilt();
    setGlow(true);
    setFlipped(true);
  };

  const handleLeave = () => {
    if (isTouch) return;
    setFlipped(false);
    setGlow(false);
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <div
      ref={cardOuterRef}
      style={{ perspective: '900px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* SVG edge filter */}
      {!isTouch && (
        <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }} aria-hidden="true">
          <defs>
            <filter id={filterId} colorInterpolationFilters="sRGB" x="-5%" y="-5%" width="110%" height="110%">
              <feConvolveMatrix in="SourceGraphic" kernelMatrix="-1 -1 -1  -1 8 -1  -1 -1 -1" order="3" divisor="1" result="edges"/>
              <feComponentTransfer in="edges" result="bright">
                <feFuncR type="linear" slope="6"/>
                <feFuncG type="linear" slope="6"/>
                <feFuncB type="linear" slope="6"/>
              </feComponentTransfer>
              <feMorphology in="bright" operator="dilate" radius="1"/>
            </filter>
          </defs>
        </svg>
      )}

      {/* Tilt wrapper — mouse parallax only */}
      <div ref={tiltRef} style={{ transformStyle: 'preserve-3d' }}>

        {/* Flip wrapper — spring-driven via ref */}
        <div ref={flipRef} style={{ transformStyle: 'preserve-3d', position: 'relative' }}>

          {/* ── FRONT FACE ── */}
          <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', position: 'relative' }}>
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                boxShadow: glow
                  ? '0 0 28px 6px rgba(152,110,223,0.4), 0 0 60px 12px rgba(152,110,223,0.15)'
                  : '0 0 0px 0px rgba(152,110,223,0)',
              }}
              transition={{ duration: 0.3 }}
            />
            <img src={src} alt={alt} className="block w-full h-auto" draggable={false} />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: '#986edf', mixBlendMode: 'multiply', opacity: 0.35 }}
            />
            {!isTouch && (
              <img
                src={src} alt="" aria-hidden="true"
                className="block w-full h-auto absolute inset-0"
                style={{ mixBlendMode: 'screen', filter: `url(#${filterId})`, opacity: 0.6 }}
                draggable={false}
              />
            )}
          </div>

          {/* ── BACK FACE ── */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
            }}
          >
            {/* Fades in only as card approaches 180° — no black visible mid-flip */}
            <div ref={backContentRef} style={{ position: 'relative', opacity: 0 }}>
              <img
                src={src} alt="" aria-hidden="true"
                className="block w-full h-auto"
                style={{ transform: 'scaleX(-1)', filter: 'brightness(0)' }}
                draggable={false}
              />
              {!isTouch && (
                <img
                  src={src} alt="" aria-hidden="true"
                  className="block w-full h-auto absolute inset-0"
                  style={{ mixBlendMode: 'screen', filter: `url(#${filterId})`, opacity: 0.8, transform: 'scaleX(-1)' }}
                  draggable={false}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <span
                  style={{
                    fontFamily: '"ObviouslyWide", system-ui, sans-serif',
                    fontSize: 'clamp(9px, 1.1vw, 15px)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    lineHeight: 1.4,
                    color: '#e8e4de',
                    textAlign: 'center',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {text}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CreativeSins() {
  const [isTouch, setIsTouch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsTouch(!window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-8 items-center justify-center bg-transparent w-full max-w-4xl mx-auto px-4">
      {sins.map((sin, idx) => (
        <div
          key={sin.src}
          className="w-full md:w-1/3"
          style={{
            maxWidth: isMobile ? '160px' : offsets[idx].maxW,
            transform: `rotate(${offsets[idx].rotate})`,
          }}
        >
          <SinCard {...sin} idx={idx} isTouch={isTouch} />
        </div>
      ))}
    </div>
  );
}
