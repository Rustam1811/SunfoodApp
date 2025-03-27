import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import cors from "cors";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();
const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "your_secret_key";

app.post("/register", async (req, res) => {
  const { phone, name, password } = req.body;
  if (!phone || !name || !password) return res.status(400).json({ error: "Все поля обязательны" });

  const userRef = db.collection("users").doc(phone);
  const userDoc = await userRef.get();
  if (userDoc.exists) return res.status(400).json({ error: "Номер уже зарегистрирован" });

  const hashedPassword = await bcrypt.hash(password, 10);
  await userRef.set({ phone, name, password: hashedPassword, orders: [], bonuses: 0 });

  res.json({ message: "Пользователь зарегистрирован" });
});

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
  res.json({ token, user: { phone: userData.phone, name: userData.name, bonuses: userData.bonuses } });
});

export default app;
