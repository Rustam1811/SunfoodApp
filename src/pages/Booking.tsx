import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase'; // Убедитесь, что путь верный
import { collection, addDoc } from 'firebase/firestore';
import { FiUser, FiPhone, FiCalendar, FiClock, FiUsers, FiCheckCircle, FiLoader } from 'react-icons/fi';

// ===================================================================
//  СТИЛИЗОВАННЫЕ КОМПОНЕНТЫ ДЛЯ ФОРМЫ
// ===================================================================

const FormLabel = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
        {icon}
        {text}
    </label>
);

const FormInput = ({ error, ...props }) => (
    <input
        {...props}
        className={`w-full p-3 bg-slate-200/70 rounded-lg text-slate-900 placeholder-slate-400 outline-none transition-all
            focus:bg-white focus:ring-2 focus:ring-orange-400
            ${error ? 'ring-2 ring-red-400' : 'ring-1 ring-transparent'}`
        }
    />
);

const TimeSlotButton = ({ time, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${
            isActive
                ? 'bg-slate-800 text-white border-slate-800 shadow-md scale-105'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
        }`}
    >
        {time}
    </button>
);


// ===================================================================
//  ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ БРОНИРОВАНИЯ
// ===================================================================

const Booking: React.FC = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [people, setPeople] = useState(1);
    
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [showThankYou, setShowThankYou] = useState(false);
    const [bookingDetails, setBookingDetails] = useState<any>(null);

    // ✨ НОВАЯ ФИЧА: Устанавливаем минимальную дату на сегодня
    const today = new Date().toISOString().split('T')[0];

    const timeSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!name.trim()) errors.name = "Имя обязательно";
        if (!phone.trim()) errors.phone = "Телефон обязателен";
        if (!date) errors.date = "Выберите дату";
        if (!time) errors.time = "Выберите время";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        const newBooking = { name, phone, date, time, people, createdAt: new Date() };

        try {
            await addDoc(collection(db, 'bookings'), newBooking);
            
            setBookingDetails(newBooking);
            setShowThankYou(true);
            
            // Сброс формы
            setName('');
            setPhone('');
            setDate('');
            setTime('');
            setPeople(1);
            setFormErrors({});

        } catch (error) {
            console.error('Ошибка бронирования:', error);
            setFormErrors({ submit: 'Ошибка при бронировании. Попробуйте снова.' });
        } finally {
            setLoading(false);
        }
    };

    if (showThankYou) {
        return (
            <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-5 text-center font-sans">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                        <FiCheckCircle size={48} className="text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mt-6">Спасибо!</h1>
                    <p className="text-slate-600 mt-2">Ваш столик успешно забронирован.</p>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 text-left space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Имя:</span>
                            <span className="font-bold text-slate-800">{bookingDetails.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Дата:</span>
                            <span className="font-bold text-slate-800">{bookingDetails.date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Время:</span>
                            <span className="font-bold text-slate-800">{bookingDetails.time}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">Гостей:</span>
                            <span className="font-bold text-slate-800">{bookingDetails.people}</span>
                        </div>
                    </div>

                    <button onClick={() => setShowThankYou(false)} className="mt-8 w-full bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg">
                        Забронировать еще
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <header className="p-5">
                <h1 className="text-3xl font-extrabold text-slate-900 text-center">Бронь столика</h1>
            </header>

            <main className="p-5">
                <form onSubmit={handleBooking} className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
                    
                    <div>
                        <FormLabel icon={<FiUser />} text="Ваше имя" />
                        <FormInput type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Алекс" error={formErrors.name} />
                        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                        <FormLabel icon={<FiPhone />} text="Контактный телефон" />
                        <FormInput type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (700) 123-45-67" error={formErrors.phone} />
                         {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <FormLabel icon={<FiCalendar />} text="Дата" />
                           {/* ✨ НОВАЯ ФИЧА: Запрет на выбор прошедших дат */}
                           <FormInput type="date" value={date} onChange={e => setDate(e.target.value)} min={today} error={formErrors.date} />
                           {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
                        </div>
                        <div>
                            <FormLabel icon={<FiUsers />} text="Гостей" />
                            <FormInput type="number" value={people} onChange={e => setPeople(Math.max(1, parseInt(e.target.value)))} min="1" />
                        </div>
                    </div>
                    
                    <div>
                        <FormLabel icon={<FiClock />} text="Время" />
                        {/* ✨ НОВАЯ ФИЧА: Интерактивный выбор времени */}
                        <div className="grid grid-cols-4 gap-2">
                            {timeSlots.map(slot => <TimeSlotButton key={slot} time={slot} isActive={time === slot} onClick={() => setTime(slot)} />)}
                        </div>
                        {formErrors.time && <p className="text-red-500 text-xs mt-1">{formErrors.time}</p>}
                    </div>

                    <div className="pt-4">
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {loading ? <FiLoader className="animate-spin" /> : "Забронировать"}
                        </motion.button>
                        {formErrors.submit && <p className="text-red-500 text-xs mt-2 text-center">{formErrors.submit}</p>}
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Booking;