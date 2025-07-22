const admin = require('firebase-admin');

// Инициализация Firebase Admin (если еще не инициализировано)
if (!admin.apps.length) {
    try {
        // Попробуем использовать base64 ключ из переменной окружения (как в orders.js)
        const b64 = process.env.FIREBASE_KEY_BASE64;
        if (b64) {
            const serviceAccount = JSON.parse(
                Buffer.from(b64, "base64").toString("utf8")
            );
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
            }
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://sunfoodapp-default-rtdb.firebaseio.com/"
            });
        } else {
            // Fallback на локальный файл
            const serviceAccount = require('../firebase-key.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://sunfoodapp-default-rtdb.firebaseio.com/"
            });
        }
    } catch (error) {
        console.error('Ошибка инициализации Firebase Admin:', error);
    }
}

const db = admin.firestore();

// Функция для расчета уровня пользователя
const calculateUserLevel = (totalOrders) => {
    if (totalOrders >= 100) return { level: 'VIP', next: null, ordersToNext: 0 };
    if (totalOrders >= 50) return { level: 'Эксперт', next: 'VIP', ordersToNext: 100 - totalOrders };
    if (totalOrders >= 10) return { level: 'Любитель', next: 'Эксперт', ordersToNext: 50 - totalOrders };
    return { level: 'Новичок', next: 'Любитель', ordersToNext: 10 - totalOrders };
};

// Функция для расчета множителя бонусов
const getMultiplier = (level) => {
    const multipliers = {
        'Новичок': 1.0,
        'Любитель': 1.2,
        'Эксперт': 1.5,
        'VIP': 2.0
    };
    return multipliers[level] || 1.0;
};

module.exports = async (req, res) => {
    // CORS заголовки
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Метод не поддерживается' });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'userId обязателен' });
    }

    try {
        // Получаем документ пользователя
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        let userData = {};
        if (userDoc.exists) {
            userData = userDoc.data();
        }

        // Получаем заказы пользователя для подсчета
        const ordersSnapshot = await db.collection('orders')
            .where('phone', '==', userId)
            .orderBy('timestamp', 'desc')
            .get();

        const orders = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const totalOrders = orders.length;
        const levelInfo = calculateUserLevel(totalOrders);
        const multiplier = getMultiplier(levelInfo.level);

        // Получаем историю бонусных операций
        const bonusHistorySnapshot = await db.collection('bonusHistory')
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .limit(20)
            .get();

        const history = bonusHistorySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Вычисляем статистику за месяц
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const thisMonthHistory = history.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        });

        const earnedThisMonth = thisMonthHistory
            .filter(item => item.type === 'earned')
            .reduce((sum, item) => sum + item.amount, 0);

        const spentThisMonth = thisMonthHistory
            .filter(item => item.type === 'spent')
            .reduce((sum, item) => sum + item.amount, 0);

        // Подготавливаем данные для ответа
        const bonusData = {
            balance: userData.bonusBalance || 0,
            level: levelInfo.level,
            nextLevel: levelInfo.next,
            ordersToNextLevel: levelInfo.ordersToNext,
            totalOrders,
            multiplier,
            earnedThisMonth,
            spentThisMonth,
            history: history.map(item => ({
                id: item.id,
                type: item.type,
                amount: item.amount,
                description: item.description || `Заказ #${item.orderId || 'Unknown'}`,
                date: item.date
            }))
        };

        res.status(200).json(bonusData);

    } catch (error) {
        console.error('Ошибка получения бонусных данных:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            details: error.message
        });
    }
};
