// ✅ api/bonuses.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const firebaseKey = process.env.FIREBASE_KEY;
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(firebaseKey!.replace(/\\n/g, '\n'))),
  });
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || '';
  if (["http://localhost:5173", "https://sunfood-app.vercel.app"].includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") return res.status(405).end();

  const phone = req.query.phone as string;
  if (!phone) return res.status(400).json({ error: "Номер обязателен" });

  const snapshot = await db.collection("users").where("phone", "==", phone).limit(1).get();
  if (snapshot.empty) return res.status(404).json({ error: "Пользователь не найден" });

  const user = snapshot.docs[0].data();
  return res.status(200).json({ bonus: user.bonus || 0 });
}
