import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonModal, IonButton } from '@ionic/react';
import { firestore } from '../firebase/firebase';

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
    await firestore.collection('bookings').add({
      name, phone, date, time, people, createdAt: new Date()
    });
    setShowThankYou(true);
    setName(''); setPhone(''); setDate(''); setTime(''); setPeople(1);
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

          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-gray-700 mb-1">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-0 py-1 rounded border border-gray-300 focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Телефон</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-0 py-1 rounded border border-gray-300 focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-0 py-1 rounded border border-gray-300 focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Время</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-0 py-1 rounded border border-gray-300 focus:ring-1 focus:ring-black"
              >
                <option value="">Выберите время</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Гостей</label>
              <input
                type="number"
                min={1}
                value={people}
                onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))}
                className="w-full px-0 py-1 rounded border border-gray-300 focus:ring-1 focus:ring-black"
              />
            </div>

            <button
              onClick={handleBooking}
              className="w-full py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition"
            >
              Забронировать
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Booking;
