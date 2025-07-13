import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase'; // Убедитесь, что путь верный
import { collection, addDoc } from 'firebase/firestore';
import { UserIcon, PhoneIcon, CalendarDaysIcon, ClockIcon, UsersIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

// ===================================================================
//  СТИЛИЗОВАННЫЕ КОМПОНЕНТЫ ДЛЯ ФОРМЫ
// ===================================================================

const FormLabel = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 mb-2">
        {icon}
        {text}
    </label>
);

const FormInput = ({ error = null, ...props }: { error?: string | null, [key: string]: any }) => (
    <input
        {...props}
        className={`w-full p-3 bg-zinc-700/50 rounded-lg text-white placeholder-zinc-500 outline-none transition-all border border-zinc-700
            focus:bg-zinc-700 focus:ring-2 focus:ring-orange-500
            ${error ? 'ring-2 ring-red-500/80 border-transparent' : ''}`
        }
    />
);

const TimeSlotButton = ({ time, isActive, onClick }: { time: string, isActive: boolean, onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${
            isActive
                ? 'bg-white text-zinc-900 border-white shadow-lg scale-105'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-600'
        }`}
    >
        {time}
    </button>
);


// ===================================================================
//  ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ БРОНИРОВАНИЯ
// ===================================================================

const Booking: React.FC = () => {
    // ✨ ИСПРАВЛЕНО: Вся логика, состояния и хендлеры находятся внутри основного компонента
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [people, setPeople] = useState(1);
    
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [showThankYou, setShowThankYou] = useState(false);
    const [bookingDetails, setBookingDetails] = useState<any>(null);

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
            setName(''); setPhone(''); setDate(''); setTime(''); setPeople(1); setFormErrors({});
        } catch (error) {
            console.error('Ошибка бронирования:', error);
            setFormErrors({ submit: 'Ошибка при бронировании. Попробуйте снова.' });
        } finally {
            setLoading(false);
        }
    };

    if (showThankYou) {
        return (
            <div className="bg-zinc-900 min-h-screen flex flex-col items-center justify-center p-5 text-center font-sans">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
                    <div className="w-24 h-24 bg-emerald-900/50 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircleIcon className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white mt-6">Спасибо!</h1>
                    <p className="text-zinc-400 mt-2">Ваш столик успешно забронирован.</p>
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl shadow-lg p-6 mt-8 text-left space-y-3">
                        <div className="flex justify-between"><span className="text-zinc-400">Имя:</span><span className="font-bold text-white">{bookingDetails.name}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-400">Дата:</span><span className="font-bold text-white">{bookingDetails.date}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-400">Время:</span><span className="font-bold text-white">{bookingDetails.time}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-400">Гостей:</span><span className="font-bold text-white">{bookingDetails.people}</span></div>
                    </div>
                    <button onClick={() => setShowThankYou(false)} className="mt-8 w-full bg-zinc-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-zinc-600 transition-colors">
                        Забронировать еще
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 min-h-screen font-sans">
            <header className="p-5 sticky top-0 bg-zinc-900/70 backdrop-blur-lg z-10 border-b border-zinc-800">
                <h1 className="text-2xl font-extrabold text-white text-center">Бронь столика</h1>
            </header>
            <main className="p-5">
                <form onSubmit={handleBooking} className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl shadow-xl p-6 space-y-6">
                    <div>
                        <FormLabel icon={<UserIcon className="w-5 h-5 text-zinc-400"/>} text="Ваше имя" />
                        <FormInput type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Алекс" error={formErrors.name} />
                        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                        <FormLabel icon={<PhoneIcon className="w-5 h-5 text-zinc-400"/>} text="Контактный телефон" />
                        <FormInput type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (700) 123-45-67" error={formErrors.phone} />
                         {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <FormLabel icon={<CalendarDaysIcon className="w-5 h-5 text-zinc-400"/>} text="Дата" />
                           <FormInput type="date" value={date} onChange={e => setDate(e.target.value)} min={today} error={formErrors.date} style={{colorScheme: 'dark'}}/>
                           {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
                        </div>
                        <div>
                            <FormLabel icon={<UsersIcon className="w-5 h-5 text-zinc-400"/>} text="Гостей" />
                            <FormInput type="number" value={people} onChange={e => setPeople(Math.max(1, parseInt(e.target.value)))} min="1" />
                        </div>
                    </div>
                    <div>
                        <FormLabel icon={<ClockIcon className="w-5 h-5 text-zinc-400"/>} text="Время" />
                        <div className="grid grid-cols-4 gap-2">
                            {timeSlots.map(slot => <TimeSlotButton key={slot} time={slot} isActive={time === slot} onClick={() => setTime(slot)} />)}
                        </div>
                        {formErrors.time && <p className="text-red-500 text-xs mt-1">{formErrors.time}</p>}
                    </div>
                    <div className="pt-4">
                        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.95 }}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 disabled:opacity-70">
                            {loading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : "Забронировать"}
                        </motion.button>
                        {formErrors.submit && <p className="text-red-500 text-xs mt-2 text-center">{formErrors.submit}</p>}
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Booking;