import React, { useEffect, useMemo, useState } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { DrinkGrid } from './DrinkGrid';
import { DrinkCategoryTab, DrinkItem } from './types';
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  categories: DrinkCategoryTab[];
  drinks: DrinkItem[]; // полный список
  initialCategory?: string;
  onSelectDrink: (id: string|number)=>void;
  loading?: boolean;
}

// Dark bottom sheet stub (will be expanded later)
const DarkConfiguratorSheet: React.FC<{ item: DrinkItem | null; onClose: ()=>void; }>=({ item, onClose })=>{
  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity:0 }}
            animate={{ opacity:0.55 }}
            exit={{ opacity:0 }}
            transition={{ duration:0.25 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y:'100%' }}
            animate={{ y:0 }}
            exit={{ y:'100%' }}
            transition={{ type:'spring', stiffness:460, damping:42 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-[#14181C] text-neutral-100 shadow-[0_-2px_16px_rgba(0,0,0,0.4)] overflow-hidden"
            style={{ maxHeight:'92vh' }}
          >
            {item && (
              <div className="relative w-full h-[48vh]">
                <motion.img
                  layoutId={`drink-img-${item.id}`}
                  src={item.image}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover object-center"/>
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-[#14181C]" />
                <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/35 backdrop-blur text-white text-xl flex items-center justify-center">×</button>
              </div>
            )}
            <div className="px-5 pb-8 -mt-4">
              <motion.h2 layoutId={`drink-card-${item?.id}`} className="text-lg font-semibold tracking-tight">{item?.name}</motion.h2>
              <p className="text-[13px] text-neutral-400 mt-1">настрой как любишь (β)</p>
              <div className="h-40 flex items-center justify-center text-neutral-500 text-xs">Configurator content…</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const MilkCoffeeMenu: React.FC<Props> = ({ categories, drinks, initialCategory, onSelectDrink, loading }) => {
  const [active, setActive] = useState(initialCategory || categories[0]?.key || '');
  const [openedId, setOpenedId] = useState<string | number | null>(null);
  const openedItem = useMemo(()=> drinks.find(d=>d.id===openedId) || null, [openedId, drinks]);
  const catIndex = categories.findIndex(c=>c.key===active);
  const filtered = useMemo(()=> drinks.filter(d => d.category === active), [drinks, active]);
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => { if (catIndex < categories.length -1) setActive(categories[catIndex+1].key); },
    onSwipedRight: () => { if (catIndex > 0) setActive(categories[catIndex-1].key); },
    trackMouse: false,
  });
  useEffect(()=>{ if (!categories.some(c=>c.key===active) && categories.length) setActive(categories[0].key); }, [categories, active]);

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-neutral-900 font-sans" {...swipeHandlers}>
      <CategoryTabs tabs={categories} active={active} onChange={setActive} />
      <h2 className="px-4 pt-4 text-[15px] font-semibold tracking-tight">Классика</h2>
      <DrinkGrid items={filtered} onSelect={(id)=>{ setOpenedId(id); onSelectDrink(id); }} loading={loading} />
      <DarkConfiguratorSheet item={openedItem} onClose={()=>setOpenedId(null)} />
    </div>
  );
};
