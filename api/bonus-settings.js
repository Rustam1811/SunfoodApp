// api/bonus-settings.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
    const b64 = process.env.FIREBASE_KEY_BASE64;
    if (!b64) throw new Error("FIREBASE_KEY_BASE64 not set");
    const serviceAccount = JSON.parse(
        Buffer.from(b64, "base64").toString("utf8")
    );
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

module.exports = async function handler(req, res) {
    // CORS
    const origin = req.headers.origin || "";
    if (
        ["http://localhost:5173",
            "https://coffee-addict.vercel.app",
            "https://sunfood-app.vercel.app"
        ].includes(origin)
    ) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        if (req.method === "GET") {
            // Получение настроек бонусной системы
            const doc = await db.collection("settings").doc("bonus-system").get();

            if (doc.exists) {
                return res.status(200).json(doc.data());
            } else {
                // Настройки по умолчанию
                const defaultSettings = {
                    baseRate: 5,
                    multipliers: {
                        morningBonus: 1.5,
                        eveningBonus: 1.2,
                        weekendBonus: 2.0,
                        vipBonus: 1.5
                    },
                    categories: {
                        'coffee': 1.0,
                        'desserts': 1.2,
                        'breakfast': 0.8,
                        'special': 2.0
                    },
                    rewards: [
                        {
                            id: '1',
                            name: 'Скидка 200₸',
                            description: 'Скидка 200 тенге на любой заказ',
                            cost: 100,
                            discount: 200,
                            type: 'fixed',
                            isActive: true
                        }
                    ],
                    levels: [
                        {
                            name: 'Новичок',
                            minOrders: 0,
                            bonusMultiplier: 1.0,
                            benefits: ['Базовые бонусы']
                        },
                        {
                            name: 'Любитель',
                            minOrders: 10,
                            bonusMultiplier: 1.2,
                            benefits: ['+20% к бонусам', 'Персональные предложения']
                        }
                    ]
                };

                await db.collection("settings").doc("bonus-system").set(defaultSettings);
                return res.status(200).json(defaultSettings);
            }
        }

        if (req.method === "POST") {
            // Сохранение настроек бонусной системы
            const settings = req.body;

            await db.collection("settings").doc("bonus-system").set({
                ...settings,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return res.status(200).json({ success: true, message: 'Настройки сохранены' });
        }

        res.status(405).end();
    } catch (e) {
        console.error("🔥 Bonus Settings Error:", e);
        res.status(500).json({ error: "Server error" });
    }
};
