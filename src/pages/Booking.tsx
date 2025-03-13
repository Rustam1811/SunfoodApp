import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import BookingTable from '../components/BookingTable';

const Booking: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Бронирование</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <BookingTable />
      </IonContent>
    </IonPage>
  );
};

export default Booking;
