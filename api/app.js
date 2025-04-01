import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import path from "path";

dotenv.config();

// Firebase init
let serviceAccount;
if (process.env.FIREBASE_KEY) {
  serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
} else {
  serviceAccount = JSON.parse(readFileSync(path.resolve("firebase-key.json"), "utf8"));
}

console.log("FIREBASE_KEY:", process.env.FIREBASE_KEY?.slice(0, 30)); // покажет первые символы
console.log("🔥 FIREBASE_KEY (first 50 chars):", process.env.FIREBASE_KEY?.slice(0, 50));


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
console.log("✅ Firebase initialized");

const db = admin.firestore();
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://sunfood-35bdd.web.app',
    'https://sunfood-app.vercel.app'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});



const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";

// ✅ Register
app.post("/register", async (req, res) => {
  console.log("➡️ REGISTER BODY:", req.body); //
  const { phone, name, password } = req.body;
  if (!phone || !name || !password) return res.status(400).json({ error: "Все поля обязательны" });

  const userRef = db.collection("users").doc(phone);
  const userDoc = await userRef.get();
  if (userDoc.exists) return res.status(400).json({ error: "Номер уже зарегистрирован" });

  const hashedPassword = await bcrypt.hash(password, 10);
  await userRef.set({ phone, name, password: hashedPassword, orders: [], bonuses: 0 });

  return res.json({ message: "Пользователь зарегистрирован" });
});

// ✅ Login
app.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: "Все поля обязательны" });

  const userRef = db.collection("users").doc(phone);
  const userDoc = await userRef.get();
  if (!userDoc.exists) return res.status(400).json({ error: "Неверный номер или пароль" });

  const userData = userDoc.data();
  const passwordMatch = await bcrypt.compare(password, userData.password);
  if (!passwordMatch) return res.status(400).json({ error: "Неверный номер или пароль" });

  const token = jwt.sign({ phone: userData.phone }, SECRET_KEY, { expiresIn: "7d" });

  return res.json({
    token,
    user: {
      phone: userData.phone,
      name: userData.name,
      bonuses: userData.bonuses,
    },
  });
});

app.get("/api/test-firebase", async (req, res) => {
  try {
    const snapshot = await db.collection("users").limit(1).get();
    const users = [];
    snapshot.forEach(doc => users.push(doc.id));
    return res.json({ status: "ok", users });
  } catch (err) {
    console.error("❌ Firebase Test Error:", err);
    return res.status(500).json({ error: "Firebase connection failed" });
  }
});


export default app;
