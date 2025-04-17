const admin = require("firebase-admin");

if (!admin.apps.length) {
  const b64 = process.env.FIREBASE_KEY_BASE64;
  if (!b64) throw new Error("FIREBASE_KEY_BASE64 not set");
  const serviceAccount = JSON.parse(
    Buffer.from(b64, "base64").toString("utf8")
  );
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || "";
  if (["http://localhost:5173", "https://coffee-addict.vercel.app"].includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: "userId required" });
      const snap = await db
        .collection("orders")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();
      const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(orders);
    }

    if (req.method === "POST") {
      const { userId, items, amount } = req.body;
      if (!userId || !Array.isArray(items) || typeof amount !== "number") {
        return res.status(400).json({ error: "Invalid body" });
      }
      const bonusEarned = Math.floor(amount * 0.05);
      await db.collection("orders").add({
        userId,
        items,
        amount,
        bonusEarned,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(200).json({ success: true });
    }

    return res.status(405).end();
  } catch (e) {
    console.error("🔥 Orders Error:", e);
    return res.status(500).json({ error: "Server error" });
  }
};
