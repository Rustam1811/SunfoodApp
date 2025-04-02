import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import path from "path";

console.log("📦 Express запускается");

dotenv.config();
console.log("🌍 .env загружен");

const app = express();
app.use(express.json());

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://sunfood-app.vercel.app",
  "https://sunfood-35bdd.web.app"
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

// Firebase Init
let serviceAccount;
try {
  if (process.env.FIREBASE_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_KEY.replace(/\\n/g, "\n"));
    console.log("✅ FIREBASE_KEY успешно разобран");
  } else {
    console.log("⚠️ FIREBASE_KEY не найден, fallback на файл");
    serviceAccount = JSON.parse(readFileSync(path.resolve("firebase-key.json"), "utf8"));
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (err) {
  console.error("❌ Ошибка парсинга FIREBASE_KEY:", err);
}

const db = admin.firestore();

app.get("/test-firebase", async (req, res) => {
  const snapshot = await db.collection("users").limit(1).get();
  const users = [];
  snapshot.forEach(doc => users.push(doc.id));
  res.json({ ok: true, users });
});

export default app;
