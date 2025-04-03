import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import path from "path";

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
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

// ✅ Firebase Admin Init
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

// ✅ Пример маршрута
app.get("/api/test", async (req, res) => {
  try {
    const snap = await db.collection("users").limit(1).get();
    const data = snap.docs.map(doc => doc.id);
    res.json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ error: "Ошибка чтения из Firestore" });
  }
});

export { db };
export default app;
