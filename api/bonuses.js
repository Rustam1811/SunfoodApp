const admin = require("firebase-admin");

if (!admin.apps.length) {
  // 1) Берём Base64‑строку из окружения
  const b64 = process.env.FIREBASE_KEY_BASE64;
  if (!b64) throw new Error("FIREBASE_KEY_BASE64 not set");

  // 2) Раскодируем в UTF‑8 JSON
  const serviceAccount = JSON.parse(
    Buffer.from(b64, "base64").toString("utf8")
  );

  // 3) Исправляем literal "\\n" → реальные переносы "\n"
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  // 4) Инициализируем Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || "";
  if (
    ["http://localhost:5173", "https://coffee-addict.vercel.app"].includes(
      origin
    )
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const phone = req.query.phone;
    if (!phone) {
      return res.status(400).json({ error: "Номер обязателен" });
    }

    const snapshot = await db
      .collection("users")
      .where("phone", "==", phone)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const user = snapshot.docs[0].data();
    return res.status(200).json({ bonus: user.bonus || 0 });
  } catch (err) {
    console.error("🔥 Bonus Error:", err);
    return res
      .status(500)
      .json({ error: "Ошибка сервера", details: String(err) });
  }
};
