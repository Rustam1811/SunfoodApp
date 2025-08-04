const express = require('express');
const router = express.Router();

// Инициализация Firebase Admin (если не инициализирован)
let admin;
try {
  admin = require('firebase-admin');
  if (!admin.apps.length) {
    // Читаем ключ из переменной окружения
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_KEY_BASE64, 'base64').toString('utf-8')
    );
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Ошибка инициализации Firebase:', error);
}

const db = admin.firestore();

// GET /api/promotions - получить все активные акции
router.get('/', async (req, res) => {
  try {
    console.log('🎯 Получение списка акций...');
    
    const promotionsSnapshot = await db
      .collection('promotions')
      .where('isActive', '==', true)
      .get();

    let promotions = promotionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Конвертируем Timestamp в обычную дату для фронтенда
      startDate: doc.data().startDate?.toDate?.() || doc.data().startDate,
      endDate: doc.data().endDate?.toDate?.() || doc.data().endDate,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));

    // Фильтруем по датам на сервере
    const now = new Date();
    promotions = promotions.filter(promo => {
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      
      return now >= startDate && 
             now <= endDate &&
             (!promo.usageLimit || promo.usedCount < promo.usageLimit);
    });

    // Сортируем по дате создания (новые сначала)
    promotions = promotions.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    console.log(`✅ Найдено ${promotions.length} активных акций`);
    res.json({ promotions });
  } catch (error) {
    console.error('❌ Ошибка получения акций:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/promotions - создать новую акцию
router.post('/', async (req, res) => {
  try {
    console.log('🎯 Создание новой акции...');
    
    const promotionData = {
      ...req.body,
      createdAt: admin.firestore.Timestamp.now(),
      usedCount: 0,
      isActive: req.body.isActive !== false
    };

    const docRef = await db.collection('promotions').add(promotionData);
    
    console.log(`✅ Акция создана с ID: ${docRef.id}`);
    res.json({ id: docRef.id, ...promotionData });
  } catch (error) {
    console.error('❌ Ошибка создания акции:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/promotions/:id - обновить акцию
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🎯 Обновление акции ${id}...`);
    
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.Timestamp.now()
    };
    
    delete updateData.id;

    await db.collection('promotions').doc(id).update(updateData);
    
    console.log(`✅ Акция ${id} обновлена`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Ошибка обновления акции:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/promotions/:id - удалить акцию
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Удаление акции ${id}...`);
    
    await db.collection('promotions').doc(id).delete();
    
    console.log(`✅ Акция ${id} удалена`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Ошибка удаления акции:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/promotions/:id/use - использовать акцию (увеличить счетчик)
router.post('/:id/use', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🎯 Использование акции ${id}...`);
    
    await db.collection('promotions').doc(id).update({
      usedCount: admin.firestore.FieldValue.increment(1)
    });
    
    console.log(`✅ Акция ${id} использована`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Ошибка использования акции:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
