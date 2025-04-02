import express from "express";
console.log("📦 Express запускается");
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();
console.log("🌍 .env загружен");
import { readFileSync } from "fs";
import path from "path";


dotenv.config();

const app = express();
app.use(express.json());

// ✅ CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://sunfood-35bdd.web.app",
  "https://sunfood-app.vercel.app"
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

// ✅ Firebase Init
let serviceAccount;

if (process.env.FIREBASE_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_KEY.replace(/\\n/g, '\n'));
    console.log("✅ Firebase key parsed успешно");
  } catch (err) {
    console.error("❌ Ошибка парсинга FIREBASE_KEY:", err.message);
    throw err;
  }
}
  

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ✅ Тестовый эндпоинт
app.get("/test-firebase", async (req, res) => {
  const snapshot = await db.collection("users").limit(1).get();
  const users = [];
  snapshot.forEach(doc => users.push(doc.id));
  res.json({ ok: true, users });
});

console.log("🔑 FIREBASE_KEY:", process.env.FIREBASE_KEY?.slice(0, 30));
console.log("🧪 SECRET_KEY:", process.env.SECRET_KEY);

export default app;
