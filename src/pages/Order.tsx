import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import BonusSystem from '../components/BonusSystem';

const Order: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Заказ</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
      
        <BonusSystem />
      </IonContent>
    </IonPage>
  );
};

export default Order;
