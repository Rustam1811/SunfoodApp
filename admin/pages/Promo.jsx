import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
const Promo = () => {
    const { user } = useContext(UserContext);
    const promos = [
        { id: 1, title: 'Счастливые часы', description: 'Скидка на все напитки с 14:00 до 16:00', discount: '15%' },
        { id: 2, title: 'Утреннее предложение', description: 'Кофе + круассан по спец. цене', discount: '₸800' },
        { id: 3, title: 'Акция выходного дня', description: 'Скидка 20% на кофе по субботам', discount: '20%' },
    ];
    return (<div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Акции и промо</h1>
        {(user.role === 'owner' || user.role === 'admin') && (<button className="bg-green-600 text-white px-4 py-2 rounded-2xl shadow">
            Добавить акцию
          </button>)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {promos.map((promo) => (<div key={promo.id} className="bg-white rounded-2xl p-4 shadow flex flex-col justify-between">
            <div>
              <p className="text-lg font-medium">{promo.title}</p>
              {promo.description && <p className="text-sm text-gray-500 mt-1">{promo.description}</p>}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xl font-bold">{promo.discount}</span>
              {(user.role === 'owner' || user.role === 'admin') && (<div className="space-x-2">
                  <button className="text-blue-600 hover:underline text-sm">Ред.</button>
                  <button className="text-red-600 hover:underline text-sm">Удал.</button>
                </div>)}
            </div>
          </div>))}
      </div>
    </div>);
};
export default Promo;
// Как сделать ещё круче:
// 1. Интегрировать календарь (@headlessui/react Datepicker) для выбора периодов акции.
// 2. Добавить визуализацию статистики использования акции через графики (Recharts).
// 3. Разбить список акций на активные и завершённые с помощью табов.
// 4. Подключить React Query для работы с API и управления кешированием.
// 5. Внедрить drag-and-drop для сортировки приоритетов акций (react-beautiful-dnd).
