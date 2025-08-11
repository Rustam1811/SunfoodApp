import React from 'react';
import { useMemo } from 'react';

interface FlySpriteProps {
  id: number;
  x: number; y: number;
  scale: number;
  opacity: number;
  image?: string;
}
const FlySprite: React.FC<FlySpriteProps> = ({ x, y, scale, opacity, image }) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        width: 48,
        height: 48,
        pointerEvents: 'none',
        transform: `translate(-50%, -50%) scale(${scale})`,
        transition: 'none',
        opacity,
        zIndex: 2000,
        borderRadius: 16,
        background: 'var(--color-bg-elev-1)',
        boxShadow: 'var(--shadow-float)',
        overflow: 'hidden'
      }}
    >
      {image && <img src={image} alt="fly" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
    </div>
  );
};

interface Item { id: number; startX: number; startY: number; endX: number; endY: number; progress: number; image?: string; }
interface LayerProps { items: Item[]; }

export const FlyToCartLayer: React.FC<LayerProps> = ({ items }) => {
  const sprites = useMemo(() => items.map(it => {
    const p = it.progress;
    const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    const x = it.startX + (it.endX - it.startX) * eased; // eased x
    const midLift = -120;
    const yArc = it.startY + (it.endY - it.startY) * eased + (1 - eased) * midLift * (1 - p);
    // Impact bounce near end
    const impactZone = p > 0.85 ? (p - 0.85) / 0.15 : 0; // 0..1
    const scale = (1 - 0.4 * p) * (1 + (impactZone ? (0.12 * Math.sin(impactZone * Math.PI)) : 0));
    const opacity = 1 - 0.1 * p;
    return { id: it.id, x, y: yArc, scale, opacity, image: it.image };
  }), [items]);

  return <>{sprites.map(sp => <FlySprite key={sp.id} {...sp} />)}</>;
};
