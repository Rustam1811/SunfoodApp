// ✅ api/register.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const firebaseKey = process.env.FIREBASE_KEY;
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(firebaseKey!.replace(/\n/g, '\n'))),
  });
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || '';
  if (["http://localhost:5173", "https://sunfood-app.vercel.app"].includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).end();

  const { name, phone, password } = req.body;
  if (!name || !phone || !password) return res.status(400).json({ error: "Все поля обязательны" });

  const existing = await db.collection("users").where("phone", "==", phone).limit(1).get();
  if (!existing.empty) return res.status(400).json({ error: "Такой пользователь уже есть" });

  const newUser = { name, phone, password, bonus: 0 };
  await db.collection("users").add(newUser);

  return res.status(200).json({ token: "mock-token", user: newUser });
}
