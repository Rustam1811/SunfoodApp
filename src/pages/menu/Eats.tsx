import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonModal,
  IonButton,
} from '@ionic/react';

interface FoodProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  ingredients: string[];
  recommendation: string;
  image: string;
}

interface FoodCategory {
  id: number;
  title: string;
  image: string;
  products: FoodProduct[];
}

const foodCategories: FoodCategory[] = [
  {
    id: 1,
    title: 'Выпечка',
    image: 'https://source.unsplash.com/featured/?bakery',
    products: [
      {
        id: 101,
        name: 'Круассан с маслом',
        price: 250,
        description: 'Ароматный круассан с хрустящей корочкой и сливочным маслом.',
        ingredients: ['Мука', 'Масло', 'Дрожжи', 'Соль'],
        recommendation: 'Идеально сочетается с классическим эспрессо.',
        image: 'https://source.unsplash.com/featured/?croissant',
      },
      {
        id: 102,
        name: 'Маффин с ягодами',
        price: 300,
        description: 'Нежный маффин, наполненный свежими ягодами.',
        ingredients: ['Мука', 'Ягоды', 'Сахар', 'Яйца', 'Молоко'],
        recommendation: 'Рекомендуем с фильтр кофе.',
        image: 'https://source.unsplash.com/featured/?muffin',
      },
    ],
  },
  {
    id: 2,
    title: 'Сэндвичи',
    image: 'https://source.unsplash.com/featured/?sandwich',
    products: [
      {
        id: 201,
        name: 'Куриный сэндвич',
        price: 450,
        description: 'Сочный куриный сэндвич с овощами и соусом.',
        ingredients: ['Курица', 'Хлеб', 'Овощи', 'Соус'],
        recommendation: 'Отлично дополняется с лёгким салатом.',
        image: 'https://source.unsplash.com/featured/?chicken,sandwich',
      },
      {
        id: 202,
        name: 'Вегетарианский сэндвич',
        price: 400,
        description: 'Лёгкий сэндвич с овощами и хумусом.',
        ingredients: ['Хлеб', 'Овощи', 'Хумус'],
        recommendation: 'Идеален с зелёным чаем.',
        image: 'https://source.unsplash.com/featured/?veggie,sandwich',
      },
    ],
  },
  {
    id: 3,
    title: 'Десерты',
    image: 'https://source.unsplash.com/featured/?dessert',
    products: [
      {
        id: 301,
        name: 'Тирамису',
        price: 500,
        description: 'Классический итальянский десерт с кофе и маскарпоне.',
        ingredients: ['Кофе', 'Маскарпоне', 'Бисквит', 'Какао'],
        recommendation: 'Попробуйте с мятным латте.',
        image: 'https://source.unsplash.com/featured/?tiramisu',
      },
      {
        id: 302,
        name: 'Чизкейк',
        price: 480,
        description: 'Нежный чизкейк с хрустящей основой и ягодным соусом.',
        ingredients: ['Сыр', 'Печенье', 'Сливки', 'Ягоды'],
        recommendation: 'Рекомендуем с фильтр кофе.',
        image: 'https://source.unsplash.com/featured/?cheesecake',
      },
    ],
  },
  {
    id: 4,
    title: 'Завтраки',
    image: 'https://source.unsplash.com/featured/?breakfast',
    products: [
      {
        id: 401,
        name: 'Омлет с беконом',
        price: 350,
        description: 'Пушистый омлет с хрустящим беконом и свежими овощами.',
        ingredients: ['Яйца', 'Бекон', 'Овощи'],
        recommendation: 'Отличный выбор для энергичного утра.',
        image: 'https://source.unsplash.com/featured/?omelette',
      },
      {
        id: 402,
        name: 'Тост с авокадо',
        price: 320,
        description: 'Тост с кремообразным авокадо и яйцом-пашот.',
        ingredients: ['Хлеб', 'Авокадо', 'Яйцо', 'Помидоры'],
        recommendation: 'Рекомендуем с апельсиновым соком.',
        image: 'https://source.unsplash.com/featured/?avocado,toast',
      },
    ],
  },
];

const Eats: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<FoodProduct | null>(null);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-green-700">
          <IonTitle className="text-white">
            Выпечка, Сэндвичи, Десерты и Завтраки
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="bg-gray-50">
        <div className="px-4 py-4 grid grid-cols-2 gap-4">
          {foodCategories.map((category) => (
            <button
              key={category.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-all duration-200"
              onClick={() => setSelectedCategory(category)}
            >
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-24 object-cover"
                loading="lazy"
              />
              <div className="p-2">
                <p className="text-center text-lg font-medium text-gray-800">
                  {category.title}
                </p>
              </div>
            </button>
          ))}
        </div>

        <IonModal isOpen={!!selectedCategory} onDidDismiss={() => setSelectedCategory(null)}>
          <div className="h-full bg-white p-4 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedCategory?.title}</h2>
              <IonButton onClick={() => setSelectedCategory(null)}>Закрыть</IonButton>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {selectedCategory?.products.map((product) => (
                <button
                  key={product.id}
                  className="bg-gray-100 rounded-lg p-4 text-left shadow hover:scale-105 transition-all duration-200"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex items-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg mr-4"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-lg font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <p className="text-md font-bold text-green-700">{product.price} ₸</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </IonModal>

        <IonModal isOpen={!!selectedProduct} onDidDismiss={() => setSelectedProduct(null)}>
          <div className="h-full flex flex-col bg-amber-50">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-3xl font-bold text-amber-900">{selectedProduct?.name}</h2>
              <IonButton color="warning" onClick={() => setSelectedProduct(null)}>
                Закрыть
              </IonButton>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              <img
                src={selectedProduct?.image}
                alt={selectedProduct?.name}
                className="w-full h-56 object-cover rounded-lg mb-4"
                loading="lazy"
              />
              <p className="text-xl text-amber-800 mb-3">{selectedProduct?.description}</p>
              <p className="text-lg text-green-800 font-bold mb-3">
                Цена: {selectedProduct?.price} ₸
              </p>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-amber-900">Ингредиенты:</h3>
                <ul className="list-disc list-inside text-amber-800">
                  {selectedProduct?.ingredients.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900">Рекомендация:</h3>
                <p className="text-amber-800">{selectedProduct?.recommendation}</p>
              </div>
            </div>
            <div className="p-4">
              <IonButton expand="block" color="primary">
                Заказать и оплатить
              </IonButton>
              <p className="text-center text-sm text-gray-600 mt-2">
                Оплата: QR-код или Apple Pay
              </p>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Eats;
