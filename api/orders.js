// api/orders.js
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
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const { userId, admin: isAdmin } = req.query;

      if (isAdmin) {
        // Админ панель - получаем все заказы
        const snap = await db
          .collection("orders")
          .orderBy("createdAt", "desc")
          .limit(100)
          .get();

        const orders = snap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            items: d.items,
            amount: d.amount,
            bonusUsed: d.bonusUsed || 0,
            status: d.status || 'pending',
            date: d.createdAt?.toDate().toISOString()
          };
        });
        return res.status(200).json({ orders });
      } else {
        // Пользователь - только его заказы
        if (!userId) return res.status(400).json({ error: "userId required" });
        const snap = await db
          .collection("orders")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .limit(10)
          .get();

        const orders = snap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            items: d.items,
            amount: d.amount,
            bonusEarned: d.bonusEarned,
            status: d.status || 'pending',
            date: d.createdAt?.toDate().toISOString()
          };
        });
        return res.status(200).json(orders);
      }
    }

    if (req.method === "POST") {
      const { userId, items, amount, bonusUsed = 0 } = req.body;
      if (!userId || !Array.isArray(items) || typeof amount !== "number") {
        return res.status(400).json({ error: "Invalid body" });
      }

      try {
        // Простая логика начисления бонусов 5%
        const bonusEarned = Math.floor(amount * 0.05);

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

        // 2) Обновляем баланс пользователя
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const currentBalance = userDoc.exists ? (userDoc.data().bonusBalance || 0) : 0;
        const newBalance = currentBalance + bonusEarned - bonusUsed;

        await userRef.set({
          bonusBalance: newBalance,
          totalOrders: userDoc.exists ? (userDoc.data().totalOrders || 0) + 1 : 1,
          lastOrderAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 3) Записываем в историю бонусов
        if (bonusEarned > 0) {
          await db.collection('bonusHistory').add({
            userId: userId,
            type: 'earned',
            amount: bonusEarned,
            description: `Заказ #${orderRef.id.slice(-6)}`,
            date: new Date().toISOString(),
            orderId: orderRef.id
          });
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
        }

        return res.status(200).json({
          success: true,
          bonusEarned,
          message: `Заказ оформлен! Начислено ${bonusEarned} бонусов`
        });

      } catch (error) {
        console.error('Ошибка создания заказа:', error);
        return res.status(500).json({ error: 'Ошибка при создании заказа' });
      }
    }

    if (req.method === "PUT") {
      // Обновление статуса заказа (для админки)
      const { orderId, status } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({ error: 'orderId and status required' });
      }

      const validStatuses = ['pending', 'accepted', 'ready', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      await db.collection("orders").doc(orderId).update({
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(200).json({
        success: true,
        message: 'Order status updated',
        orderId,
        status
      });
    }

    res.status(405).end();
  } catch (e) {
    console.error("🔥 Orders Error:", e);
    res.status(500).json({ error: "Server error" });
  }
};
