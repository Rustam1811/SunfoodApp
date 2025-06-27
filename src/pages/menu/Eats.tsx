// src/pages/menu/Eats.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IonPage,
  IonContent,
  IonModal,
  IonButton,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  foodCategories,
  FoodCategory,
  FoodProduct,
  Recommendation,
} from './data/eatsData';
import { drinkCategories } from './data/drinksData';
import { useCart } from '../CartContext';
import { CartItem } from '../CartContext';
import { FiX } from 'react-icons/fi';

interface ExtendedFoodProduct extends FoodProduct {
  recommendations?: Recommendation[];
}

const Eats: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ExtendedFoodProduct | null>(null);
  const { dispatch } = useCart();
  const history = useHistory();

  // открыли категорию
  const handleCategoryClick = (category: FoodCategory) => {
    setSelectedCategory(category);
  };

  // клик по продукту — показываем детали
  const handleProductClick = (product: FoodProduct) => {
    setSelectedCategory(null);
    setTimeout(() => {
      setSelectedProduct({
        ...product,
        recommendations: (product as any).recommendations ?? [],
      });
    }, 300);
  };

  // клик по рекомендации — переключаем продукт
  const handleRecommendationClick = (rec: Recommendation) => {
    setSelectedProduct(null);
    setTimeout(() => {
      const allDrinks: FoodProduct[] = drinkCategories.flatMap(cat => cat.products);
      const found = allDrinks.find(p => p.id === rec.id);
      if (found) {
        setSelectedProduct({
          ...found,
          recommendations: (found as any).recommendations ?? [],
        });
      } else {
        setSelectedProduct({
          id: rec.id,
          name: rec.title,
          price: 0,
          description: rec.title,
          ingredients: [],
          recommendation: rec.title,
          image: rec.image,
          recommendations: [],
        });
      }
    }, 300);
  };

  // заказ товара — кладём в корзину и идём на /order
  const handleOrder = () => {
    if (!selectedProduct) return;
    const item: CartItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: 1,
      image: selectedProduct.image,
    };
    dispatch({ type: 'ADD_ITEM', payload: item });
    history.push('/order');
  };

  return (
    <IonPage>
      <IonContent className="bg-gradient-to-b">
        {/* Сетка категорий */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="px-6 py-6 grid grid-cols-2 gap-6"
        >
          {foodCategories.map(cat => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
              onClick={() => handleCategoryClick(cat)}
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-32 object-cover"
              />
              <div className="p-4">
                <p className="text-center text-xl font-semibold">{cat.title}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Модалка категорий */}
        <IonModal isOpen={!!selectedCategory} onDidDismiss={() => setSelectedCategory(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-[90%] max-w-md bg-white p-6 rounded-2xl shadow-2xl overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">{selectedCategory?.title}</h2>
              <IonButton fill="clear" onClick={() => setSelectedCategory(null)}>
                <FiX size={28} />
              </IonButton>
            </div>
            <div className="grid gap-4">
              {selectedCategory?.products.map(prod => (
                <motion.button
                  key={prod.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gray-100 rounded-2xl p-4 shadow-md"
                  onClick={() => handleProductClick(prod)}
                >
                  <div className="flex items-center">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-20 h-20 object-cover rounded-xl mr-4"
                    />
                    <div>
                      <p className="text-xl font-semibold">{prod.name}</p>
                      <p className="text-sm text-gray-600">{prod.description}</p>
                      <p className="text-green-500 font-bold">{prod.price} ₸</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </IonModal>

        {/* Модалка деталей продукта */}
        <IonModal isOpen={!!selectedProduct} onDidDismiss={() => setSelectedProduct(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-h-[90vh] bg-white rounded-t-3xl shadow-2xl flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">{selectedProduct?.name}</h2>
              <IonButton fill="clear" onClick={() => setSelectedProduct(null)}>
                <FiX size={28} />
              </IonButton>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <img
                src={selectedProduct?.image}
                alt={selectedProduct?.name}
                className="w-full h-56 object-cover rounded-2xl mb-6"
              />
              <p className="text-gray-700 mb-4">{selectedProduct?.description}</p>
              <p className="text-xl font-bold text-green-500 mb-4">
                Цена: {selectedProduct?.price} ₸
              </p>
              <h3 className="font-semibold mb-2">Ингредиенты:</h3>
              <ul className="list-disc list-inside mb-6">
                {selectedProduct?.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
              {selectedProduct?.recommendations?.length && (
                <>
                  <h3 className="font-semibold mb-2">Рекомендации:</h3>
                  <div className="flex gap-4 overflow-x-auto mb-6">
                    {selectedProduct.recommendations.map(rec => (
                      <button
                        key={rec.id}
                        onClick={() => handleRecommendationClick(rec)}
                      >
                        <img
                          src={rec.image}
                          alt={rec.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <p className="text-sm text-center">{rec.title}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t">
              <IonButton
                expand="block"
                onClick={handleOrder}
                className="bg-gradient-to-r from-green-400 to-green-600 text-white"
              >
                Заказать и оплатить
              </IonButton>
              <p className="text-center text-sm text-gray-600 mt-2">
                Оплата: QR‑код или Apple Pay
              </p>
            </div>
          </motion.div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Eats;
