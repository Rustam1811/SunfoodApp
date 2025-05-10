// api/placeOrder.js
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
  // --- CORS ---
  const origin = req.headers.origin || "";
  const allowed = [
    "http://localhost:5173",
    "https://coffee-addict.vercel.app",
    "https://sunfood-app.vercel.app",
  ];
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // --- /CORS ---

  // GET /api/placeOrder?userId=…
  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    let userRef, userData;
    if (/^\d+$/.test(userId)) {
      const snap = await db
        .collection("users")
        .where("phone", "==", userId)
        .limit(1)
        .get();
      if (snap.empty) {
        return res.status(404).json({ error: "User not found" });
      }
      userRef = snap.docs[0].ref;
      userData = snap.docs[0].data();
    } else {
      userRef = db.collection("users").doc(userId);
      const docSnap = await userRef.get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: "User not found" });
      }
      userData = docSnap.data();
    }

    const bonus = userData.bonus || 0;
    return res.status(200).json({ bonus });
  }

  // POST → оформление заказа + списание/начисление бонусов
  if (req.method === "POST") {
    const { userId, items, amount, bonusToUse = 0 } = req.body;
    if (
      typeof userId !== "string" ||
      !Array.isArray(items) ||
      typeof amount !== "number" ||
      typeof bonusToUse !== "number"
    ) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const BONUS_RATE = 0.05;
    const bonusEarned = Math.floor(amount * BONUS_RATE);

    try {
      const result = await db.runTransaction(async (tx) => {
        let userRef, currentBonus = 0;

        // Найдём пользователя
        if (/^\d+$/.test(userId)) {
          const snap = await tx.get(
            db.collection("users").where("phone", "==", userId).limit(1)
          );
          if (snap.empty) throw new Error("User not found");
          userRef = snap.docs[0].ref;
          currentBonus = snap.docs[0].data().bonus || 0;
        } else {
          userRef = db.collection("users").doc(userId);
          const docSnap = await tx.get(userRef);
          if (!docSnap.exists) throw new Error("User not found");
          currentBonus = docSnap.data().bonus || 0;
        }

        // Проверяем баланс
        if (bonusToUse > currentBonus) {
          throw new Error("Not enough bonus");
        }
        if (bonusToUse > amount) {
          throw new Error("Bonus exceeds order amount");
        }

        const totalToPay = amount - bonusToUse;

        // Создаём заказ
        const orderRef = db.collection("orders").doc();
        tx.set(orderRef, {
          userId,
          items,
          amount,
          bonusUsed: bonusToUse,
          bonusEarned,
          totalToPay,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Обновляем бонусный баланс
        tx.update(userRef, {
          bonus: admin.firestore.FieldValue.increment(bonusEarned - bonusToUse),
        });

        return {
          orderId: orderRef.id,
          newBonus: currentBonus + bonusEarned - bonusToUse,
        };
      });

      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      console.error("🔥 placeOrder Error:", err);
      const msg = err.message;
      if (msg === "Not enough bonus" || msg === "Bonus exceeds order amount") {
        return res.status(400).json({ error: msg });
      }
      if (msg === "User not found") {
        return res.status(404).json({ error: msg });
      }
      return res.status(500).json({ error: "Server error" });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: "Method Not Allowed" });
};
