const admin = require('firebase-admin');

// Инициализация Firebase Admin (если еще не инициализировано)
if (!admin.apps.length) {
    try {
        // Попробуем использовать base64 ключ из переменной окружения
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

// Функция для генерации промокода
const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'BONUS';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не поддерживается' });
    }

    const { userId, rewardId, amount } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId обязателен' });
    }

    try {
        // Получаем пользователя
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const userData = userDoc.data();
        const currentBalance = userData.bonusBalance || 0;

        let rewardData = null;
        let bonusCost = amount || 0;

        // Если указан rewardId, получаем данные награды
        if (rewardId) {
            const bonusSettingsDoc = await db.collection('settings').doc('bonusSettings').get();
            if (bonusSettingsDoc.exists) {
                const settings = bonusSettingsDoc.data();
                rewardData = settings.rewards?.find(r => r.id === rewardId);

                if (!rewardData) {
                    return res.status(404).json({ error: 'Награда не найдена' });
                }

                if (!rewardData.isActive) {
                    return res.status(400).json({ error: 'Награда неактивна' });
                }

                bonusCost = rewardData.cost;
            }
        }

        // Проверяем баланс
        if (currentBalance < bonusCost) {
            return res.status(400).json({
                error: 'Недостаточно бонусов',
                required: bonusCost,
                available: currentBalance
            });
        }

        // Генерируем промокод
        const promoCode = generatePromoCode();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // Действует 30 дней

        // Начинаем транзакцию
        await db.runTransaction(async (transaction) => {
            // Обновляем баланс пользователя
            const newBalance = currentBalance - bonusCost;
            transaction.update(userRef, { bonusBalance: newBalance });

            // Создаем промокод
            const promoRef = db.collection('promoCodes').doc(promoCode);
            transaction.set(promoRef, {
                code: promoCode,
                userId: userId,
                type: rewardData ? rewardData.type : 'fixed',
                discount: rewardData ? rewardData.discount : bonusCost,
                description: rewardData ? rewardData.name : `Скидка ${bonusCost} бонусов`,
                isUsed: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: expiryDate,
                bonusCost: bonusCost
            });

            // Записываем в историю бонусов
            const historyRef = db.collection('bonusHistory').doc();
            transaction.set(historyRef, {
                userId: userId,
                type: 'spent',
                amount: bonusCost,
                description: rewardData ? `Награда: ${rewardData.name}` : `Использование бонусов`,
                date: new Date().toISOString(),
                promoCode: promoCode,
                rewardId: rewardId || null
            });
        });

        res.status(200).json({
            success: true,
            message: 'Бонусы успешно использованы',
            promoCode: promoCode,
            discount: rewardData ? rewardData.discount : bonusCost,
            type: rewardData ? rewardData.type : 'fixed',
            expiresAt: expiryDate.toISOString(),
            newBalance: currentBalance - bonusCost
        });

    } catch (error) {
        console.error('Ошибка использования бонусов:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            details: error.message
        });
    }
};
