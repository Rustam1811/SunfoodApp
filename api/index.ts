import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import admin from 'firebase-admin';

const app = express();
app.use(express.json());

// ✅ CORS middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://sunfood-app.vercel.app",
];
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

// ✅ Firebase init
if (!admin.apps.length) {
  const firebaseKey = process.env.FIREBASE_KEY;
  if (!firebaseKey) throw new Error("Missing FIREBASE_KEY");
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(firebaseKey.replace(/\\n/g, '\n'))
    )
  });
}
const db = admin.firestore();

// 📌 /register
app.post('/index/register', async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password)
    return res.status(400).json({ error: "Все поля обязательны" });

  const exists = await db.collection("users").where("phone", "==", phone).limit(1).get();
  if (!exists.empty)
    return res.status(400).json({ error: "Такой пользователь уже есть" });

  const newUser = { name, phone, password, bonus: 0 };
  await db.collection("users").add(newUser);

  res.status(200).json({ token: "mock-token", user: newUser });
});

// 📌 /login
app.post('/index/login', async (req, res) => {
  const { phone, password } = req.body;
  const userSnap = await db.collection("users").where("phone", "==", phone).limit(1).get();

  if (userSnap.empty) return res.status(404).json({ error: "Пользователь не найден" });

  const user = userSnap.docs[0].data();
  if (user.password !== password)
    return res.status(401).json({ error: "Неверный пароль" });

  res.status(200).json({ token: "mock-token", user });
});

// 📌 /bonuses
app.get('/index/bonuses', async (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: "Номер обязателен" });

  const snap = await db.collection("users").where("phone", "==", phone).limit(1).get();
  if (snap.empty) return res.status(404).json({ error: "Пользователь не найден" });

  const user = snap.docs[0].data();
  res.status(200).json({ bonus: user.bonus || 0 });
});

// ✅ Обёртка для Vercel
import { createServer } from 'http';
export default (req: VercelRequest, res: VercelResponse) => {
  const server = createServer(app);
  server.emit('request', req, res);
};
