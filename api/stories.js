const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Проверяем, инициализирован ли Firebase Admin
if (!admin.apps.length) {
    try {
        // Попытка инициализации с ключом из переменной окружения
        const serviceAccount = process.env.FIREBASE_KEY_BASE64 
            ? JSON.parse(Buffer.from(process.env.FIREBASE_KEY_BASE64, 'base64').toString())
            : require('../firebase-key.json');
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://coffeeaddict-c9d70-default-rtdb.firebaseio.com"
        });
    } catch (error) {
        console.warn('Firebase Admin не удалось инициализировать:', error.message);
    }
}

const db = admin.firestore();

// GET - получить все stories
router.get('/', async (req, res) => {
    try {
        const storiesRef = db.collection('stories');
        const snapshot = await storiesRef.orderBy('createdAt', 'desc').get();
        
        const stories = [];
        snapshot.forEach(doc => {
            stories.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        res.json(stories);
    } catch (error) {
        console.error('Ошибка получения stories:', error);
        res.status(500).json({ 
            error: 'Ошибка получения stories',
            details: error.message 
        });
    }
});

// POST - создать новую story
router.post('/', async (req, res) => {
    try {
        const { 
            title, 
            contentType, 
            mediaUrl, 
            textContent, 
            background, 
            duration = 5000, 
            link, 
            linkText,
            publishAt,
            fileSize,
            originalFileName
        } = req.body;
        
        // Валидация
        if (!title || title.length > 50) {
            return res.status(400).json({ 
                error: 'Заголовок обязателен и не должен превышать 50 символов' 
            });
        }
        
        if (!contentType || !['image', 'video', 'text'].includes(contentType)) {
            return res.status(400).json({ 
                error: 'Тип контента должен быть: image, video или text' 
            });
        }
        
        // Проверка контента в зависимости от типа
        if (contentType === 'text' && (!textContent || textContent.length > 150)) {
            return res.status(400).json({ 
                error: 'Текстовый контент обязателен и не должен превышать 150 символов' 
            });
        }
        
        if ((contentType === 'image' || contentType === 'video') && !mediaUrl) {
            return res.status(400).json({ 
                error: 'URL медиафайла обязателен для фото и видео' 
            });
        }
        
        // Автоматическое истечение через 24 часа
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        const storyData = {
            title,
            contentType,
            mediaUrl: mediaUrl || null,
            textContent: textContent || null,
            background: background || null,
            duration,
            isActive: true,
            link: link || null,
            linkText: linkText || null,
            viewCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            publishAt: publishAt ? new Date(publishAt) : now,
            expiresAt: expiresAt,
            fileSize: fileSize || null,
            originalFileName: originalFileName || null
        };
        
        const docRef = await db.collection('stories').add(storyData);
        
        res.status(201).json({
            id: docRef.id,
            ...storyData,
            createdAt: now.toISOString(),
            publishAt: storyData.publishAt.toISOString(),
            expiresAt: expiresAt.toISOString()
        });
    } catch (error) {
        console.error('Ошибка создания story:', error);
        res.status(500).json({ 
            error: 'Ошибка создания story',
            details: error.message 
        });
    }
});

// PUT - обновить story
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mediaUrl, mediaType, title, description, duration, isActive } = req.body;
        
        const updateData = {};
        if (mediaUrl !== undefined) updateData.mediaUrl = mediaUrl;
        if (mediaType !== undefined) updateData.mediaType = mediaType;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (duration !== undefined) updateData.duration = duration;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        
        await db.collection('stories').doc(id).update(updateData);
        
        res.json({ 
            id,
            message: 'Story обновлена успешно',
            ...updateData,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Ошибка обновления story:', error);
        res.status(500).json({ 
            error: 'Ошибка обновления story',
            details: error.message 
        });
    }
});

// DELETE - удалить story
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.collection('stories').doc(id).delete();
        
        res.json({ 
            message: 'Story удалена успешно',
            id 
        });
    } catch (error) {
        console.error('Ошибка удаления story:', error);
        res.status(500).json({ 
            error: 'Ошибка удаления story',
            details: error.message 
        });
    }
});

// POST - записать просмотр story
router.post('/:id/view', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({ 
                error: 'sessionId обязателен для записи просмотра' 
            });
        }
        
        // Проверяем, не было ли уже просмотра от этого пользователя/сессии
        const existingView = await db.collection('storyViews')
            .where('storyId', '==', id)
            .where(userId ? 'userId' : 'sessionId', '==', userId || sessionId)
            .limit(1)
            .get();
        
        if (!existingView.empty) {
            return res.json({ message: 'Просмотр уже записан' });
        }
        
        // Записываем просмотр
        const viewData = {
            storyId: id,
            userId: userId || null,
            sessionId,
            viewedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('storyViews').add(viewData);
        
        // Увеличиваем счетчик просмотров у story
        await db.collection('stories').doc(id).update({
            viewCount: admin.firestore.FieldValue.increment(1)
        });
        
        res.json({ message: 'Просмотр записан успешно' });
    } catch (error) {
        console.error('Ошибка записи просмотра:', error);
        res.status(500).json({ 
            error: 'Ошибка записи просмотра',
            details: error.message 
        });
    }
});

// GET - получить статистику story
router.get('/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Получаем story
        const storyDoc = await db.collection('stories').doc(id).get();
        if (!storyDoc.exists) {
            return res.status(404).json({ error: 'Story не найдена' });
        }
        
        // Получаем все просмотры
        const viewsSnapshot = await db.collection('storyViews')
            .where('storyId', '==', id)
            .get();
        
        const totalViews = viewsSnapshot.size;
        const uniqueViews = new Set();
        
        viewsSnapshot.forEach(doc => {
            const data = doc.data();
            const identifier = data.userId || data.sessionId;
            uniqueViews.add(identifier);
        });
        
        res.json({
            storyId: id,
            totalViews,
            uniqueViews: uniqueViews.size,
            story: storyDoc.data()
        });
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({ 
            error: 'Ошибка получения статистики',
            details: error.message 
        });
    }
});

// POST - клонировать story
router.post('/:id/clone', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Получаем оригинальную story
        const originalDoc = await db.collection('stories').doc(id).get();
        if (!originalDoc.exists) {
            return res.status(404).json({ error: 'Story для клонирования не найдена' });
        }
        
        const originalData = originalDoc.data();
        
        // Создаем клон
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        const cloneData = {
            ...originalData,
            title: `${originalData.title} (копия)`,
            viewCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            publishAt: now,
            expiresAt: expiresAt,
            isActive: false // клон создается неактивным
        };
        
        delete cloneData.id; // убираем id оригинала
        
        const docRef = await db.collection('stories').add(cloneData);
        
        res.status(201).json({
            id: docRef.id,
            ...cloneData,
            createdAt: now.toISOString(),
            publishAt: now.toISOString(),
            expiresAt: expiresAt.toISOString()
        });
    } catch (error) {
        console.error('Ошибка клонирования story:', error);
        res.status(500).json({ 
            error: 'Ошибка клонирования story',
            details: error.message 
        });
    }
});

module.exports = router;
