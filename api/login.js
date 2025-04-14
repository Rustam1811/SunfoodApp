const admin = require("firebase-admin");

if (!admin.apps.length) {
  const firebaseKey = process.env.FIREBASE_KEY;
  if (!firebaseKey) throw new Error("FIREBASE_KEY not set");
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(firebaseKey.replace(/\\n/g, "\n"))),
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
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Номер и пароль обязательны" });
    }

    const snapshot = await db.collection("users").where("phone", "==", phone).limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const user = snapshot.docs[0].data();
    if (user.password !== password) {
      return res.status(401).json({ error: "Неверный пароль" });
    }

    return res.status(200).json({ token: "mock-token", user });
  } catch (err) {
    console.error("🔥 Login Error:", err);
    return res.status(500).json({ error: "Ошибка входа", details: String(err) });
  }
};
