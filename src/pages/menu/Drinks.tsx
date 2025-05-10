import React, { useEffect, useState } from 'react';
import { listenMenu }                   from '../../services/menuService';
import { DrinkCategoryLocal, Product }  from '../../../admin/types/types';
import { useCart }                      from '../CartContext';
import { useLanguage }                  from '../../contexts/LanguageContext';
import { IonModal, IonButton }          from '@ionic/react';
import { Swiper, SwiperSlide }          from 'swiper/react';
import { Pagination }                   from 'swiper/modules';
import { motion, AnimatePresence }      from 'framer-motion';
import { FiX }                          from 'react-icons/fi';
import 'swiper/css';
import 'swiper/css/pagination';

// Преобразование строки в числовой ID
function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function Drinks() {
  const [cats, setCats]            = useState<DrinkCategoryLocal[]|null>(null);
  const [view, setView]            = useState<'cats'|'prods'>('cats');
  const [selCat, setSelCat]        = useState<DrinkCategoryLocal|null>(null);
  const [selProd, setSelProd]      = useState<Product|null>(null);
  const [detailTab, setDetailTab]  = useState<'info'|'ings'|'recs'>('info');

  const { dispatch } = useCart();
  const { language } = useLanguage();

  useEffect(() => {
    const unsub = listenMenu(data => setCats(data));
    return () => unsub();
  }, []);

  if (!cats) {
    return (
      <div className="px-4 space-y-4">
        {[0,1,2].map(i => (
          <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  // 1️⃣ Карусель категорий
  if (view === 'cats') {
    return (
      <div className="relative pt-8 pb-12 overflow-hidden">
        <div className="absolute -top-20 left-0 w-full h-64 bg-coffee-accent rounded-b-full" />
        <Swiper
          modules={[Pagination]}
          slidesPerView={2.5}
          spaceBetween={16}
          centeredSlides
          pagination={{ clickable: true }}
          className="relative z-10 px-4"
        >
          {cats.map(cat => {
            const title = cat.title[language] || cat.title.ru;
            return (
              <SwiperSlide key={cat.id} className="!w-40">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  onClick={() => { setSelCat(cat); setView('prods'); }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full"
                >
                  <div className="w-full h-32 overflow-hidden">
                    <img
                      src={cat.image}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 flex-1 flex items-center justify-center">
                    <span className="text-center font-semibold">{title}</span>
                  </div>
                </motion.button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    );
  }

  // 2️⃣ Список продуктов
  if (view === 'prods' && selCat) {
    const catTitle = selCat.title[language] || selCat.title.ru;
    return (
      <>
        <div className="flex items-center justify-between px-4 mb-4">
          <button onClick={() => setView('cats')} className="text-lg">← Назад</button>
          <h2 className="text-2xl font-bold">{catTitle}</h2>
          <div style={{ width: 24 }} />
        </div>
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {selCat.products.map((prod, i) => {
              const name = prod.name[language] || prod.name.ru;
              const desc = prod.description
                ? prod.description[language] || prod.description.ru
                : '';
              return (
                <motion.button
                  key={prod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  exit={{ opacity: 0 }}
                  onClick={() => { setSelProd(prod); setDetailTab('info'); }}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col h-full hover:shadow-lg transition"
                >
                  <div className="aspect-w-4 aspect-h-5 overflow-hidden rounded-lg">
                    <img
                      src={prod.image}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="mt-3 font-semibold">{name}</h3>
                  <p className="text-sm text-gray-500 flex-1">{desc}</p>
                  <span className="mt-4 font-bold text-lg text-coffee-dark">
                    {prod.price} ₸
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </>
    );
  }

  // 3️⃣ Bottom-sheet модалка
  return (
    <IonModal isOpen={!!selProd} className="ion-modal-bottom">
      <div className="flex flex-col h-full bg-white">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold">
            {selProd?.name[language] || selProd?.name.ru}
          </h2>
          <IonButton fill="clear" onClick={() => setSelProd(null)}>
            <FiX size={24} />
          </IonButton>
        </div>
        <div className="p-4 overflow-y-auto flex-1 snap-y snap-mandatory">
          {detailTab === 'info' && selProd && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-coffee-accent rounded-full p-8">
                  <img
                    src={selProd.image}
                    alt={selProd.name[language] || selProd.name.ru}
                    className="w-40 h-40 object-cover rounded-full"
                  />
                </div>
              </div>
              <p className="text-gray-700">
                {selProd.description?.[language] || selProd.description?.ru}
              </p>
              <span className="block font-bold text-xl text-green-600">
                {language === 'en' ? 'Price:' : 'Цена:'} {selProd.price} ₸
              </span>
            </div>
          )}

          {detailTab === 'ings' && selProd?.ingredients && (
            <ul className="list-disc list-inside space-y-2">
              {selProd.ingredients[language].map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          )}

          {detailTab === 'recs' && selProd?.recommendations && (
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory">
              {selProd.recommendations.map(r => {
                const rname = r.name[language] || r.name.ru;
                return (
                  <div key={r.id} className="snap-center flex flex-col items-center">
                    <img
                      src={r.image}
                      alt={rname}
                      className="w-24 h-24 object-cover rounded-md mb-2"
                    />
                    <span>{rname}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <IonButton
            expand="block"
            className="bg-coffee-accent text-white py-3 font-semibold"
            onClick={() => selProd && dispatch({
              type: 'ADD_ITEM',
              payload: {
                id: hashStringToNumber(selProd.id),
                name: selProd.name[language] || selProd.name.ru,
                price: selProd.price,
                quantity: 1,
                image: selProd.image
              }
            })}
          >
            {language === 'en'
              ? 'Add to Order'
              : language === 'kz'
              ? 'Себетке қосу'
              : 'Заказать и оплатить'}
          </IonButton>
        </div>
      </div>
    </IonModal>
  );
}
