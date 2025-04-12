import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// ✅ CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://sunfood-app.vercel.app",
  "https://sunfood-35bdd.web.app",
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

// ✅ Firebase init
if (!admin.apps.length) {
  try {
    const firebaseKey = process.env.FIREBASE_KEY;
    if (!firebaseKey) throw new Error("FIREBASE_KEY is missing");

    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(firebaseKey.replace(/\\n/g, "\n"))
      )
    });
  } catch (err) {
    console.error("🔥 Firebase init failed:", err);
  }
}
const db = admin.firestore();

// ✅ /api/register
app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password)
      return res.status(400).json({ error: "Все поля обязательны" });

    const exists = await db.collection("users").where("phone", "==", phone).limit(1).get();
    if (!exists.empty)
      return res.status(400).json({ error: "Такой пользователь уже есть" });

    const newUser = { name, phone, password, bonus: 0 };
    await db.collection("users").add(newUser);

    return res.status(200).json({ token: "mock-token", user: newUser });
  } catch (err) {
    console.error("🔥 Register error:", err);
    return res.status(500).json({ error: "Ошибка регистрации" });
  }
});

// ✅ Делаем правильно export для Vercel:
import { createServer } from 'http';
export default (req: VercelRequest, res: VercelResponse) => {
  const server = createServer(app);
  server.emit('request', req, res);
};
