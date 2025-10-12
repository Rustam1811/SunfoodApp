import React, { useState } from 'react';
import { useInView } from '../../../hooks/useInView';

export interface PremiumDrinkBadge { type:string; label:string; color?:string; }
export interface PremiumDrinkItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  badges?: PremiumDrinkBadge[];
  energy?: number; protein?: number; fat?: number; carbs?: number;
  categoryId?: number; // added for category filtering
}

interface Props { item: PremiumDrinkItem; onOpen: (id: string|number)=>void; index?: number; prefersReduced?: boolean; }

export const DrinkCardPremiumImpl: React.FC<Props> = ({ item, onOpen }) => {
  const [loaded, setLoaded] = useState(false);
  const { ref, isInView } = useInView();

  return (
    <div ref={ref} style={{ minHeight: '280px' }}>
      {!isInView ? (
        <div className="w-full h-[280px] bg-gray-100 rounded-3xl" />
      ) : (
        <button
          onClick={() => onOpen(item.id)}
          data-fly-id={item.id}
          className="
            group relative flex flex-col
            w-full h-[280px] p-0
            bg-white
            rounded-3xl
            shadow-sm
            hover:shadow-lg
            active:scale-[0.98]
            border-0
            transition-all duration-100 ease-out
            focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
            overflow-hidden
          "
          style={{ contain: 'layout style paint', transform: 'translateZ(0)' }}
        >
      {/* Simple badge */}
      {item.badges && item.badges.length > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <div className="
            px-2 py-1
            bg-black
            text-white text-[9px] font-medium uppercase tracking-wider
            rounded-md
          ">
            {item.badges[0].label}
          </div>
        </div>
      )}

      {/* Image section - компактный */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-50">
          {/* Product image */}
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            width={280}
            height={280}
            onLoad={() => setLoaded(true)}
            style={{ aspectRatio: '1/1', transform: 'translateZ(0)' }}
            className={`
              w-full h-full object-cover
              transition-opacity duration-150
              ${loaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </div>
      </div>

      {/* Info section - компактный */}
      <div className="flex flex-col p-4 pt-2">
        <h3 className="
            text-sm font-semibold leading-tight
            text-black
            mb-2
            line-clamp-2
          "
        >
          {item.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-black">
            {item.price} ₸
          </span>
          
          {/* Minimal add button */}
          <div className="
            w-7 h-7 
            bg-black
            text-white
            rounded-full 
            flex items-center justify-center
            transition-all duration-200
            group-hover:scale-110
          ">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
        </div>
      </div>
        </button>
      )}
    </div>
  );
};

export const DrinkCardPremium = React.memo(DrinkCardPremiumImpl);
