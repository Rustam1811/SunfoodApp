import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// ✅ CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://sunfood-app.vercel.app',
  'https://sunfood-35bdd.web.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ✅ Firebase Admin Init
if (!process.env.FIREBASE_KEY) {
  throw new Error("❌ FIREBASE_KEY не задан в .env или в настройках Vercel");
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_KEY.replace(/\\n/g, "\n"));
} catch (err) {
  console.error("❌ Ошибка парсинга FIREBASE_KEY:", err.message);
}


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ✅ Тестовый маршрут
app.get("/api/test", async (req, res) => {
  try {
    const snap = await db.collection("users").limit(1).get();
    const data = snap.docs.map(doc => doc.id);
    res.json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ error: "Ошибка чтения из Firestore" });
  }
});

// ✅ Авторизация
app.post("/api/login", async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: "Номер и пароль обязательны" });

  try {
    const snap = await db.collection("users").where("phone", "==", phone).limit(1).get();
    if (snap.empty) return res.status(401).json({ error: "Пользователь не найден" });

    const user = snap.docs[0].data();
    if (user.password !== password) return res.status(401).json({ error: "Неверный пароль" });

    res.json({ token: "mock-token", user });
  } catch (e) {
    console.error("/login error:", e);
    res.status(500).json({ error: "Ошибка на сервере" });
  }
});

// ✅ Регистрация
app.post("/api/register", async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) return res.status(400).json({ error: "Все поля обязательны" });

  try {
    const exists = await db.collection("users").where("phone", "==", phone).limit(1).get();
    if (!exists.empty) return res.status(400).json({ error: "Такой пользователь уже есть" });

    const newUser = { name, phone, password, bonus: 0 };
    await db.collection("users").add(newUser);

    res.json({ token: "mock-token", user: newUser });
  } catch (e) {
    console.error("/register error:", e);
    res.status(500).json({ error: "Ошибка при регистрации" });
  }
});

// ✅ Заказ (пример)
app.post("/api/order", async (req, res) => {
  const { userId, items, total } = req.body;
  if (!userId || !items || !total) return res.status(400).json({ error: "Не хватает данных" });

  const bonusEarned = Math.floor(total * 0.05);

  try {
    await db.collection("orders").add({
      userId,
      items,
      total,
      bonusEarned,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const userSnap = await db.collection("users").where("phone", "==", userId).limit(1).get();
    if (!userSnap.empty) {
      const userRef = userSnap.docs[0].ref;
      const prevBonus = userSnap.docs[0].data().bonus || 0;
      await userRef.update({ bonus: prevBonus + bonusEarned });
    }

    res.json({ success: true, bonusEarned });
  } catch (e) {
    console.error("/order error:", e);
    res.status(500).json({ error: "Ошибка оформления заказа" });
  }
});

export { db };
export default app;
