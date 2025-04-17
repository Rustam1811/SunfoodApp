// api/spendBonuses.js
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
  if (["http://localhost:5173", "https://coffee-addict.vercel.app"].includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { phone, amount } = req.body;
    if (!phone || typeof amount !== "number") {
      return res.status(400).json({ error: "Неверный запрос" });
    }

    // Найти пользователя
    const snap = await db
      .collection("users")
      .where("phone", "==", phone)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    const userDoc = snap.docs[0];
    const user = userDoc.data();

    const current = user.bonus || 0;
    if (current < amount) {
      return res.status(400).json({ error: "Недостаточно бонусов" });
    }

    // Вычесть и обновить
    await userDoc.ref.update({
      bonus: current - amount
    });

    return res.status(200).json({ bonus: current - amount });
  } catch (err) {
    console.error("🔥 spendBonuses Error:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};
