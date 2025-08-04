import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, MinusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Используем те же данные, что и в клиентском меню
      const mockProducts: Product[] = [
        { id: 101, name: 'Эспрессо', price: 1188, category: 'coffee' },
        { id: 102, name: 'Американо', price: 1308, category: 'coffee' },
        { id: 103, name: 'Батч брю', price: 1308, category: 'coffee' },
        { id: 104, name: 'Лунго/Аэропресс', price: 2268, category: 'coffee' },
        { id: 105, name: 'Бариста сет', price: 3588, category: 'coffee' },
        { id: 301, name: 'Капучино', price: 1788, category: 'milk' },
        { id: 302, name: 'Латте', price: 1908, category: 'milk' },
        { id: 201, name: 'Кола бро клубника/черника', price: 1788, category: 'drinks' },
        { id: 202, name: 'Кардамоновый сироп', price: 1548, category: 'additives' },
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter(item => item.id !== productId);
      }
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      alert('Добавьте товары в заказ');
      return;
    }

    if (!customerPhone.trim()) {
      alert('Введите номер телефона клиента');
      return;
    }

    try {
      const orderData = {
        userId: customerPhone,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        amount: getTotalPrice(),
        bonusUsed: 0,
        bonusEarned: Math.floor(getTotalPrice() * 0.05), // 5% бонусов
        status: 'pending'
      };

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        alert('Заказ создан успешно!');
        setCart([]);
        setCustomerPhone('');
        onClose();
      } else {
        alert('Ошибка создания заказа');
      }
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      alert('Ошибка создания заказа');
    }
  };

  const groupedProducts = products.reduce((groups, product) => {
    const category = product.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as Record<string, Product[]>);

  const categoryNames: Record<string, string> = {
    coffee: 'Кофе',
    milk: 'Молочные напитки',
    drinks: 'Напитки',
    additives: 'Добавки',
    other: 'Другое'
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Левая панель - Меню */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Меню</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {categoryNames[category]}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categoryProducts.map((product) => (
                        <div
                          key={product.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <span className="text-lg font-bold text-blue-600">
                              {product.price}₽
                            </span>
                          </div>
                          {product.description && (
                            <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                          )}
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <PlusIcon className="h-4 w-4" />
                            Добавить
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Правая панель - Корзина */}
          <div className="w-80 bg-gray-50 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCartIcon className="h-6 w-6 text-gray-600" />
              <h3 className="text-lg font-semibold">Заказ</h3>
            </div>

            {/* Номер телефона клиента */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер телефона клиента
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Корзина */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Корзина пуста</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg p-3 border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <span className="text-sm font-semibold">{item.price}₽</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold">
                          {item.price * item.quantity}₽
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Итого и кнопка заказа */}
            {cart.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {getTotalPrice()}₽
                  </span>
                </div>
                <button
                  onClick={handleCreateOrder}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Создать заказ
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
