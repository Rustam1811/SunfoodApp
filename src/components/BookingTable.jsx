import React, { useState } from 'react';
const initialTables = [
    { id: 1, status: 'free' },
    { id: 2, status: 'occupied' },
    { id: 3, status: 'reserved' },
    { id: 4, status: 'free' },
];
const BookingTable = () => {
    const [tables, setTables] = useState(initialTables);
    const [selectedId, setSelectedId] = useState(null);
    const [isBooking, setIsBooking] = useState(false);
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const handleSelect = async (table) => {
        if (table.status !== 'free') {
            alert('Столик занят или уже забронирован, выберите другой, пожалуйста.');
            return;
        }
        setSelectedId(table.id);
    };
    const handleConfirm = async () => {
        if (!selectedId)
            return;
        if (!user) {
            alert('Для бронирования необходимо войти в систему.');
            return;
        }
        setIsBooking(true);
        const success = await bookTable(selectedId, user.phone); // ✅ используем номер
        if (success) {
            alert(`Столик ${selectedId} успешно забронирован!`);
            setTables(tables.map(t => t.id === selectedId ? { ...t, status: 'reserved' } : t));
            setSelectedId(null);
        }
        else {
            alert('Ошибка бронирования. Попробуйте позже.');
        }
        setIsBooking(false);
    };
    return (<div className="p-4">
      <h2 className="text-xl font-bold mb-4">Выберите столик</h2>
      <div className="grid grid-cols-2 gap-4">
        {tables.map(table => (<div key={table.id} onClick={() => handleSelect(table)} className={`p-4 border rounded cursor-pointer text-center transition-transform transform hover:scale-105
              ${table.status === 'free' ? 'bg-green-100' : table.status === 'occupied' ? 'bg-red-100' : 'bg-yellow-100'} 
              ${selectedId === table.id ? 'ring-4 ring-blue-500' : ''}`}>
            <p>Столик {table.id}</p>
            <p>
              {table.status === 'free'
                ? 'Свободен'
                : table.status === 'occupied'
                    ? 'Занят'
                    : 'Забронирован'}
            </p>
          </div>))}
      </div>
      {selectedId && (<div className="mt-4 p-2 bg-blue-100 rounded flex items-center justify-between">
          <span>Вы выбрали столик {selectedId}. Подтвердите бронирование.</span>
          <button onClick={handleConfirm} disabled={isBooking} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            {isBooking ? 'Бронируется...' : 'Подтвердить'}
          </button>
        </div>)}
    </div>);
};
export default BookingTable;
// your firebase functions here
export async function bookTable(tableId, phone) {
    // Implement your booking logic here, e.g., update Firestore or Realtime Database
    // Return true if booking is successful, false otherwise
    try {
        // Example: await db.collection('tables').doc(tableId.toString()).update({ status: 'reserved', reservedBy: phone });
        return true;
    }
    catch (error) {
        return false;
    }
}
// other exports
