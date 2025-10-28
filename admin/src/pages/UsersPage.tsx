import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const levelColors = {
  'Новичок': 'bg-slate-100 text-slate-700',
  'Любитель': 'bg-emerald-100 text-emerald-700',
  'Эксперт': 'bg-indigo-100 text-indigo-700',
  'VIP': 'bg-amber-100 text-amber-700',
};

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(query(collection(db, 'users')));
      const ordersSnap = await getDocs(query(collection(db, 'orders')));
      const allOrders = ordersSnap.docs.map(d => ({id: d.id, ...d.data()}));
      
      const mapped = usersSnap.docs.map(d => {
        const data = d.data();
        const userId = d.id;
        const userOrders = allOrders.filter((o: any) => o.userId === userId);
        const ordersCount = userOrders.length;
        const totalSpent = userOrders.reduce((s: number, o: any) => s + (o.amount || o.totalAmount || 0), 0);
        const bp = data.bonusPoints || 0;
        let lvl = 'Новичок';
        if (bp >= 1000) lvl = 'VIP';
        else if (bp >= 500) lvl = 'Эксперт';
        else if (bp >= 100) lvl = 'Любитель';
        
        return {id: userId, email: data.email, name: data.name, phone: data.phone, avatar: data.avatar, ordersCount, bonusBalance: bp, totalSpent, level: lvl};
      });
      setUsers(mapped);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <motion.div className='min-h-screen bg-slate-50 p-6'>
      <div className='mb-6 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Пользователи ({users.length})</h1>
        <button onClick={fetchUsers} disabled={loading} className='px-4 py-2 bg-slate-900 text-white rounded-lg flex items-center gap-2'>
          <ArrowPathIcon className={'w-5 h-5' + (loading ? ' animate-spin' : '')} />
          Обновить
        </button>
      </div>
      {loading ? <div className='text-center py-20'>Загрузка...</div> : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {users.map(u => (
            <div key={u.id} className='bg-white p-5 rounded-3xl shadow-[0_16px_48px_-20px_rgba(0,0,0,0.35)] border border-slate-200'>
              <div className='flex gap-4 mb-4'>
                {u.avatar ? (
                  <img src={u.avatar} className='w-14 h-14 rounded-full object-cover border-2 border-slate-200' />
                ) : (
                  <div className='w-14 h-14 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center'>
                    <span className='text-xl font-bold text-slate-600'>{(u.name || u.email || '?')[0].toUpperCase()}</span>
                  </div>
                )}
                <div className='flex-1 min-w-0'>
                  <div className='flex justify-between mb-1'>
                    <h3 className='font-bold text-slate-900 truncate'>{u.name || u.email || u.id.slice(-6)}</h3>
                    <div className={'px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 ' + levelColors[u.level]}>
                      <TrophyIcon className='w-3.5 h-3.5' /> {u.level}
                    </div>
                  </div>
                  {u.email && <p className='text-xs text-slate-600 truncate'>📧 {u.email}</p>}
                  {u.phone && <p className='text-xs text-slate-600 truncate'>📱 {u.phone}</p>}
                </div>
              </div>
              <div className='text-xs space-y-1 border-t border-slate-200 pt-3'>
                <div className='flex justify-between'><span>Заказов:</span><span className='font-semibold text-slate-900'>{u.ordersCount}</span></div>
                <div className='flex justify-between'><span>Бонусов:</span><span className='font-semibold text-amber-600'>{u.bonusBalance} ₸</span></div>
                <div className='flex justify-between'><span>Потрачено:</span><span className='font-semibold text-emerald-600'>{u.totalSpent} ₸</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default UsersPage;
