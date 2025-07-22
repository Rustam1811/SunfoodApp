// api/test-bonus.js - Тестовый endpoint для проверки бонусной системы
const admin = require("firebase-admin");

if (!admin.apps.length) {
    try {
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
            });
        } else {
            const serviceAccount = require('../firebase-key.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
    } catch (error) {
        console.error('Ошибка инициализации Firebase:', error);
    }
}

const db = admin.firestore();

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        const userId = req.query.userId || '+77071234567';

        if (req.method === 'GET') {
            // Проверяем текущее состояние пользователя
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();

            const userData = userDoc.exists ? userDoc.data() : null;

            // Получаем заказы
            const ordersSnapshot = await db.collection('orders')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();

            const orders = ordersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString()
            }));

            // Получаем историю бонусов
            const bonusHistorySnapshot = await db.collection('bonusHistory')
                .where('userId', '==', userId)
                .orderBy('date', 'desc')
                .limit(10)
                .get();

            const bonusHistory = bonusHistorySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return res.status(200).json({
                userId,
                userData,
                orders,
                bonusHistory,
                message: 'Данные получены успешно'
            });
        }

        if (req.method === 'POST') {
            // Принудительно добавляем бонусы для тестирования
            const { amount = 100 } = req.body;

            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();

            const currentBalance = userDoc.exists ? (userDoc.data().bonusBalance || 0) : 0;
            const newBalance = currentBalance + amount;

            // Обновляем баланс
            await userRef.set({
                bonusBalance: newBalance,
                totalOrders: (userDoc.exists ? (userDoc.data().totalOrders || 0) : 0) + 1,
                level: 'Тестовый',
                lastOrderAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // Добавляем запись в историю
            await db.collection('bonusHistory').add({
                userId,
                type: 'earned',
                amount,
                description: 'Тестовое начисление бонусов',
                date: new Date().toISOString(),
                orderId: 'test-' + Date.now()
            });

            return res.status(200).json({
                success: true,
                message: `Добавлено ${amount} бонусов. Новый баланс: ${newBalance}`,
                oldBalance: currentBalance,
                newBalance,
                added: amount
            });
        }

        res.status(405).json({ error: 'Метод не поддерживается' });
    } catch (error) {
        console.error('Ошибка в test-bonus:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            details: error.message,
            stack: error.stack
        });
    }
};
