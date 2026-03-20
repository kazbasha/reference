import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

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
  const [hovered, setHovered] = useState(false);
  const filterId = `edges-${idx}`;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-9,  9]), { stiffness: 300, damping: 28 });
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [ 7, -7]), { stiffness: 300, damping: 28 });
  const scale   = useSpring(hovered ? 1.04 : 1, { stiffness: 260, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return;
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width  - 0.5);
    mouseY.set((e.clientY - r.top)  / r.height - 0.5);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      style={{ perspective: isTouch ? 'none' : '700px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !isTouch && setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 1200)}
    >
      {/* Edge-detection filter — only on non-touch */}
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

      <motion.div
        style={isTouch
          ? { scale, position: 'relative' }
          : { rotateX, rotateY, scale, position: 'relative' }
        }
        className="cursor-none"
      >
        {/* Subtle glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            boxShadow: hovered
              ? '0 0 28px 6px rgba(152,110,223,0.4), 0 0 60px 12px rgba(152,110,223,0.15)'
              : '0 0 0px 0px rgba(152,110,223,0)',
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Normal image — fades out on hover */}
        <motion.img
          src={src}
          alt={alt}
          className="block w-full h-auto"
          animate={{ opacity: hovered ? 0 : 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Purple multiply overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: '#986edf',
            mixBlendMode: 'multiply',
            opacity: hovered ? 0 : 0.35,
            transition: 'opacity 0.5s ease',
          }}
        />

        {/* Edge-only image — desktop only */}
        {!isTouch && (
          <motion.img
            src={src}
            alt={alt}
            aria-hidden="true"
            className="block w-full h-auto"
            style={{
              position: 'absolute',
              inset: 0,
              mixBlendMode: 'screen',
              filter: `url(#${filterId})`,
            }}
            animate={{ opacity: hovered ? 0.9 : 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
        )}

        {/* Reveal text */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none p-6"
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: hovered ? 0.15 : 0 }}
        >
          <span
            style={{
              fontFamily: '"ObviouslyWide", system-ui, sans-serif',
              fontSize: 'clamp(8px, 1vw, 14px)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              lineHeight: 1.2,
              color: '#1a1a1a',
              textAlign: 'center',
              whiteSpace: 'pre-line',
            }}
          >
            {text}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function CreativeSins() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(!window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center bg-transparent w-full max-w-4xl mx-auto px-6">
      {sins.map((sin, idx) => (
        <div
          key={sin.src}
          className="w-full md:w-1/3"
          style={{
            maxWidth: offsets[idx].maxW,
            transform: `rotate(${offsets[idx].rotate}) translateY(${offsets[idx].translateY})`,
          }}
        >
          <SinCard {...sin} idx={idx} isTouch={isTouch} />
        </div>
      ))}
    </div>
  );
}
