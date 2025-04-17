const admin = require("firebase-admin");

if (!admin.apps.length) {
  const b64 = process.env.FIREBASE_KEY_BASE64;
  if (!b64) throw new Error("FIREBASE_KEY_BASE64 not set");
  const serviceAccount = JSON.parse(
    Buffer.from(b64, "base64").toString("utf8")
  );
  // Исправляем PEM: заменяем literal "\\n" на реальные переносы строк
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = async function handler(req, res) {
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
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }
    const exists = await db.collection("users").where("phone", "==", phone).limit(1).get();
    if (!exists.empty) {
      return res.status(400).json({ error: "Такой пользователь уже есть" });
    }
    const newUser = { name, phone, password, bonus: 0 };
    await db.collection("users").add(newUser);
    return res.status(200).json({ token: "mock-token", user: newUser });
  } catch (err) {
    console.error("🔥 Register Error:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};
