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
      const bonusEarned = Math.floor(amount * 0.05);

      // 1) создаём заказ
      await db.collection("orders").add({
        userId,
        items,
        amount,
        bonusUsed,
        bonusEarned,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2) инкрементим баланс пользователя
      const userSnap = await db
        .collection("users")
        .where("phone", "==", userId)
        .limit(1)
        .get();
      if (!userSnap.empty) {
        await userSnap.docs[0].ref.update({
          bonus: admin.firestore.FieldValue.increment(bonusEarned),
        });
      }

      return res.status(200).json({ success: true, bonusEarned });
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
