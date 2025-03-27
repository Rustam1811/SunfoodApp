import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IonPage,
  IonContent,
  IonModal,
  IonButton
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { drinkCategories, DrinkCategory, Product, Recommendation } from './data/drinksData';
import { foodCategories } from './data/eatsData';
import { FiX } from 'react-icons/fi';

interface ExtendedProduct extends Product {
  recommendations?: Recommendation[];
}

const Drinks: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<DrinkCategory | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct | null>(null);
  const history = useHistory();

  const handleProductClick = (product: Product) => {
    setSelectedCategory(null);
    setTimeout(() => {
      setSelectedProduct(product as ExtendedProduct);
    }, 300);
  };

  const handleRecommendationClick = (rec: Recommendation) => {
    setSelectedProduct(null);
    setTimeout(() => {
      const allFoodProducts = foodCategories.flatMap(category => category.products);
      const fullProduct = allFoodProducts.find(product => product.id === rec.id);
      if (fullProduct) {
        setSelectedProduct(fullProduct as ExtendedProduct);
      } else {
        setSelectedProduct({
          id: rec.id,
          name: rec.title,
          image: rec.image,
          description: selectedProduct?.recommendation ?? '',
          price: 0,
          ingredients: [],
          recommendation: selectedProduct?.recommendation ?? '',
        });
      }
    }, 300);
  };

  const handleOrder = () => {
    if (selectedProduct) {
      const existingCart = localStorage.getItem('cart');
      let cart: ExtendedProduct[] = existingCart ? JSON.parse(existingCart) : [];
      cart.push(selectedProduct);
      localStorage.setItem('cart', JSON.stringify(cart));
      history.push('/order');
    }
  };

  return (
    <IonPage>
      <IonContent className="bg-gradient-to-b from-[#F5F5F5] to-[#FFFFFF] overflow-y-auto">
        {drinkCategories.length === 0 ? (
          <p className="text-center text-gray-700 mt-4">Категории напитков пока нет</p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="px-6 py-6 grid grid-cols-2 gap-6"
          >
            {drinkCategories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-lg"
                onClick={() => setSelectedCategory(category)}
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-40 object-cover rounded-t-3xl transform transition-all duration-300 hover:scale-110"
                  loading="lazy"
                />
                <div className="p-4">
                  <p className="text-center text-lg md:text-2xl font-semibold text-gray-800 break-words">
                    {category.title}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        <IonModal isOpen={!!selectedCategory} onDidDismiss={() => setSelectedCategory(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-[90%] max-w-md max-h-screen bg-white p-6 rounded-3xl shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 break-words">{selectedCategory?.title}</h2>
              <IonButton fill="clear" onClick={() => setSelectedCategory(null)}>
                <FiX size={28} className="text-gray-600" />
              </IonButton>
            </div>
            <div className="grid grid-cols-1 gap-6 pb-20">
              {selectedCategory?.products.map((product) => (
                <motion.button
                  key={product.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#F1F1F1] rounded-2xl p-4 text-left shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-xl mr-4 transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-xl font-semibold text-gray-800 break-words">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <p className="text-md font-bold text-green-500 mt-1">
                        {product.price} ₸
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </IonModal>

        <IonModal isOpen={!!selectedProduct} onDidDismiss={() => setSelectedProduct(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-h-[90vh] flex flex-col bg-white rounded-t-3xl shadow-2xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl md:text-3xl font-bold text-gray-800 break-words">{selectedProduct?.name}</h2>
              <IonButton fill="clear" onClick={() => setSelectedProduct(null)}>
                <FiX size={28} className="text-gray-600" />
              </IonButton>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <img
                src={selectedProduct?.image}
                alt={selectedProduct?.name}
                className="w-full h-56 object-cover rounded-2xl mb-6 shadow-lg transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
              <p className="text-xl text-gray-700 mb-4">{selectedProduct?.description}</p>
              <p className="text-lg text-green-500 font-bold mb-4">Цена: {selectedProduct?.price} ₸</p>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ингредиенты:</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {selectedProduct?.ingredients.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>
              {selectedProduct?.recommendations && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Рекомендации:</h3>
                  <div className="flex gap-4 overflow-x-auto">
                    {selectedProduct.recommendations.map((rec: Recommendation) => (
                      <button
                        key={rec.id}
                        onClick={() => handleRecommendationClick(rec)}
                        className="flex-shrink-0 text-center transform transition-all duration-300 hover:scale-105"
                      >
                        <img
                          src={rec.image}
                          alt={rec.title}
                          className="w-24 h-24 object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-110"
                        />
                        <p className="text-sm text-gray-700 mt-2 break-words">{rec.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200">
              <IonButton
                expand="block"
                onClick={handleOrder}
                className="text-lg font-semibold bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                Заказать и оплатить
              </IonButton>
              <p className="text-center text-sm text-gray-600 mt-3">
                Оплата: QR-код или Apple Pay
              </p>
            </div>
          </motion.div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Drinks;
