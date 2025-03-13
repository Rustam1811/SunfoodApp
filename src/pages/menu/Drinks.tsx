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
import { drinkCategories, DrinkCategory, Product } from './data/drinksData';

const Drinks: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<DrinkCategory | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const openCategory = (category: DrinkCategory) => {
        setIsAnimating(true);
        setTimeout(() => {
            setSelectedCategory(category);
            setIsAnimating(false);
        }, 200); 
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar className="bg-green-700">
                    <IonTitle className="text-white">Напитки</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="bg-gray-50 overflow-y-auto">
                <div className="px-4 py-4 grid grid-cols-2 gap-4">
                    {drinkCategories.map((category) => (
                        <button
                            key={category.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-all duration-200"
                            onClick={() => openCategory(category)}
                        >
                            <img
                                src={category.image}
                                alt={category.title}
                                className="w-full h-24 object-cover"
                                loading="lazy"
                            />
                            <div className="p-2">
                                <p className="text-center text-lg font-medium text-gray-800">{category.title}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <IonModal
                    isOpen={!!selectedCategory && !isAnimating}
                    onDidDismiss={() => setSelectedCategory(null)}
                    className="transition-opacity duration-300 ease-in-out"
                >
                    <div className="w-[90%] max-w-md max-h-screen bg-white p-4 overflow-y-auto rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{selectedCategory?.title}</h2>
                            <IonButton onClick={() => setSelectedCategory(null)}>Закрыть</IonButton>
                        </div>
                        <div className="grid grid-cols-1 gap-4 pb-20">
                            {selectedCategory?.products.map((product) => (
                                <button
                                    key={product.id}
                                    className="bg-gray-100 rounded-lg p-4 text-left shadow hover:scale-105 transition-all duration-200"
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setTimeout(() => setSelectedProduct(product), 300);
                                    }}
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

export default Drinks;
