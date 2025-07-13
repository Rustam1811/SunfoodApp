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
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: "userId required" });
      const snap = await db
        .collection("orders")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(5)
        .get();

      const orders = snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          items: d.items,
          amount: d.amount,
          bonusEarned: d.bonusEarned,
          date: d.createdAt?.toDate().toISOString()  // ← добавляем дату
        };
      });
      return res.status(200).json(orders);
    }

    if (req.method === "POST") {
      const { userId, items, amount } = req.body;
      if (!userId || !Array.isArray(items) || typeof amount !== "number") {
        return res.status(400).json({ error: "Invalid body" });
      }
      const bonusEarned = Math.floor(amount * 0.05);

      // 1) создаём заказ
      await db.collection("orders").add({
        userId,
        items,
        amount,
        bonusEarned,
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

    res.status(405).end();
  } catch (e) {
    console.error("🔥 Orders Error:", e);
    res.status(500).json({ error: "Server error" });
  }
};
