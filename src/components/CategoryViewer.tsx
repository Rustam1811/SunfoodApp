import React, { useState } from "react";
import { Product } from "../../admin/types/types";
import { motion } from "framer-motion";

interface Props {
  title: string;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

const CategoryViewer: React.FC<Props> = ({ title, products, onSelectProduct }) => {
  const [mode, setMode] = useState<'carousel' | 'list'>('carousel');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const prev = () => setSelectedIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  const next = () => setSelectedIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));

  const getOffsetIndex = (i: number): number => {
    const diff = i - selectedIndex;
    if (diff > products.length / 2) return diff - products.length;
    if (diff < -products.length / 2) return diff + products.length;
    return diff;
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center px-4 mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          onClick={() => setMode(mode === 'carousel' ? 'list' : 'carousel')}
          className="text-sm text-blue-600 hover:underline"
        >
          {mode === 'carousel' ? '📋 Показать списком' : '🎠 Показать по одному'}
        </button>
      </div>

      {mode === 'carousel' ? (
        <div className="relative w-full h-[440px] overflow-hidden">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
            <button onClick={prev} className="bg-white shadow px-3 py-2 rounded-full">‹</button>
          </div>

          <div className="flex justify-center items-center h-full relative">
            {products.map((p, i) => {
              const offset = getOffsetIndex(i);
              if (Math.abs(offset) > 1) return null;

              const scale = offset === 0 ? 1 : 0.9;
              const opacity = offset === 0 ? 1 : 0.5;
              const zIndex = offset === 0 ? 20 : 10;
              const translateX = offset * 220;

              return (
                <motion.button
                  key={p.id}
                  onClick={() => onSelectProduct?.(p)}
                  className="absolute bg-transparent border-none outline-none"
                  style={{
                    transform: `translateX(${translateX}px) scale(${scale})`,
                    opacity,
                    zIndex,
                  }}
                >
                  <img
                    src={p.image}
                    alt={p.name.ru}
                    className="w-[260px] h-[260px] object-contain"
                  />
                </motion.button>
              );
            })}
          </div>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
            <button onClick={next} className="bg-white shadow px-3 py-2 rounded-full">›</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProduct?.(p)}
              className="bg-white rounded-2xl shadow p-4 cursor-pointer"
            >
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name.ru}
                  className="w-full h-40 object-cover rounded-xl mb-2"
                />
              )}
              <h3 className="text-lg font-semibold">{p.name.ru}</h3>
              <p className="text-gray-500 text-sm">{p.description?.ru}</p>
              <p className="font-bold mt-2">{p.price} ₸</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryViewer;
