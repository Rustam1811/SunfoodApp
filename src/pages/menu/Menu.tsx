import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import Drinks from './Drinks';
import Eats from './Eats';

const Menu: React.FC = () => {
  // selectedTab определяет, какой раздел отображается
  const [selectedTab, setSelectedTab] = useState<'drinks' | 'eats'>('drinks');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-amber-700">
          <IonTitle className="text-white">Меню Starbucks</IonTitle>
        </IonToolbar>
        <div className="bg-amber-600">
          <div className="px-4 py-3 overflow-x-auto">
            <div className="flex space-x-6">
              <span
                onClick={() => setSelectedTab('drinks')}
                className={`cursor-pointer text-lg whitespace-nowrap ${
                  selectedTab === 'drinks'
                    ? 'text-amber-100 border-b-2 border-amber-100'
                    : 'text-amber-300'
                }`}
              >
                Напитки
              </span>
              <span
                onClick={() => setSelectedTab('eats')}
                className={`cursor-pointer text-lg whitespace-nowrap ${
                  selectedTab === 'eats'
                    ? 'text-amber-100 border-b-2 border-amber-100'
                    : 'text-amber-300'
                }`}
              >
                Выпечка и Завтраки
              </span>
            </div>
          </div>
        </div>
      </IonHeader>
      <IonContent className="bg-gray-50">
        {selectedTab === 'drinks' ? <Drinks /> : <Eats />}
      </IonContent>
    </IonPage>
  );
};

export default Menu;
