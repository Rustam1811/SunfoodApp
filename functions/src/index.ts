import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";

const corsHandler = cors({ origin: true });

// Инициализация Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Получение бонусов пользователя
 */
export const userBonus = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId обязателен" });
      }

      // Получаем последний бонус пользователя
      const bonusSnapshot = await db
        .collection("bonusHistory")
        .where("userId", "==", userId)
        .orderBy("date", "desc")
        .limit(1)
        .get();

      let currentBonus = 0;
      if (!bonusSnapshot.empty) {
        const latestBonus = bonusSnapshot.docs[0].data();
        currentBonus = latestBonus.bonus || 0;
      }

      res.json({ 
        bonus: currentBonus,
        userId: userId
      });
    } catch (error) {
      console.error("Ошибка получения бонусов:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
});

/**
 * Начисление бонусов за заказ
 */
export const earnBonus = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Только POST запросы" });
      }

      const { userId, orderAmount, orderId } = req.body;
      if (!userId || !orderAmount || !orderId) {
        return res.status(400).json({ 
          error: "userId, orderAmount и orderId обязательны" 
        });
      }

      // Получаем настройки бонусной системы
      const settingsDoc = await db.collection("settings").doc("bonus").get();
      let bonusPercentage = 5; // По умолчанию 5%
      
      if (settingsDoc.exists) {
        const settings = settingsDoc.data();
        bonusPercentage = settings?.percentage || 5;
      }

      // Рассчитываем бонусы
      const earnedBonus = Math.floor(orderAmount * bonusPercentage / 100);

      // Получаем текущие бонусы пользователя
      const bonusSnapshot = await db
        .collection("bonusHistory")
        .where("userId", "==", userId)
        .orderBy("date", "desc")
        .limit(1)
        .get();

      let currentBonus = 0;
      if (!bonusSnapshot.empty) {
        const latestBonus = bonusSnapshot.docs[0].data();
        currentBonus = latestBonus.bonus || 0;
      }

      const newBonus = currentBonus + earnedBonus;

      // Записываем в историю бонусов
      await db.collection("bonusHistory").add({
        userId: userId,
        type: "earned",
        amount: earnedBonus,
        bonus: newBonus,
        orderId: orderId,
        orderAmount: orderAmount,
        date: admin.firestore.Timestamp.now(),
        description: `Начислено за заказ №${orderId}`
      });

      // Обновляем заказ с информацией о бонусах
      await db.collection("orders").doc(orderId).update({
        bonusEarned: earnedBonus
      });

      res.json({
        success: true,
        earnedBonus: earnedBonus,
        totalBonus: newBonus,
        percentage: bonusPercentage
      });

    } catch (error) {
      console.error("Ошибка начисления бонусов:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
});

/**
 * Списание бонусов при оплате
 */
export const useBonus = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Только POST запросы" });
      }

      const { userId, usedBonus, orderId } = req.body;
      if (!userId || !usedBonus || !orderId) {
        return res.status(400).json({ 
          error: "userId, usedBonus и orderId обязательны" 
        });
      }

      // Получаем текущие бонусы пользователя
      const bonusSnapshot = await db
        .collection("bonusHistory")
        .where("userId", "==", userId)
        .orderBy("date", "desc")
        .limit(1)
        .get();

      let currentBonus = 0;
      if (!bonusSnapshot.empty) {
        const latestBonus = bonusSnapshot.docs[0].data();
        currentBonus = latestBonus.bonus || 0;
      }

      // Проверяем, хватает ли бонусов
      if (currentBonus < usedBonus) {
        return res.status(400).json({ 
          error: "Недостаточно бонусов",
          available: currentBonus,
          requested: usedBonus
        });
      }

      const newBonus = currentBonus - usedBonus;

      // Записываем в историю бонусов
      await db.collection("bonusHistory").add({
        userId: userId,
        type: "used",
        amount: usedBonus,
        bonus: newBonus,
        orderId: orderId,
        date: admin.firestore.Timestamp.now(),
        description: `Списано за заказ №${orderId}`
      });

      // Обновляем заказ с информацией о списанных бонусах
      await db.collection("orders").doc(orderId).update({
        bonusUsed: usedBonus
      });

      res.json({
        success: true,
        usedBonus: usedBonus,
        remainingBonus: newBonus
      });

    } catch (error) {
      console.error("Ошибка списания бонусов:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
});

/**
 * Получение всех заказов (для аналитики и админки)
 */
export const orders = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method === "GET") {
        const { userId, admin: isAdmin } = req.query;

        if (isAdmin) {
          // Админ панель - получаем все заказы
          const snap = await db
            .collection("orders")
            .orderBy("createdAt", "desc")
            .limit(100)
            .get();

          const orders = snap.docs.map(doc => {
            const d = doc.data();
            return {
              id: doc.id,
              userId: d.userId,
              items: d.items,
              amount: d.amount,
              bonusUsed: d.bonusUsed || 0,
              bonusEarned: d.bonusEarned || 0,
              status: d.status || 'pending',
              date: d.createdAt?.toDate()?.toISOString(),
              createdAt: d.createdAt?.toDate()
            };
          });

          return res.status(200).json({ orders });
        } else {
          // Пользователь - только его заказы
          if (!userId) return res.status(400).json({ error: "userId required" });
          
          const snap = await db
            .collection("orders")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .limit(10)
            .get();

          const orders = snap.docs.map(doc => {
            const d = doc.data();
            return {
              id: doc.id,
              items: d.items,
              amount: d.amount,
              bonusEarned: d.bonusEarned,
              bonusUsed: d.bonusUsed,
              status: d.status || 'pending',
              date: d.createdAt?.toDate()?.toISOString()
            };
          });
          
          return res.status(200).json(orders);
        }
      }

      if (req.method === "POST") {
        // Создание нового заказа
        const { userId, items, amount, bonusUsed = 0 } = req.body;
        if (!userId || !items || !amount) {
          return res.status(400).json({ error: "userId, items и amount обязательны" });
        }

        const orderData = {
          userId,
          items,
          amount,
          bonusUsed,
          status: "pending",
          createdAt: admin.firestore.Timestamp.now()
        };

        const orderRef = await db.collection("orders").add(orderData);
        res.json({ 
          success: true, 
          orderId: orderRef.id,
          order: { id: orderRef.id, ...orderData }
        });
      }

    } catch (error) {
      console.error("Ошибка в orders:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
});

/**
 * Настройки бонусной системы
 */
export const bonusSettings = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method === "GET") {
        const settingsDoc = await db.collection("settings").doc("bonus").get();
        
        if (settingsDoc.exists) {
          res.json(settingsDoc.data());
        } else {
          // Настройки по умолчанию
          const defaultSettings = {
            percentage: 5,
            maxBonus: 1000,
            minOrderAmount: 100
          };
          res.json(defaultSettings);
        }
      }

      if (req.method === "POST") {
        const { percentage, maxBonus, minOrderAmount } = req.body;
        
        await db.collection("settings").doc("bonus").set({
          percentage: percentage || 5,
          maxBonus: maxBonus || 1000,
          minOrderAmount: minOrderAmount || 100,
          updatedAt: admin.firestore.Timestamp.now()
        });

        res.json({ success: true });
      }

    } catch (error) {
      console.error("Ошибка в bonusSettings:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
});
