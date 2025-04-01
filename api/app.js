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
  serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
} else {
  serviceAccount = JSON.parse(readFileSync(path.resolve("firebase-key.json"), "utf8"));
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

export default app;
