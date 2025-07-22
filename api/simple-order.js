// api/simple-order.js - Упрощенная версия для тестирования
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
        if (req.method === "POST") {
            const { userId, items, amount, bonusUsed = 0 } = req.body;

            console.log('🔥 Получен заказ:', { userId, items, amount, bonusUsed });

            if (!userId || !Array.isArray(items) || typeof amount !== "number") {
                return res.status(400).json({ error: "Invalid body" });
            }

            // Простая логика без сложных транзакций
            const bonusEarned = Math.floor(amount * 0.1); // 10% для тестирования

            console.log('🔥 Рассчитано бонусов:', bonusEarned);

            // 1) Создаём заказ
            const orderRef = await db.collection("orders").add({
                userId,
                items,
                amount,
                bonusUsed,
                bonusEarned,
                status: 'pending',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log('🔥 Заказ создан:', orderRef.id);

            // 2) Получаем текущий баланс пользователя
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            const currentBalance = userDoc.exists ? (userDoc.data().bonusBalance || 0) : 0;

            console.log('🔥 Текущий баланс:', currentBalance);

            // 3) Обновляем баланс
            const newBalance = currentBalance + bonusEarned - bonusUsed;
            await userRef.set({
                bonusBalance: newBalance,
                totalOrders: userDoc.exists ? (userDoc.data().totalOrders || 0) + 1 : 1,
                level: 'Тестовый',
                lastOrderAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log('🔥 Новый баланс:', newBalance);

            // 4) Записываем в историю бонусов
            if (bonusEarned > 0) {
                await db.collection('bonusHistory').add({
                    userId: userId,
                    type: 'earned',
                    amount: bonusEarned,
                    description: `Заказ #${orderRef.id.slice(-6)}`,
                    date: new Date().toISOString(),
                    orderId: orderRef.id
                });
                console.log('🔥 История бонусов записана');
            }

            if (bonusUsed > 0) {
                await db.collection('bonusHistory').add({
                    userId: userId,
                    type: 'spent',
                    amount: bonusUsed,
                    description: `Оплата заказа #${orderRef.id.slice(-6)}`,
                    date: new Date().toISOString(),
                    orderId: orderRef.id
                });
                console.log('🔥 История трат записана');
            }

            console.log('🔥 Заказ обработан успешно');

            return res.status(200).json({
                success: true,
                bonusEarned,
                oldBalance: currentBalance,
                newBalance,
                orderId: orderRef.id,
                message: `Заказ оформлен! Начислено ${bonusEarned} бонусов`
            });
        }

        res.status(405).json({ error: 'Метод не поддерживается' });
    } catch (error) {
        console.error('🔥 Ошибка в simple-order:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            details: error.message,
            stack: error.stack
        });
    }
};
