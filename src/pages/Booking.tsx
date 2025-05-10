import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore'; // 👈 Обязательно импорт

const Booking: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [people, setPeople] = useState(1);
  const [showThankYou, setShowThankYou] = useState(false);

  const timeSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

  const handleBooking = async () => {
    if (!name || !phone || !date || !time || people < 1) {
      alert('Заполните все поля. Гостей не может быть меньше 1');
      setPeople(people < 1 ? 1 : people);
      return;
    }

    try {
      await addDoc(collection(db, 'bookings'), {
        name,
        phone,
        date,
        time,
        people,
        createdAt: new Date(),
      });
      setShowThankYou(true);
      setName('');
      setPhone('');
      setDate('');
      setTime('');
      setPeople(1);
    } catch (error) {
      console.error('Ошибка бронирования:', error);
      alert('Ошибка при бронировании. Попробуйте снова.');
    }
  };

  return (
    <IonPage>
      <IonHeader className="bg-[#F5F5F5] shadow-md">
        <IonToolbar className="bg-[#F5F5F5]">
          <IonTitle className="text-xl font-bold text-black">Бронь столика</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-[#F5F5F5] min-h-screen font-[Inter]">
        <div className="max-w-xs mx-auto mt-8 bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-base font-semibold text-black mb-4 text-center">Забронировать столик</h2>

          {/* Поля ввода */}
          {/* Здесь оставь свою верстку как у тебя была */}
          {/* Просто добавь правильную функцию handleBooking на кнопку */}

          <button
            onClick={handleBooking}
            className="w-full py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition"
          >
            Забронировать
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Booking;
