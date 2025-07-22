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
        // Получаем все промокоды пользователя
        const promoCodesSnapshot = await db.collection('promoCodes')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const promoCodes = promoCodesSnapshot.docs.map(doc => ({
            id: doc.id,
            code: doc.data().code,
            type: doc.data().type,
            discount: doc.data().discount,
            description: doc.data().description,
            isUsed: doc.data().isUsed,
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            expiresAt: doc.data().expiresAt instanceof Date
                ? doc.data().expiresAt.toISOString()
                : doc.data().expiresAt,
            bonusCost: doc.data().bonusCost || 0
        }));

        res.status(200).json(promoCodes);

    } catch (error) {
        console.error('Ошибка получения промокодов:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            details: error.message
        });
    }
};
