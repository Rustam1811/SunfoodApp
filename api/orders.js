// api/orders.js
const admin = require("firebase-admin");
const testOrders = require('./test-orders');

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
  // CORS
  const origin = req.headers.origin || "";
  if (
    ["http://localhost:5173",
      "https://coffee-addict.vercel.app",
      "https://sunfood-app.vercel.app"
    ].includes(origin)
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

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
            status: d.status || 'pending',
            date: d.createdAt?.toDate().toISOString(),
            createdAt: d.createdAt?.toDate()
          };
        });

        // Добавляем тестовые заказы для демо
        const allOrders = [...orders, ...testOrders.map(order => ({
          ...order,
          amount: order.totalAmount,
          date: order.createdAt.toISOString()
        }))];

        return res.status(200).json({ orders: allOrders });
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
            status: d.status || 'pending',
            date: d.createdAt?.toDate().toISOString()
          };
        });
        return res.status(200).json(orders);
      }
    }

    if (req.method === "POST") {
      const { userId, items, amount, bonusUsed = 0 } = req.body;
      console.log('🔥 POST /api/orders - Получен заказ:', { userId, items, amount, bonusUsed });

      if (!userId || !Array.isArray(items) || typeof amount !== "number") {
        console.log('🔥 Ошибка валидации данных');
        return res.status(400).json({ error: "Invalid body" });
      }

      // Получаем настройки бонусной системы и данные пользователя
      const bonusSettingsDoc = await db.collection('settings').doc('bonusSettings').get();
      let bonusSettings = {
        basePercentage: 5,
        levelMultipliers: {
          'Новичок': 1.0,
          'Любитель': 1.2,
          'Эксперт': 1.5,
          'VIP': 2.0
        }
      };

      if (bonusSettingsDoc.exists) {
        const settings = bonusSettingsDoc.data();
        bonusSettings = { ...bonusSettings, ...settings };
      }

      // Получаем уровень пользователя
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      let userData = { bonusBalance: 0, totalOrders: 0 };
      if (userDoc.exists) {
        userData = { ...userData, ...userDoc.data() };
      }

      // Подсчитываем количество заказов для определения уровня
      const ordersSnapshot = await db.collection('orders')
        .where('userId', '==', userId)
        .get();
      const totalOrders = ordersSnapshot.size + 1; // +1 для текущего заказа

      // Определяем уровень
      let level = 'Новичок';
      if (totalOrders >= 100) level = 'VIP';
      else if (totalOrders >= 50) level = 'Эксперт';
      else if (totalOrders >= 10) level = 'Любитель';

      const multiplier = bonusSettings.levelMultipliers[level] || 1.0;
      const bonusEarned = Math.floor(amount * (bonusSettings.basePercentage / 100) * multiplier);

      console.log('🔥 Расчет бонусов:', { level, multiplier, amount, bonusEarned });

      // Начинаем транзакцию
      await db.runTransaction(async (transaction) => {
        // 1) Создаём заказ
        const orderRef = db.collection("orders").doc();
        transaction.set(orderRef, {
          userId,
          items,
          amount,
          bonusUsed,
          bonusEarned,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 2) Обновляем баланс пользователя
        const newBalance = (userData.bonusBalance || 0) + bonusEarned - bonusUsed;
        transaction.set(userRef, {
          bonusBalance: newBalance,
          totalOrders: totalOrders,
          level: level,
          lastOrderAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 3) Записываем в историю бонусов - заработано
        if (bonusEarned > 0) {
          const earnedHistoryRef = db.collection('bonusHistory').doc();
          transaction.set(earnedHistoryRef, {
            userId: userId,
            type: 'earned',
            amount: bonusEarned,
            description: `Заказ #${orderRef.id.slice(-6)}`,
            date: new Date().toISOString(),
            orderId: orderRef.id,
            multiplier: multiplier,
            level: level
          });
        }

        // 4) Записываем в историю бонусов - потрачено
        if (bonusUsed > 0) {
          const spentHistoryRef = db.collection('bonusHistory').doc();
          transaction.set(spentHistoryRef, {
            userId: userId,
            type: 'spent',
            amount: bonusUsed,
            description: `Оплата заказа #${orderRef.id.slice(-6)}`,
            date: new Date().toISOString(),
            orderId: orderRef.id
          });
        }
      });

      console.log('🔥 Заказ успешно обработан, возвращаем результат');

      return res.status(200).json({
        success: true,
        bonusEarned,
        multiplier,
        level,
        message: `Заказ оформлен! Начислено ${bonusEarned} бонусов (x${multiplier})`
      });
    }

    if (req.method === "PUT") {
      // Обновление статуса заказа (для админки)
      const { orderId, status } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({ error: 'orderId and status required' });
      }

      const validStatuses = ['pending', 'accepted', 'ready', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Получаем текущий заказ
      const orderRef = db.collection("orders").doc(orderId);
      const orderDoc = await orderRef.get();

      if (!orderDoc.exists) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const orderData = orderDoc.data();
      console.log('🔥 Обновление статуса заказа:', orderId, 'с', orderData.status, 'на', status);

      // Если заказ переводится в completed и ранее не был completed
      if (status === 'completed' && orderData.status !== 'completed') {
        console.log('🔥 Заказ завершен, начисляем бонусы');

        // Получаем настройки бонусов
        const bonusSettingsSnap = await db.collection('bonusSettings').doc('main').get();
        const bonusSettings = bonusSettingsSnap.exists ? bonusSettingsSnap.data() : { basePercentage: 5 };

        // Получаем данные пользователя для расчета уровня
        const userRef = db.collection('users').doc(orderData.userId);
        const userDoc = await userRef.get();
        let userData = userDoc.exists ? userDoc.data() : { bonusBalance: 0 };

        // Получаем количество заказов пользователя для определения уровня
        const userOrdersSnap = await db.collection('orders')
          .where('userId', '==', orderData.userId)
          .where('status', '==', 'completed')
          .get();

        const completedOrders = userOrdersSnap.size;

        // Определяем уровень и множитель
        let level = 'Новичок';
        let multiplier = 1.0;

        if (completedOrders >= 100) {
          level = 'VIP';
          multiplier = 2.0;
        } else if (completedOrders >= 50) {
          level = 'Эксперт';
          multiplier = 1.5;
        } else if (completedOrders >= 10) {
          level = 'Любитель';
          multiplier = 1.2;
        }

        // Рассчитываем бонусы (если еще не были рассчитаны)
        let bonusEarned = orderData.bonusEarned || 0;

        if (bonusEarned === 0) {
          bonusEarned = Math.floor(orderData.amount * (bonusSettings.basePercentage / 100) * multiplier);
          console.log('🔥 Расчет новых бонусов:', { level, multiplier, amount: orderData.amount, bonusEarned });
        } else {
          console.log('🔥 Бонусы уже рассчитаны:', bonusEarned);
        }

        // Обновляем баланс пользователя
        const newBalance = (userData.bonusBalance || 0) + bonusEarned;
        await userRef.update({ bonusBalance: newBalance });

        // Добавляем запись в историю бонусов
        if (bonusEarned > 0) {
          const earnedHistoryRef = db.collection('bonusHistory').doc();
          await earnedHistoryRef.set({
            userId: orderData.userId,
            type: 'earned',
            amount: bonusEarned,
            description: `Заказ #${orderId} завершен`,
            orderId: orderId,
            date: new Date().toISOString()
          });
        }

        // Обновляем заказ с начисленными бонусами
        await orderRef.update({
          status,
          bonusEarned,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('🔥 Бонусы начислены:', bonusEarned, 'новый баланс:', newBalance);

        return res.status(200).json({
          success: true,
          message: `Order completed! Earned ${bonusEarned} bonus points`,
          orderId,
          status,
          bonusEarned,
          newBalance
        });
      } else {
        // Обычное обновление статуса
        await orderRef.update({
          status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(200).json({
          success: true,
          message: 'Order status updated',
          orderId,
          status
        });
      }
    }

    res.status(405).end();
  } catch (e) {
    console.error("🔥 Orders Error:", e);
    res.status(500).json({ error: "Server error" });
  }
};
