import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface LazyImageProps {
  src: string;
  alt?: string;
  className?: string;
  layoutId?: string;
  rounded?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, alt = '', className = '', layoutId, rounded='rounded-xl' }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { setInView(true); io.disconnect(); } });
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`relative ${className}`}> 
      {!loaded && <div className={`absolute inset-0 ${rounded} bg-[var(--color-bg-elev-2)] animate-pulse overflow-hidden`}> 
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.5),transparent)] animate-[shimmer_1.3s_infinite] bg-[length:200%_100%]" />
      </div>}
      {inView && (
        <motion.img
          layoutId={layoutId}
            src={src}
            alt={alt}
            onLoad={() => setLoaded(true)}
            className={`relative ${rounded} w-full h-full object-cover transition duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 blur-md'}`}
        />
      )}
    </div>
  );
};
