// src/pages/Home.tsx
import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="bg-green-800">
        <IonToolbar>
          <IonTitle className="text-white">Starbucks</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="bg-gray-100">
        
        <div className="relative">
          <img
            src="https://source.unsplash.com/featured/?coffee,starbucks"
            alt="Coffee Banner"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-2xl font-bold text-white">Добро пожаловать в Sunfood!</h1>
          </div>
        </div>
        <div className="bg-green-200 p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Special</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src="https://imageproxy.wolt.com/menu/menu-images/611e47cdfd7110b1ffc868c6/181c4058-df73-11ed-82bd-9a5933180c6e______.jpeg"
                alt="Caramel Latte"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-xl">Caramel Latte</h3>
                <p className="text-gray-600">A delicious blend of coffee and caramel.</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src="https://source.unsplash.com/featured/?espresso"
                alt="Rich Espresso"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-xl">Rich Espresso</h3>
                <p className="text-gray-600">Bold and intense, perfect for a quick boost.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Favorites</h2>
          <div className="flex space-x-4 overflow-x-auto p-2">
            <div className="min-w-[200px] bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src="/images/photo_2025-03-12_16-13-00.jpg"
                alt="Iced Coffee"
                className="w-full h-32 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">Iced Coffee</h3>
              </div>
            </div>
            <div className="min-w-[200px] bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src="https://source.unsplash.com/featured/?milk-coffee"
                alt="Milk Coffee"
                className="w-full h-32 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">Milk Coffee</h3>
              </div>
            </div>
            <div className="min-w-[200px] bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src="https://source.unsplash.com/featured/?tea"
                alt="Herbal Tea"
                className="w-full h-32 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">Herbal Tea</h3>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
